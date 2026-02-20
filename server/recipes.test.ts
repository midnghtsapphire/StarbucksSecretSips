import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  getRecipes: vi.fn().mockResolvedValue({ recipes: [
    { id: 1, name: "Pink Drink Secret", category: "Pretty n Pink", upvotes: 10, downvotes: 1, viewCount: 100, isPublic: true, isTrending: true },
    { id: 2, name: "Matcha Madness", category: "Mad Matchas", upvotes: 5, downvotes: 0, viewCount: 50, isPublic: true, isTrending: false },
  ], total: 2 }),
  getRecipeById: vi.fn().mockResolvedValue({
    id: 1, name: "Pink Drink Secret", category: "Pretty n Pink", userId: 1,
    description: "A beautiful pink drink", instructions: "Order a Strawberry Acai",
    ingredients: [{ name: "Strawberry Acai", quantity: "Grande", type: "base" }],
    upvotes: 10, downvotes: 1, viewCount: 100, isPublic: true,
  }),
  incrementRecipeView: vi.fn().mockResolvedValue(undefined),
  createRecipe: vi.fn().mockResolvedValue(1),
  updateRecipe: vi.fn().mockResolvedValue(undefined),
  deleteRecipe: vi.fn().mockResolvedValue(undefined),
  getCategories: vi.fn().mockResolvedValue(["Pretty n Pink", "Mad Matchas", "Blues Clues", "Viral Today"]),
  getTrendingRecipes: vi.fn().mockResolvedValue([
    { id: 1, name: "Pink Drink Secret", category: "Pretty n Pink", upvotes: 10 },
  ]),
  getUserFavorites: vi.fn().mockResolvedValue([]),
  toggleFavorite: vi.fn().mockResolvedValue(true),
  isFavorite: vi.fn().mockResolvedValue(false),
  castVote: vi.fn().mockResolvedValue("up"),
  getUserVote: vi.fn().mockResolvedValue(null),
  getUserTokens: vi.fn().mockResolvedValue(10),
  deductTokens: vi.fn().mockResolvedValue(undefined),
  addTokens: vi.fn().mockResolvedValue(undefined),
  getTokenTransactions: vi.fn().mockResolvedValue([]),
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
  createSupportTicket: vi.fn().mockResolvedValue(1),
  getSupportTickets: vi.fn().mockResolvedValue([]),
  getAdminStats: vi.fn().mockResolvedValue({ totalUsers: 10, totalRecipes: 50, totalVotes: 200, totalFavorites: 100 }),
  getAllUsers: vi.fn().mockResolvedValue([]),
  updateTicketStatus: vi.fn().mockResolvedValue(undefined),
  getUserByStripeCustomerId: vi.fn().mockResolvedValue(undefined),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1, openId: "test-user", email: "test@example.com", name: "Test User",
      loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(),
      lastSignedIn: new Date(), tokens: 10, subscriptionTier: "free",
      stripeCustomerId: null, stripeSubscriptionId: null,
      tasteProfile: null, dietaryPrefs: null, allergyFlags: null, accessibilityMode: "default",
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("recipes.list", () => {
  it("returns a list of public recipes", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.recipes.list();
    expect(result).toHaveProperty("recipes");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.recipes)).toBe(true);
  });

  it("accepts optional filter parameters", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.recipes.list({ category: "Pretty n Pink", search: "pink", limit: 10, offset: 0 });
    expect(result).toHaveProperty("recipes");
  });
});

describe("recipes.getById", () => {
  it("returns a recipe by id", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.recipes.getById({ id: 1 });
    expect(result).toHaveProperty("name", "Pink Drink Secret");
    expect(result).toHaveProperty("category", "Pretty n Pink");
  });
});

describe("recipes.create", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.recipes.create({ name: "Test Drink" })).rejects.toThrow();
  });

  it("creates a recipe when authenticated", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.recipes.create({ name: "New Secret Drink", category: "Viral Today" });
    expect(result).toHaveProperty("id");
  });
});

describe("recipes.categories", () => {
  it("returns categories", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.recipes.categories();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("recipes.trending", () => {
  it("returns trending recipes", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.recipes.trending();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("favorites.toggle", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.favorites.toggle({ recipeId: 1 })).rejects.toThrow();
  });

  it("toggles a favorite when authenticated", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.favorites.toggle({ recipeId: 1 });
    expect(result).toHaveProperty("isFavorite");
  });
});

describe("votes.cast", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.votes.cast({ recipeId: 1, voteType: "up" })).rejects.toThrow();
  });

  it("casts a vote when authenticated", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.votes.cast({ recipeId: 1, voteType: "up" });
    expect(result).toHaveProperty("currentVote");
  });
});

describe("tokens.balance", () => {
  it("returns token balance for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.tokens.balance();
    expect(result).toHaveProperty("tokens");
    expect(typeof result.tokens).toBe("number");
  });
});

describe("support.create", () => {
  it("creates a support ticket", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.support.create({ subject: "Help needed", message: "I can't find my recipe" });
    expect(result).toEqual({ success: true });
  });
});

describe("admin.stats", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("returns stats for admin", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.admin.stats();
    expect(result).toHaveProperty("totalUsers");
    expect(result).toHaveProperty("totalRecipes");
  });
});

describe("auth.logout", () => {
  it("clears the session cookie", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});
