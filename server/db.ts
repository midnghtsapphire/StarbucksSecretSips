import { eq, desc, asc, and, like, or, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, recipes, favorites, votes,
  aiCreations, tokenTransactions, supportTickets, auditLogs,
  type Recipe, type InsertRecipe
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── User helpers ──
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: { tasteProfile?: any; dietaryPrefs?: any; allergyFlags?: any; accessibilityMode?: string; stripeCustomerId?: string; stripeSubscriptionId?: string | null; subscriptionTier?: "free" | "starter" | "pro" | "enterprise" }) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getUserByStripeCustomerId(customerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
  return result[0];
}

export async function getUserTokens(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ tokens: users.tokens }).from(users).where(eq(users.id, userId)).limit(1);
  return result[0]?.tokens ?? 0;
}

export async function deductTokens(userId: number, amount: number, description: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const current = await getUserTokens(userId);
  if (current < amount) throw new Error("Insufficient tokens");
  await db.update(users).set({ tokens: current - amount }).where(eq(users.id, userId));
  await db.insert(tokenTransactions).values({ userId, amount: -amount, type: "usage", description });
}

export async function addTokens(userId: number, amount: number, type: "purchase" | "bonus" | "refund", description: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const current = await getUserTokens(userId);
  await db.update(users).set({ tokens: current + amount }).where(eq(users.id, userId));
  await db.insert(tokenTransactions).values({ userId, amount, type, description });
}

// ── Recipe helpers ──
export async function getRecipes(opts: { category?: string; search?: string; limit?: number; offset?: number; userId?: number; onlyPublic?: boolean; sortBy?: string }) {
  const db = await getDb();
  if (!db) return { recipes: [], total: 0 };
  const conditions = [];
  if (opts.onlyPublic !== false) conditions.push(eq(recipes.isPublic, true));
  if (opts.category && opts.category !== "All") conditions.push(eq(recipes.category, opts.category));
  if (opts.search) conditions.push(or(like(recipes.name, `%${opts.search}%`), like(recipes.description, `%${opts.search}%`)));
  if (opts.userId) conditions.push(eq(recipes.userId, opts.userId));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const orderBy = opts.sortBy === "popular" ? desc(recipes.upvotes) : opts.sortBy === "oldest" ? asc(recipes.createdAt) : desc(recipes.createdAt);
  const [items, countResult] = await Promise.all([
    db.select().from(recipes).where(where).orderBy(orderBy).limit(opts.limit ?? 24).offset(opts.offset ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(recipes).where(where),
  ]);
  return { recipes: items, total: countResult[0]?.count ?? 0 };
}

export async function getRecipeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createRecipe(data: InsertRecipe) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(recipes).values(data);
  return result[0].insertId;
}

export async function updateRecipe(id: number, data: Partial<InsertRecipe>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(recipes).set(data).where(eq(recipes.id, id));
}

export async function deleteRecipe(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(recipes).where(eq(recipes.id, id));
}

export async function incrementRecipeView(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(recipes).set({ viewCount: sql`${recipes.viewCount} + 1` }).where(eq(recipes.id, id));
}

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ category: recipes.category }).from(recipes).where(eq(recipes.isPublic, true));
  return result.map(r => r.category);
}

export async function getTrendingRecipes(limit = 8) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(recipes).where(and(eq(recipes.isPublic, true), eq(recipes.isTrending, true))).orderBy(desc(recipes.upvotes)).limit(limit);
}

// ── Favorites ──
export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const favs = await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
  if (favs.length === 0) return [];
  const recipeIds = favs.map(f => f.recipeId);
  const recipeList = await db.select().from(recipes).where(inArray(recipes.id, recipeIds));
  return favs.map(f => ({ ...f, recipe: recipeList.find(r => r.id === f.recipeId) }));
}

export async function toggleFavorite(userId: number, recipeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.recipeId, recipeId))).limit(1);
  if (existing.length > 0) {
    await db.delete(favorites).where(eq(favorites.id, existing[0].id));
    await db.update(recipes).set({ saveCount: sql`GREATEST(${recipes.saveCount} - 1, 0)` }).where(eq(recipes.id, recipeId));
    return false;
  }
  await db.insert(favorites).values({ userId, recipeId });
  await db.update(recipes).set({ saveCount: sql`${recipes.saveCount} + 1` }).where(eq(recipes.id, recipeId));
  return true;
}

export async function isFavorite(userId: number, recipeId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.recipeId, recipeId))).limit(1);
  return result.length > 0;
}

// ── Votes ──
export async function castVote(userId: number, recipeId: number, voteType: "up" | "down") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(votes).where(and(eq(votes.userId, userId), eq(votes.recipeId, recipeId))).limit(1);
  if (existing.length > 0) {
    if (existing[0].voteType === voteType) {
      await db.delete(votes).where(eq(votes.id, existing[0].id));
      if (voteType === "up") await db.update(recipes).set({ upvotes: sql`GREATEST(${recipes.upvotes} - 1, 0)` }).where(eq(recipes.id, recipeId));
      else await db.update(recipes).set({ downvotes: sql`GREATEST(${recipes.downvotes} - 1, 0)` }).where(eq(recipes.id, recipeId));
      return null;
    }
    await db.update(votes).set({ voteType }).where(eq(votes.id, existing[0].id));
    if (voteType === "up") {
      await db.update(recipes).set({ upvotes: sql`${recipes.upvotes} + 1`, downvotes: sql`GREATEST(${recipes.downvotes} - 1, 0)` }).where(eq(recipes.id, recipeId));
    } else {
      await db.update(recipes).set({ downvotes: sql`${recipes.downvotes} + 1`, upvotes: sql`GREATEST(${recipes.upvotes} - 1, 0)` }).where(eq(recipes.id, recipeId));
    }
    return voteType;
  }
  await db.insert(votes).values({ userId, recipeId, voteType });
  if (voteType === "up") await db.update(recipes).set({ upvotes: sql`${recipes.upvotes} + 1` }).where(eq(recipes.id, recipeId));
  else await db.update(recipes).set({ downvotes: sql`${recipes.downvotes} + 1` }).where(eq(recipes.id, recipeId));
  return voteType;
}

export async function getUserVote(userId: number, recipeId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(votes).where(and(eq(votes.userId, userId), eq(votes.recipeId, recipeId))).limit(1);
  return result[0]?.voteType ?? null;
}

// ── Support ──
export async function createSupportTicket(userId: number, subject: string, message: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(supportTickets).values({ userId, subject, message });
}

export async function getSupportTickets(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (userId) return db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
  return db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
}

export async function updateTicketStatus(id: number, status: "open" | "in_progress" | "resolved" | "closed", adminResponse?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const data: any = { status };
  if (adminResponse) data.adminResponse = adminResponse;
  await db.update(supportTickets).set(data).where(eq(supportTickets.id, id));
}

// ── Admin ──
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalRecipes: 0, totalVotes: 0, totalFavorites: 0 };
  const [u, r, v, f] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(recipes),
    db.select({ count: sql<number>`count(*)` }).from(votes),
    db.select({ count: sql<number>`count(*)` }).from(favorites),
  ]);
  return { totalUsers: u[0]?.count ?? 0, totalRecipes: r[0]?.count ?? 0, totalVotes: v[0]?.count ?? 0, totalFavorites: f[0]?.count ?? 0 };
}

export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function logAudit(userId: number | null, action: string, tableName?: string, recordId?: number, details?: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values({ userId, action, tableName, recordId, details });
}

export async function getTokenTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tokenTransactions).where(eq(tokenTransactions.userId, userId)).orderBy(desc(tokenTransactions.createdAt)).limit(50);
}
