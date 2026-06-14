import "server-only";

import { db } from "@/db";
import { sessionsTable, usersTable } from "@/db/schema";
import type { AccountSession, CurrentUser } from "@/lib/auth/types";
import {
  ACTIVE_SESSION_COOKIE,
  SESSION_IDS_COOKIE,
} from "@/lib/auth/session-cookies";
import { and, eq, gt, inArray, lt } from "drizzle-orm";
import { cookies } from "next/headers";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const LAST_USED_UPDATE_INTERVAL_MS = 5 * 60 * 1000;
const MAX_BROWSER_SESSIONS = 10;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  priority: "high" as const,
};

function parseSessionIds(value: string | undefined) {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return Array.from(
      new Set(parsed.filter((id): id is string => typeof id === "string" && id.length > 0)),
    ).slice(-MAX_BROWSER_SESSIONS);
  } catch {
    return [];
  }
}

async function readBrowserSessionState() {
  const cookieStore = await cookies();
  return {
    cookieStore,
    sessionIds: parseSessionIds(cookieStore.get(SESSION_IDS_COOKIE)?.value),
    activeSessionId: cookieStore.get(ACTIVE_SESSION_COOKIE)?.value ?? null,
  };
}

function writeBrowserSessionState(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  sessionIds: string[],
  activeSessionId: string | null,
) {
  if (sessionIds.length === 0 || !activeSessionId) {
    cookieStore.delete(SESSION_IDS_COOKIE);
    cookieStore.delete(ACTIVE_SESSION_COOKIE);
    cookieStore.delete("session_token");
    return;
  }

  cookieStore.set(SESSION_IDS_COOKIE, JSON.stringify(sessionIds), cookieOptions);
  cookieStore.set(ACTIVE_SESSION_COOKIE, activeSessionId, cookieOptions);
  cookieStore.delete("session_token");
}

export async function createSession(userId: string) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
  const sessionId = crypto.randomUUID();

  const { cookieStore, sessionIds } = await readBrowserSessionState();
  let retainedSessionIds = sessionIds;
  let duplicateIds: string[] = [];

  if (sessionIds.length > 0) {
    const duplicateAccountSessions = await db
      .select({ id: sessionsTable.id })
      .from(sessionsTable)
      .where(
        and(
          inArray(sessionsTable.id, sessionIds),
          eq(sessionsTable.userId, userId),
        ),
      );

    duplicateIds = duplicateAccountSessions.map((session) => session.id);
    if (duplicateIds.length > 0) {
      const duplicateIdSet = new Set(duplicateIds);
      retainedSessionIds = sessionIds.filter((id) => !duplicateIdSet.has(id));
    }
  }

  const nextSessionIds = [...retainedSessionIds, sessionId].slice(-MAX_BROWSER_SESSIONS);
  const nextSessionIdSet = new Set(nextSessionIds);
  const overflowIds = retainedSessionIds.filter((id) => !nextSessionIdSet.has(id));
  const revokedIds = [...duplicateIds, ...overflowIds];

  await db.transaction(async (tx) => {
    if (revokedIds.length > 0) {
      await tx.delete(sessionsTable).where(inArray(sessionsTable.id, revokedIds));
    }

    await tx.insert(sessionsTable).values({
      id: sessionId,
      userId,
      createdAt: now,
      expiresAt,
      lastUsedAt: now,
    });
  });

  writeBrowserSessionState(cookieStore, nextSessionIds, sessionId);
  return { id: sessionId, userId, createdAt: now, expiresAt, lastUsedAt: now };
}

export async function getCurrentSession() {
  const { sessionIds, activeSessionId } = await readBrowserSessionState();
  if (!activeSessionId || !sessionIds.includes(activeSessionId)) return null;

  const now = new Date();
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.id, activeSessionId),
        gt(sessionsTable.expiresAt, now),
      ),
    )
    .limit(1);

  if (!session) return null;

  if (now.getTime() - session.lastUsedAt.getTime() >= LAST_USED_UPDATE_INTERVAL_MS) {
    await db
      .update(sessionsTable)
      .set({ lastUsedAt: now })
      .where(eq(sessionsTable.id, session.id));
    session.lastUsedAt = now;
  }

  return session;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getCurrentSession();
  if (!session) return null;

  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      username: usersTable.username,
      email: usersTable.email,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1);

  return user ?? null;
}

export async function getAccountSessions(): Promise<AccountSession[]> {
  const { sessionIds, activeSessionId } = await readBrowserSessionState();
  if (sessionIds.length === 0) return [];

  const rows = await db
    .select({
      sessionId: sessionsTable.id,
      userId: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      expiresAt: sessionsTable.expiresAt,
      lastUsedAt: sessionsTable.lastUsedAt,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
    .where(
      and(
        inArray(sessionsTable.id, sessionIds),
        gt(sessionsTable.expiresAt, new Date()),
      ),
    );

  const byId = new Map(rows.map((row) => [row.sessionId, row]));
  return sessionIds.flatMap((sessionId) => {
    const row = byId.get(sessionId);
    return row ? [{ ...row, isActive: sessionId === activeSessionId }] : [];
  });
}

export async function switchSession(sessionId: string) {
  const { cookieStore, sessionIds } = await readBrowserSessionState();
  if (!sessionIds.includes(sessionId)) return false;

  const [session] = await db
    .select({ id: sessionsTable.id })
    .from(sessionsTable)
    .where(
      and(eq(sessionsTable.id, sessionId), gt(sessionsTable.expiresAt, new Date())),
    )
    .limit(1);

  if (!session) return false;

  writeBrowserSessionState(cookieStore, sessionIds, sessionId);
  await db
    .update(sessionsTable)
    .set({ lastUsedAt: new Date() })
    .where(eq(sessionsTable.id, sessionId));
  return true;
}

export async function removeSession(sessionId: string) {
  const { cookieStore, sessionIds, activeSessionId } = await readBrowserSessionState();
  if (!sessionIds.includes(sessionId)) return false;

  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));

  const nextSessionIds = sessionIds.filter((id) => id !== sessionId);
  const nextActiveSessionId =
    activeSessionId === sessionId
      ? (nextSessionIds.at(-1) ?? null)
      : activeSessionId && nextSessionIds.includes(activeSessionId)
        ? activeSessionId
        : (nextSessionIds.at(-1) ?? null);

  writeBrowserSessionState(cookieStore, nextSessionIds, nextActiveSessionId);
  return true;
}

export async function logoutCurrentSession() {
  const { activeSessionId } = await readBrowserSessionState();
  if (!activeSessionId) return false;
  return removeSession(activeSessionId);
}

export async function logoutAllSessions() {
  const { cookieStore, sessionIds } = await readBrowserSessionState();
  if (sessionIds.length > 0) {
    await db.delete(sessionsTable).where(inArray(sessionsTable.id, sessionIds));
  }
  writeBrowserSessionState(cookieStore, [], null);
}

export async function deleteExpiredSessions() {
  await db.delete(sessionsTable).where(lt(sessionsTable.expiresAt, new Date()));
}
