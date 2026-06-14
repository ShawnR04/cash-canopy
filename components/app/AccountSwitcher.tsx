"use client";

import { logoutAllUsers } from "@/app/actions/logout";
import { removeAccount, switchAccount } from "@/app/actions/sessions";
import type { AccountSession } from "@/lib/auth/types";
import { Check, LogOut, Plus, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

interface AccountSwitcherProps {
  accounts: AccountSession[];
  activeTab: string;
}

export default function AccountSwitcher({
  accounts,
  activeTab,
}: AccountSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingSessionId, setPendingSessionId] =
    useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close when tab changes
  useEffect(() => {
    setIsOpen(false);
  }, [activeTab]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );
    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const handleSwitch = async (
    sessionId: string
  ) => {
    setPendingSessionId(sessionId);

    const result = await switchAccount(
      sessionId
    );

    setPendingSessionId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setIsOpen(false);
    router.refresh();
  };

  const handleRemove = async (
    sessionId: string
  ) => {
    setPendingSessionId(sessionId);

    const result = await removeAccount(
      sessionId
    );

    setPendingSessionId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (accounts.length === 1) {
      router.push("/authentication/login");
    } else {
      router.refresh();
    }
  };

  const handleLogoutAll = async () => {
    const result = await logoutAllUsers();

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    router.push("/authentication/login");
    router.refresh();
  };

  return (
    <div
      ref={dropdownRef}
      className="relative w-full"
    >
      <button
        type="button"
        onClick={() =>
          setIsOpen((open) => !open)
        }
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
      >
        <Users className="size-4" />
        Switch account
      </button>

      {isOpen && (
        <div className="absolute left-[-120px] top-10 z-50 w-full min-w-56 rounded-lg border bg-popover p-2 text-popover-foreground shadow-lg">
          <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
            Signed-in accounts
          </p>

          <div className="space-y-1">
            {accounts.map((account) => (
              <div
                key={account.sessionId}
                className="flex items-center gap-1 rounded-md hover:bg-accent"
              >
                <button
                  type="button"
                  disabled={
                    pendingSessionId !==
                      null ||
                    account.isActive
                  }
                  onClick={() =>
                    handleSwitch(
                      account.sessionId
                    )
                  }
                  className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left disabled:cursor-default"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary uppercase">
                    {account.username.slice(
                      0,
                      1
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {account.username}
                    </span>

                    <span className="block truncate text-xs text-muted-foreground">
                      {account.email}
                    </span>
                  </span>

                  {account.isActive && (
                    <Check className="size-4 text-primary" />
                  )}
                </button>

                <button
                  type="button"
                  disabled={
                    pendingSessionId !== null
                  }
                  onClick={() =>
                    handleRemove(
                      account.sessionId
                    )
                  }
                  className="mr-1 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove ${account.username}`}
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-2 border-t pt-2">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/authentication/login?addAccount=1"
                )
              }
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
            >
              <Plus className="size-4" />
              Add another account
            </button>

            <button
              type="button"
              onClick={handleLogoutAll}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Log out all accounts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}