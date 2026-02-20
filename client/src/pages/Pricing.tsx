import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Coins, Sparkles, Zap, Crown, Check, Loader2 } from "lucide-react";

const TOKEN_PACKS = [
  { id: "tokens_10", name: "Sip Starter", tokens: 10, price: "$2.99", popular: false, icon: Coins },
  { id: "tokens_50", name: "Brew Master", tokens: 50, price: "$9.99", popular: true, icon: Zap },
  { id: "tokens_200", name: "Barista Elite", tokens: 200, price: "$29.99", popular: false, icon: Crown },
];

const PLANS = [
  { id: "plan_starter", name: "Starter", price: "$4.99", interval: "/mo", features: ["20 AI tokens/month", "Save unlimited favorites", "Community voting", "Basic recipe import"], popular: false },
  { id: "plan_pro", name: "Pro", price: "$12.99", interval: "/mo", features: ["100 AI tokens/month", "Priority AI generation", "Advanced taste matching", "Unlimited imports", "No ads"], popular: true },
  { id: "plan_enterprise", name: "Enterprise", price: "$29.99", interval: "/mo", features: ["Unlimited AI tokens", "API access", "White-label recipes", "Dedicated support", "Analytics dashboard"], popular: false },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const purchaseTokens = trpc.tokens.purchaseTokens.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.info("Redirecting to checkout...");
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (err) => toast.error(err.message),
  });
  const purchaseSub = trpc.tokens.purchaseSubscription.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.info("Redirecting to checkout...");
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleBuyTokens = (packId: string) => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    purchaseTokens.mutate({ packId, origin: window.location.origin });
  };

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    purchaseSub.mutate({ planId, origin: window.location.origin });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-20 pb-16 flex-1">
        <div className="container max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="glass"><Sparkles className="w-3 h-3 mr-1" />Pricing</Badge>
            <h1 className="text-4xl font-bold">Fuel Your Creativity</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Get tokens to power AI drink creation, recipe extraction, and taste matching. Start free with 10 tokens.</p>
          </div>

          {/* Token Packs */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Token Packs</h2>
            <p className="text-center text-muted-foreground">One-time purchase. Use tokens for any AI feature.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TOKEN_PACKS.map(pack => {
                const Icon = pack.icon;
                return (
                  <Card key={pack.id} className={`glass p-6 text-center space-y-4 relative ${pack.popular ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20" : ""}`}>
                    {pack.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0">Most Popular</Badge>}
                    <Icon className="w-10 h-10 mx-auto text-purple-400" />
                    <h3 className="text-xl font-bold">{pack.name}</h3>
                    <div className="text-3xl font-bold">{pack.price}</div>
                    <p className="text-muted-foreground">{pack.tokens} AI tokens</p>
                    <Button className={`w-full ${pack.popular ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0" : "glass"}`} onClick={() => handleBuyTokens(pack.id)} disabled={purchaseTokens.isPending}>
                      {purchaseTokens.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buy Now"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Subscription Plans */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Subscription Plans</h2>
            <p className="text-center text-muted-foreground">Monthly plans with recurring tokens and premium features.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map(plan => (
                <Card key={plan.id} className={`glass p-6 space-y-4 relative ${plan.popular ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20" : ""}`}>
                  {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0">Best Value</Badge>}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div><span className="text-3xl font-bold">{plan.price}</span><span className="text-muted-foreground">{plan.interval}</span></div>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.popular ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0" : "glass"}`} onClick={() => handleSubscribe(plan.id)} disabled={purchaseSub.isPending}>
                    {purchaseSub.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
                  </Button>
                </Card>
              ))}
            </div>
          </section>

          <Card className="glass p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Test payments with card: <code className="bg-muted px-2 py-0.5 rounded">4242 4242 4242 4242</code></p>
            <p className="text-xs text-muted-foreground">Powered by Stripe. Secure payment processing.</p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
