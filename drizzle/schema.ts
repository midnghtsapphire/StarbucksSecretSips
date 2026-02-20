import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, float, bigint } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  tokens: int("tokens").default(10).notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "starter", "pro", "enterprise"]).default("free").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  tasteProfile: json("tasteProfile"),
  dietaryPrefs: json("dietaryPrefs"),
  allergyFlags: json("allergyFlags"),
  accessibilityMode: varchar("accessibilityMode", { length: 32 }).default("default"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const recipes = mysqlTable("recipes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 500 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).default("Viral Today").notNull(),
  imageUrl: text("imageUrl"),
  images: json("images"),
  instructions: text("instructions"),
  ingredients: json("ingredients"),
  tags: json("tags"),
  basePrice: float("basePrice"),
  calories: int("calories"),
  caffeineMg: int("caffeineMg"),
  sugarG: float("sugarG"),
  proteinG: float("proteinG"),
  fatG: float("fatG"),
  carbsG: float("carbsG"),
  isPublic: boolean("isPublic").default(true).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  isTrending: boolean("isTrending").default(false).notNull(),
  difficultyLevel: int("difficultyLevel").default(1),
  prepTimeMinutes: int("prepTimeMinutes").default(5),
  source: varchar("source", { length: 255 }),
  originalUrl: text("originalUrl"),
  baristaSteps: json("baristaSteps"),
  dietaryFlags: json("dietaryFlags"),
  allergens: json("allergens"),
  season: varchar("season", { length: 50 }),
  upvotes: int("upvotes").default(0).notNull(),
  downvotes: int("downvotes").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  saveCount: int("saveCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recipeId: int("recipeId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recipeId: int("recipeId").notNull(),
  voteType: mysqlEnum("voteType", ["up", "down"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const aiCreations = mysqlTable("aiCreations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  prompt: text("prompt").notNull(),
  resultRecipeId: int("resultRecipeId"),
  tasteInputs: json("tasteInputs"),
  tokensUsed: int("tokensUsed").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const tokenTransactions = mysqlTable("tokenTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  type: mysqlEnum("type", ["purchase", "usage", "bonus", "refund"]).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  adminResponse: text("adminResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 255 }).notNull(),
  tableName: varchar("tableName", { length: 100 }),
  recordId: int("recordId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
