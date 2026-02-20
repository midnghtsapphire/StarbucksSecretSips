import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  recipes: router({
    list: publicProcedure.input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
      sortBy: z.string().optional(),
    }).optional()).query(async ({ input }) => {
      return db.getRecipes({
        category: input?.category,
        search: input?.search,
        limit: input?.limit ?? 24,
        offset: input?.offset ?? 0,
        sortBy: input?.sortBy,
        onlyPublic: true,
      });
    }),

    myRecipes: protectedProcedure.query(async ({ ctx }) => {
      return db.getRecipes({ userId: ctx.user.id, onlyPublic: false });
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const recipe = await db.getRecipeById(input.id);
      if (recipe) await db.incrementRecipeView(input.id);
      return recipe;
    }),

    create: protectedProcedure.input(z.object({
      name: z.string().min(1).max(500),
      description: z.string().optional(),
      category: z.string().default("Viral Today"),
      imageUrl: z.string().optional(),
      images: z.array(z.string()).optional(),
      instructions: z.string().optional(),
      ingredients: z.array(z.object({ name: z.string(), quantity: z.string().optional(), type: z.string().optional() })).optional(),
      tags: z.array(z.string()).optional(),
      basePrice: z.number().optional(),
      calories: z.number().optional(),
      caffeineMg: z.number().optional(),
      sugarG: z.number().optional(),
      proteinG: z.number().optional(),
      fatG: z.number().optional(),
      carbsG: z.number().optional(),
      difficultyLevel: z.number().min(1).max(5).optional(),
      prepTimeMinutes: z.number().optional(),
      source: z.string().optional(),
      originalUrl: z.string().optional(),
      baristaSteps: z.array(z.string()).optional(),
      dietaryFlags: z.array(z.string()).optional(),
      allergens: z.array(z.string()).optional(),
      season: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createRecipe({ ...input, userId: ctx.user.id });
      return { id };
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      imageUrl: z.string().optional(),
      images: z.array(z.string()).optional(),
      instructions: z.string().optional(),
      ingredients: z.array(z.object({ name: z.string(), quantity: z.string().optional(), type: z.string().optional() })).optional(),
      tags: z.array(z.string()).optional(),
      basePrice: z.number().optional(),
      calories: z.number().optional(),
      isPublic: z.boolean().optional(),
      isTrending: z.boolean().optional(),
      baristaSteps: z.array(z.string()).optional(),
      dietaryFlags: z.array(z.string()).optional(),
      allergens: z.array(z.string()).optional(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const recipe = await db.getRecipeById(id);
      if (!recipe) throw new Error("Recipe not found");
      if (recipe.userId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
      await db.updateRecipe(id, data);
      return { success: true };
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const recipe = await db.getRecipeById(input.id);
      if (!recipe) throw new Error("Recipe not found");
      if (recipe.userId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
      await db.deleteRecipe(input.id);
      return { success: true };
    }),

    categories: publicProcedure.query(async () => {
      return db.getCategories();
    }),

    trending: publicProcedure.query(async () => {
      return db.getTrendingRecipes();
    }),
  }),

  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserFavorites(ctx.user.id);
    }),
    toggle: protectedProcedure.input(z.object({ recipeId: z.number() })).mutation(async ({ ctx, input }) => {
      const isFav = await db.toggleFavorite(ctx.user.id, input.recipeId);
      return { isFavorite: isFav };
    }),
    check: protectedProcedure.input(z.object({ recipeId: z.number() })).query(async ({ ctx, input }) => {
      return { isFavorite: await db.isFavorite(ctx.user.id, input.recipeId) };
    }),
  }),

  votes: router({
    cast: protectedProcedure.input(z.object({
      recipeId: z.number(),
      voteType: z.enum(["up", "down"]),
    })).mutation(async ({ ctx, input }) => {
      const result = await db.castVote(ctx.user.id, input.recipeId, input.voteType);
      return { currentVote: result };
    }),
    myVote: protectedProcedure.input(z.object({ recipeId: z.number() })).query(async ({ ctx, input }) => {
      return { voteType: await db.getUserVote(ctx.user.id, input.recipeId) };
    }),
  }),

  ai: router({
    customizeDrink: protectedProcedure.input(z.object({
      sweetness: z.number().min(0).max(10),
      caffeine: z.enum(["none", "low", "medium", "high", "extreme"]),
      temperature: z.enum(["iced", "blended", "hot", "warm"]),
      flavorNotes: z.array(z.string()),
      dietaryNeeds: z.array(z.string()).optional(),
      budget: z.enum(["budget", "moderate", "premium"]).optional(),
      mood: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const tokens = await db.getUserTokens(ctx.user.id);
      if (tokens < 1) throw new Error("Insufficient tokens. Please purchase more tokens to use AI features.");
      const prompt = `You are a Starbucks secret menu drink creation expert. Create a unique, creative secret menu drink recipe based on these preferences:
- Sweetness level: ${input.sweetness}/10
- Caffeine preference: ${input.caffeine}
- Temperature: ${input.temperature}
- Flavor notes they love: ${input.flavorNotes.join(", ")}
- Dietary needs: ${input.dietaryNeeds?.join(", ") || "none"}
- Budget: ${input.budget || "moderate"}
- Current mood: ${input.mood || "adventurous"}

Create a drink that could ACTUALLY be ordered at Starbucks using their real menu items and customizations. Include a fun creative name.

Return JSON with this exact structure:
{
  "name": "Creative Drink Name",
  "description": "A fun 1-2 sentence description",
  "category": "one of: Pretty n Pink, Mad Matchas, Blues Clues, Foam Frenzy, Mocha Magic, Budget Babe Brews, Caramel Dreams, Merry Mocha, Viral Today",
  "instructions": "Step by step how to order this at Starbucks",
  "ingredients": [{"name": "ingredient name", "quantity": "amount", "type": "base/syrup/topping/milk"}],
  "tags": ["tag1", "tag2", "tag3"],
  "basePrice": 5.75,
  "calories": 250,
  "caffeineMg": 150,
  "sugarG": 35,
  "baristaSteps": ["Step 1: Start with...", "Step 2: Ask for...", "Step 3: Add..."],
  "dietaryFlags": ["dairy-free", "etc"],
  "difficultyLevel": 2,
  "prepTimeMinutes": 3
}`;
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a Starbucks secret menu expert. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0]?.message?.content;
      const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((c: any) => c.text || "").join("") : "";
      const drinkData = JSON.parse(text);
      await db.deductTokens(ctx.user.id, 1, "AI Drink Customizer");
      const recipeId = await db.createRecipe({
        ...drinkData,
        userId: ctx.user.id,
        source: "AI Customizer",
        isPublic: true,
        images: [],
      });
      return { recipe: { ...drinkData, id: recipeId }, tokensRemaining: tokens - 1 };
    }),

    extractFromUrl: protectedProcedure.input(z.object({ url: z.string().url() })).mutation(async ({ ctx, input }) => {
      const tokens = await db.getUserTokens(ctx.user.id);
      if (tokens < 1) throw new Error("Insufficient tokens. Please purchase more tokens to use extraction features.");
      const prompt = `Extract a Starbucks secret menu drink recipe from this URL content. The URL is: ${input.url}
      
Analyze the URL and extract any drink recipe information. Return JSON:
{
  "name": "Drink Name",
  "description": "Description of the drink",
  "category": "one of: Pretty n Pink, Mad Matchas, Blues Clues, Foam Frenzy, Mocha Magic, Budget Babe Brews, Caramel Dreams, Merry Mocha, Viral Today",
  "instructions": "How to make/order it",
  "ingredients": [{"name": "ingredient", "quantity": "amount", "type": "base/syrup/topping/milk"}],
  "tags": ["tag1", "tag2"],
  "basePrice": 5.50,
  "source": "platform name",
  "originalUrl": "${input.url}"
}`;
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a recipe extraction expert. Extract drink recipes from social media posts and URLs. Always respond with valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0]?.message?.content;
      const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((c: any) => c.text || "").join("") : "";
      const recipeData = JSON.parse(text);
      await db.deductTokens(ctx.user.id, 1, "URL Recipe Extraction");
      return { recipe: recipeData, tokensRemaining: tokens - 1 };
    }),

    extractFromImage: protectedProcedure.input(z.object({ imageBase64: z.string() })).mutation(async ({ ctx, input }) => {
      const tokens = await db.getUserTokens(ctx.user.id);
      if (tokens < 1) throw new Error("Insufficient tokens. Please purchase more tokens to use extraction features.");
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a Starbucks drink recipe extraction expert. Analyze images of drinks and extract recipe information. Always respond with valid JSON." },
          {
            role: "user", content: [
              { type: "text", text: `Analyze this image and extract any Starbucks drink recipe information. Return JSON: {"name":"Drink Name","description":"Description","category":"Pretty n Pink","instructions":"How to order","ingredients":[{"name":"item","quantity":"amount","type":"base"}],"tags":["tag1"],"basePrice":5.50}` },
              { type: "image_url", image_url: { url: input.imageBase64, detail: "high" } },
            ]
          },
        ],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0]?.message?.content;
      const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((c: any) => c.text || "").join("") : "";
      const recipeData = JSON.parse(text);
      await db.deductTokens(ctx.user.id, 1, "Image Recipe Extraction");
      return { recipe: recipeData, tokensRemaining: tokens - 1 };
    }),

    calculateNutrition: publicProcedure.input(z.object({
      ingredients: z.array(z.object({ name: z.string(), quantity: z.string().optional() })),
    })).mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a nutrition calculator for Starbucks drinks. Estimate nutritional values based on ingredients. Always respond with valid JSON." },
          { role: "user", content: `Estimate the nutrition for a drink with these ingredients: ${JSON.stringify(input.ingredients)}. Return JSON: {"calories":250,"caffeineMg":150,"sugarG":35,"proteinG":5,"fatG":8,"carbsG":40}` },
        ],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0]?.message?.content;
      const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((c: any) => c.text || "").join("") : "";
      return JSON.parse(text);
    }),

    calculatePrice: publicProcedure.input(z.object({
      ingredients: z.array(z.object({ name: z.string(), quantity: z.string().optional(), type: z.string().optional() })),
    })).mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a Starbucks price estimator. Estimate the total cost of a custom drink order based on the base drink and customizations. Always respond with valid JSON." },
          { role: "user", content: `Estimate the Starbucks price for a drink with: ${JSON.stringify(input.ingredients)}. Return JSON: {"estimatedPrice":6.25,"breakdown":[{"item":"Grande Iced Latte","price":5.25},{"item":"Extra pump vanilla","price":0.50},{"item":"Oat milk sub","price":0.50}],"priceRange":{"low":5.75,"high":7.00},"tips":"Ask for light ice to get more drink"}` },
        ],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0]?.message?.content;
      const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((c: any) => c.text || "").join("") : "";
      return JSON.parse(text);
    }),

    tasteMatch: protectedProcedure.input(z.object({
      flavorPrefs: z.array(z.string()),
      avoidFlavors: z.array(z.string()).optional(),
      caffeineLevel: z.string().optional(),
      maxCalories: z.number().optional(),
      maxPrice: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { recipes: allRecipes } = await db.getRecipes({ limit: 100, sortBy: "popular" });
      const recipeList = allRecipes.map(r => ({ id: r.id, name: r.name, category: r.category, tags: r.tags, calories: r.calories, basePrice: r.basePrice }));
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a taste matching algorithm. Match user preferences to drink recipes. Always respond with valid JSON." },
          { role: "user", content: `Match these taste preferences to the best drinks from this list:
Preferences: ${JSON.stringify(input)}
Available drinks: ${JSON.stringify(recipeList)}
Return JSON: {"matches":[{"recipeId":1,"matchScore":95,"reason":"Perfect match because..."}],"suggestion":"You might also like..."}` },
        ],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0]?.message?.content;
      const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((c: any) => c.text || "").join("") : "";
      return JSON.parse(text);
    }),
  }),

  tokens: router({
    balance: protectedProcedure.query(async ({ ctx }) => {
      return { tokens: await db.getUserTokens(ctx.user.id) };
    }),
    history: protectedProcedure.query(async ({ ctx }) => {
      return db.getTokenTransactions(ctx.user.id);
    }),
    purchaseTokens: protectedProcedure.input(z.object({
      packId: z.string(),
      origin: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const { createTokenCheckout } = await import("./stripe");
      const url = await createTokenCheckout(ctx.user.id, input.packId, ctx.user.email || "", ctx.user.name || "", input.origin);
      return { checkoutUrl: url };
    }),
    purchaseSubscription: protectedProcedure.input(z.object({
      planId: z.string(),
      origin: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const { createSubscriptionCheckout } = await import("./stripe");
      const url = await createSubscriptionCheckout(ctx.user.id, input.planId, ctx.user.email || "", ctx.user.name || "", input.origin);
      return { checkoutUrl: url };
    }),
  }),

  profile: router({
    update: protectedProcedure.input(z.object({
      tasteProfile: z.any().optional(),
      dietaryPrefs: z.array(z.string()).optional(),
      allergyFlags: z.array(z.string()).optional(),
      accessibilityMode: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      await db.updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
  }),

  support: router({
    create: protectedProcedure.input(z.object({
      type: z.string().optional(),
      subject: z.string().min(1).max(500),
      message: z.string().min(1),
    })).mutation(async ({ ctx, input }) => {
      await db.createSupportTicket(ctx.user.id, input.subject, `[${input.type || "question"}] ${input.message}`);
      return { success: true };
    }),
    myTickets: protectedProcedure.query(async ({ ctx }) => {
      return db.getSupportTickets(ctx.user.id);
    }),
  }),

  admin: router({
    stats: adminProcedure.query(async () => {
      return db.getAdminStats();
    }),
    users: adminProcedure.input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      return db.getAllUsers(input?.limit, input?.offset);
    }),
    allRecipes: adminProcedure.input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      search: z.string().optional(),
    }).optional()).query(async ({ input }) => {
      return db.getRecipes({ limit: input?.limit ?? 50, offset: input?.offset ?? 0, search: input?.search, onlyPublic: false });
    }),
    allTickets: adminProcedure.query(async () => {
      return db.getSupportTickets();
    }),
    updateTicket: adminProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["open", "in_progress", "resolved", "closed"]),
      adminResponse: z.string().optional(),
    })).mutation(async ({ input }) => {
      await db.updateTicketStatus(input.id, input.status, input.adminResponse);
      return { success: true };
    }),
    toggleRecipePublic: adminProcedure.input(z.object({ id: z.number(), isPublic: z.boolean() })).mutation(async ({ input }) => {
      await db.updateRecipe(input.id, { isPublic: input.isPublic });
      return { success: true };
    }),
    toggleRecipeTrending: adminProcedure.input(z.object({ id: z.number(), isTrending: z.boolean() })).mutation(async ({ input }) => {
      await db.updateRecipe(input.id, { isTrending: input.isTrending });
      return { success: true };
    }),
    deleteRecipe: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteRecipe(input.id);
      return { success: true };
    }),
    addTokens: adminProcedure.input(z.object({ userId: z.number(), amount: z.number(), reason: z.string() })).mutation(async ({ input }) => {
      await db.addTokens(input.userId, input.amount, "bonus", input.reason);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
