import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const usersTable = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
});

export const sessionsTable = sqliteTable(
  "sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    lastUsedAt: integer("lastUsedAt", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("sessions_userId_idx").on(table.userId),
    index("sessions_expiresAt_idx").on(table.expiresAt),
  ],
);

export const transactionsTable = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .references(() => usersTable.id)
    .notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  description: text("description").notNull(),
  categoryId: integer("categoryId").references(() => categoriesTable.id),
  type: text("type").$type<"income" | "expense">().notNull(),
  amount: integer("amount").notNull(),
});

export const categoriesTable = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .references(() => usersTable.id)
    .notNull(),
  name: text("name").notNull(),
  monthly_budget: integer("monthly_budget").default(0),
  icon: text("icon").notNull(),
});

export const goalsTable = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .references(() => usersTable.id)
    .notNull(),
  name: text("name").notNull(),
  target_amount: integer("target_amount").notNull(),
  saved_amount: integer("saved_amount").default(0).notNull(),
  target_date: integer("target_date", { mode: "timestamp" }),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
  transactions: many(transactionsTable),
  categories: many(categoriesTable),
  goals: many(goalsTable),
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

export const categoriesRelations = relations(
  categoriesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [categoriesTable.userId],
      references: [usersTable.id],
    }),
    transactions: many(transactionsTable),
  }),
);

export const transactionsRelations = relations(
  transactionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [transactionsTable.userId],
      references: [usersTable.id],
    }),
    category: one(categoriesTable, {
      fields: [transactionsTable.categoryId],
      references: [categoriesTable.id],
    }),
  }),
);

export const goalsRelations = relations(goalsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [goalsTable.userId],
    references: [usersTable.id],
  }),
}));

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertSession = typeof sessionsTable.$inferInsert;
export type SelectSession = typeof sessionsTable.$inferSelect;

export type InsertTransaction = typeof transactionsTable.$inferInsert;
export type SelectTransaction = typeof transactionsTable.$inferSelect;

export type InsertCategory = typeof categoriesTable.$inferInsert;
export type SelectCategory = typeof categoriesTable.$inferSelect;

export type InsertGoal = typeof goalsTable.$inferInsert;
export type SelectGoal = typeof goalsTable.$inferSelect;
