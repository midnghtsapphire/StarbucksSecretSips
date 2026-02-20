# Secret Sips — API Documentation

## Overview

Secret Sips uses **tRPC** for all API communication, providing end-to-end type safety between the React frontend and Express backend. All procedures are accessible under `/api/trpc`.

## Authentication

Authentication is handled via Manus OAuth. After login, a session cookie is set automatically. Protected procedures require a valid session; admin procedures additionally require `role === "admin"`.

## Procedure Reference

### auth

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `auth.me` | Query | Public | Returns the current user object or null |
| `auth.logout` | Mutation | Public | Clears the session cookie |

### recipes

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `recipes.list` | Query | Public | `{ category?, search?, limit?, offset?, sortBy? }` | List public recipes with filters |
| `recipes.myRecipes` | Query | Protected | — | List current user's recipes |
| `recipes.getById` | Query | Public | `{ id: number }` | Get a single recipe (increments view count) |
| `recipes.create` | Mutation | Protected | Recipe object | Create a new recipe |
| `recipes.update` | Mutation | Protected | `{ id, ...fields }` | Update own recipe (or any if admin) |
| `recipes.delete` | Mutation | Protected | `{ id: number }` | Delete own recipe (or any if admin) |
| `recipes.categories` | Query | Public | — | List all available categories |
| `recipes.trending` | Query | Public | — | List trending recipes |

### favorites

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `favorites.list` | Query | Protected | — | List user's favorited recipes |
| `favorites.toggle` | Mutation | Protected | `{ recipeId: number }` | Toggle favorite on/off |
| `favorites.check` | Query | Protected | `{ recipeId: number }` | Check if recipe is favorited |

### votes

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `votes.cast` | Mutation | Protected | `{ recipeId, voteType: "up"\|"down" }` | Cast or change vote |
| `votes.myVote` | Query | Protected | `{ recipeId: number }` | Get user's current vote |

### ai (Blue Ocean Features)

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `ai.customizeDrink` | Mutation | Protected | Taste preferences object | AI generates a custom drink recipe (1 token) |
| `ai.extractFromUrl` | Mutation | Protected | `{ url: string }` | Extract recipe from social media URL (1 token) |
| `ai.extractFromImage` | Mutation | Protected | `{ imageBase64: string }` | Extract recipe from drink photo (1 token) |
| `ai.calculateNutrition` | Mutation | Public | `{ ingredients: [...] }` | Estimate nutrition values |
| `ai.calculatePrice` | Mutation | Public | `{ ingredients: [...] }` | Estimate Starbucks price |
| `ai.tasteMatch` | Mutation | Protected | Taste preferences | Match user to existing recipes |

### tokens

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `tokens.balance` | Query | Protected | — | Get current token balance |
| `tokens.history` | Query | Protected | — | Get token transaction history |
| `tokens.purchaseTokens` | Mutation | Protected | `{ packId, origin }` | Create Stripe checkout for token pack |
| `tokens.purchaseSubscription` | Mutation | Protected | `{ planId, origin }` | Create Stripe checkout for subscription |

### profile

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `profile.update` | Mutation | Protected | Profile fields | Update taste profile, dietary prefs, accessibility |

### support

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `support.create` | Mutation | Protected | `{ type?, subject, message }` | Submit a support ticket |
| `support.myTickets` | Query | Protected | — | List user's support tickets |

### admin

All admin procedures require `role === "admin"`.

| Procedure | Type | Input | Description |
|---|---|---|---|
| `admin.stats` | Query | — | Get platform statistics |
| `admin.users` | Query | `{ limit?, offset? }` | List all users |
| `admin.allRecipes` | Query | `{ limit?, offset?, search? }` | List all recipes (including hidden) |
| `admin.allTickets` | Query | — | List all support tickets |
| `admin.updateTicket` | Mutation | `{ id, status, adminResponse? }` | Update ticket status |
| `admin.toggleRecipePublic` | Mutation | `{ id, isPublic }` | Show/hide a recipe |
| `admin.toggleRecipeTrending` | Mutation | `{ id, isTrending }` | Mark recipe as trending |
| `admin.deleteRecipe` | Mutation | `{ id }` | Delete any recipe |
| `admin.addTokens` | Mutation | `{ userId, amount, reason }` | Grant bonus tokens |

## Webhook Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/stripe/webhook` | POST | Stripe webhook handler for payment events |
| `/api/oauth/callback` | GET | Manus OAuth callback |

## Error Handling

All tRPC procedures return typed errors. Common error codes include `UNAUTHORIZED` (not logged in), `FORBIDDEN` (insufficient permissions), and `BAD_REQUEST` (invalid input). Token-related operations throw descriptive errors when balance is insufficient.
