import Stripe from "stripe";
import { Router, raw } from "express";
import { ENV } from "./_core/env";
import * as db from "./db";
import { TOKEN_PACKS, SUBSCRIPTION_PLANS } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const stripeRouter = Router();

// Webhook must use raw body for signature verification
stripeRouter.post("/api/stripe/webhook", raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.user_id || "0");
        const packId = session.metadata?.pack_id;
        const planId = session.metadata?.plan_id;

        if (userId && packId) {
          // Token purchase
          const pack = TOKEN_PACKS.find(p => p.id === packId);
          if (pack) {
            await db.addTokens(userId, pack.tokens, "purchase", `Purchased ${pack.name} (${pack.tokens} tokens)`);
            console.log(`[Stripe] Added ${pack.tokens} tokens to user ${userId}`);
          }
        }

        if (userId && planId) {
          // Subscription
          const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
          if (plan && session.subscription) {
            await db.updateUserProfile(userId, {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              subscriptionTier: plan.tier,
            });
            // Add monthly tokens
            const monthlyTokens = plan.tier === "starter" ? 20 : plan.tier === "pro" ? 100 : 500;
            await db.addTokens(userId, monthlyTokens, "bonus", `${plan.name} subscription - monthly tokens`);
            console.log(`[Stripe] Activated ${plan.name} subscription for user ${userId}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        // Reset user to free tier
        const user = await db.getUserByStripeCustomerId(customerId);
        if (user) {
          await db.updateUserProfile(user.id, { subscriptionTier: "free", stripeSubscriptionId: null });
          console.log(`[Stripe] Cancelled subscription for user ${user.id}`);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as any;
        if (invoice.subscription && invoice.billing_reason === "subscription_cycle") {
          const customerId = (invoice.customer || "") as string;
          const user = await db.getUserByStripeCustomerId(customerId);
          if (user) {
            const tier = user.subscriptionTier;
            const monthlyTokens = tier === "starter" ? 20 : tier === "pro" ? 100 : 500;
            await db.addTokens(user.id, monthlyTokens, "bonus", `Monthly subscription renewal tokens`);
            console.log(`[Stripe] Renewed ${monthlyTokens} tokens for user ${user.id}`);
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("[Stripe Webhook] Processing error:", err);
  }

  res.json({ received: true });
});

// Create checkout session for token purchase
export async function createTokenCheckout(userId: number, packId: string, userEmail: string, userName: string, origin: string) {
  const pack = TOKEN_PACKS.find(p => p.id === packId);
  if (!pack) throw new Error("Invalid token pack");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: pack.name, description: pack.description },
        unit_amount: pack.priceInCents,
      },
      quantity: 1,
    }],
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    metadata: { user_id: userId.toString(), pack_id: packId, customer_email: userEmail, customer_name: userName },
    allow_promotion_codes: true,
    success_url: `${origin}/profile?payment=success`,
    cancel_url: `${origin}/profile?payment=cancelled`,
  });

  return session.url;
}

// Create checkout session for subscription
export async function createSubscriptionCheckout(userId: number, planId: string, userEmail: string, userName: string, origin: string) {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!plan) throw new Error("Invalid subscription plan");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: `Secret Sips ${plan.name}`, description: plan.description },
        unit_amount: plan.priceInCents,
        recurring: { interval: plan.interval },
      },
      quantity: 1,
    }],
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    metadata: { user_id: userId.toString(), plan_id: planId, customer_email: userEmail, customer_name: userName },
    allow_promotion_codes: true,
    success_url: `${origin}/profile?subscription=success`,
    cancel_url: `${origin}/profile?subscription=cancelled`,
  });

  return session.url;
}
