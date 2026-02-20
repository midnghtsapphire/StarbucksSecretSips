# Secret Sips — Data Schema

## Entity Relationship Overview

The database uses MySQL/TiDB with Drizzle ORM for type-safe schema management. All timestamps are stored as UTC and converted to local time on the frontend.

## Tables

### users

The central user table backing authentication and profile data.

| Column | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Surrogate primary key |
| openId | VARCHAR(64) | Manus OAuth identifier, unique per user |
| name | TEXT | Display name |
| email | VARCHAR(320) | Email address |
| loginMethod | VARCHAR(64) | OAuth provider used |
| role | ENUM(user, admin) | Access level; admin auto-assigned to owner |
| tokens | INT | AI token balance (default: 10) |
| subscriptionTier | ENUM(free, starter, pro, enterprise) | Current subscription level |
| stripeCustomerId | VARCHAR(255) | Stripe customer reference |
| stripeSubscriptionId | VARCHAR(255) | Active Stripe subscription reference |
| tasteProfile | JSON | User's taste preferences for AI matching |
| dietaryPrefs | JSON | Dietary restrictions (vegan, dairy-free, etc.) |
| allergyFlags | JSON | Known allergens to avoid |
| accessibilityMode | VARCHAR(32) | Active accessibility mode |
| createdAt | TIMESTAMP | Account creation time |
| updatedAt | TIMESTAMP | Last profile update |
| lastSignedIn | TIMESTAMP | Most recent login |

### recipes

The core content table storing all drink recipes.

| Column | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Recipe identifier |
| userId | INT (FK) | Creator's user ID |
| name | VARCHAR(500) | Recipe name |
| description | TEXT | Recipe description |
| category | VARCHAR(100) | Category (Pretty n Pink, Mad Matchas, etc.) |
| imageUrl | TEXT | Primary image URL |
| images | JSON | Array of additional image URLs |
| instructions | TEXT | How to make/order the drink |
| ingredients | JSON | Array of {name, quantity, type} objects |
| tags | JSON | Searchable tags array |
| basePrice | FLOAT | Estimated price in USD |
| calories | INT | Estimated calorie count |
| caffeineMg | INT | Caffeine content in milligrams |
| sugarG | FLOAT | Sugar content in grams |
| proteinG | FLOAT | Protein in grams |
| fatG | FLOAT | Fat in grams |
| carbsG | FLOAT | Carbohydrates in grams |
| isPublic | BOOLEAN | Visibility flag |
| isVerified | BOOLEAN | Admin-verified flag |
| isTrending | BOOLEAN | Featured/trending flag |
| difficultyLevel | INT | Ordering difficulty (1-5) |
| prepTimeMinutes | INT | Estimated preparation time |
| source | VARCHAR(255) | Origin (manual, AI Customizer, URL import, image) |
| originalUrl | TEXT | Source URL if imported |
| baristaSteps | JSON | Step-by-step ordering instructions |
| dietaryFlags | JSON | Dietary compatibility flags |
| allergens | JSON | Known allergens present |
| season | VARCHAR(50) | Seasonal relevance |
| upvotes | INT | Community upvote count |
| downvotes | INT | Community downvote count |
| viewCount | INT | Total views |
| saveCount | INT | Times saved to favorites |
| createdAt | TIMESTAMP | Creation time |
| updatedAt | TIMESTAMP | Last update time |

### favorites

Junction table linking users to their saved recipes.

| Column | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Record identifier |
| userId | INT (FK) | User who favorited |
| recipeId | INT (FK) | Recipe that was favorited |
| createdAt | TIMESTAMP | When favorited |

### votes

Tracks community voting on recipes. Each user can have one vote per recipe.

| Column | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Record identifier |
| userId | INT (FK) | Voter's user ID |
| recipeId | INT (FK) | Recipe being voted on |
| voteType | ENUM(up, down) | Vote direction |
| createdAt | TIMESTAMP | When voted |

### aiCreations

Audit log for AI-generated drink recipes.

| Column | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Record identifier |
| userId | INT (FK) | User who triggered AI |
| prompt | TEXT | The generation prompt |
| resultRecipeId | INT (FK) | Resulting recipe ID |
| tasteInputs | JSON | User's taste preferences used |
| tokensUsed | INT | Tokens consumed |
| createdAt | TIMESTAMP | Generation time |

### tokenTransactions

Ledger of all token movements (purchases, usage, bonuses, refunds).

| Column | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Transaction identifier |
| userId | INT (FK) | Account holder |
| amount | INT | Token delta (positive = credit, negative = debit) |
| type | ENUM(purchase, usage, bonus, refund) | Transaction category |
| description | TEXT | Human-readable description |
| createdAt | TIMESTAMP | Transaction time |

### supportTickets

Customer support ticket tracking.

| Column | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Ticket identifier |
| userId | INT (FK) | Submitter's user ID |
| subject | VARCHAR(500) | Ticket subject line |
| message | TEXT | Ticket body |
| status | ENUM(open, in_progress, resolved, closed) | Current status |
| priority | ENUM(low, medium, high) | Priority level |
| adminResponse | TEXT | Admin's response |
| createdAt | TIMESTAMP | Submission time |
| updatedAt | TIMESTAMP | Last status change |

### auditLogs

System-wide audit trail for administrative actions.

| Column | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Log entry identifier |
| userId | INT (FK) | Actor's user ID |
| action | VARCHAR(255) | Action performed |
| tableName | VARCHAR(100) | Affected table |
| recordId | INT | Affected record ID |
| details | JSON | Additional context |
| createdAt | TIMESTAMP | Action time |
