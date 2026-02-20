// Token pack products for Stripe checkout
export const TOKEN_PACKS = [
  {
    id: "tokens_10",
    name: "Sip Starter",
    description: "10 AI tokens for drink customization, extraction, and more",
    tokens: 10,
    priceInCents: 299,
    popular: false,
  },
  {
    id: "tokens_50",
    name: "Brew Master",
    description: "50 AI tokens — best value for regular creators",
    tokens: 50,
    priceInCents: 999,
    popular: true,
  },
  {
    id: "tokens_200",
    name: "Barista Elite",
    description: "200 AI tokens — unlimited creativity for power users",
    tokens: 200,
    priceInCents: 2999,
    popular: false,
  },
] as const;

export const SUBSCRIPTION_PLANS = [
  {
    id: "plan_starter",
    name: "Starter",
    tier: "starter" as const,
    description: "For casual secret menu explorers",
    priceInCents: 499,
    interval: "month" as const,
    features: ["20 AI tokens/month", "Save unlimited favorites", "Community voting", "Basic recipe import"],
  },
  {
    id: "plan_pro",
    name: "Pro",
    tier: "pro" as const,
    description: "For serious drink creators",
    priceInCents: 1299,
    interval: "month" as const,
    features: ["100 AI tokens/month", "Priority AI generation", "Advanced taste matching", "Unlimited imports", "No ads"],
    popular: true,
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    tier: "enterprise" as const,
    description: "For content creators and influencers",
    priceInCents: 2999,
    interval: "month" as const,
    features: ["Unlimited AI tokens", "API access", "White-label recipes", "Dedicated support", "Analytics dashboard"],
  },
] as const;
