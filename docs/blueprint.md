# Secret Sips — Product Blueprint

## Vision

Secret Sips is **THE go-to platform for Starbucks secret menu drinks and custom recipes**. It combines community-driven recipe sharing with cutting-edge AI features that no other drink/recipe app offers. The platform empowers users to discover, create, customize, and share secret menu drinks with tools that make ordering easy and fun.

## Core Value Proposition

| Feature | What It Does | Why It's Different |
|---|---|---|
| AI Drink Mixer | Creates entirely new recipes based on taste preferences | No other app generates custom Starbucks recipes with AI |
| Barista Mode | Step-by-step ordering guide for any recipe | Eliminates ordering anxiety at the counter |
| Price Calculator | AI-estimated cost before you order | Know what you'll pay before you get to the register |
| Image Extraction | Extract recipes from photos of drinks | See a drink on social media? Import it instantly |
| Social URL Import | Extract recipes from TikTok, Instagram, etc. | One-click import from any social platform |
| Taste Match | Algorithm matches you to drinks you'll love | Personalized recommendations beyond basic filters |
| Community Voting | Upvote/downvote system for quality curation | Best recipes rise to the top organically |

## Architecture

**Frontend:** React 19 + Tailwind CSS 4 + shadcn/ui + Framer Motion
**Backend:** Express 4 + tRPC 11 + Drizzle ORM
**Database:** MySQL/TiDB (cloud-managed)
**Auth:** Manus OAuth (Google/Apple/email)
**Payments:** Stripe (test + live dual mode)
**AI:** Built-in LLM integration for drink creation, extraction, nutrition, pricing
**Storage:** S3 for image uploads
**Design:** Glassmorphism with purple-to-pink gradient identity

## Target Users

1. **Secret Menu Enthusiasts** — People who love discovering hidden Starbucks drinks
2. **Content Creators** — TikTok/Instagram creators who share drink recipes
3. **Casual Coffee Lovers** — Anyone who wants to try something new at Starbucks
4. **Budget-Conscious Drinkers** — People who want to know the cost before ordering

## Monetization

- **Token Economy** — Free users get 10 tokens; AI features cost 1 token each
- **Token Packs** — One-time purchases ($2.99 / $9.99 / $29.99)
- **Subscriptions** — Monthly plans (Starter $4.99, Pro $12.99, Enterprise $29.99)
- **Future:** Affiliate partnerships with coffee accessories, sponsored recipes

## FOSS Philosophy

This project uses exclusively free and open-source tools:
- React, Express, Tailwind CSS, shadcn/ui (all MIT/Apache licensed)
- Drizzle ORM (Apache 2.0)
- Framer Motion (MIT)
- Lucide Icons (ISC)
- No paid UI libraries, no proprietary dependencies
