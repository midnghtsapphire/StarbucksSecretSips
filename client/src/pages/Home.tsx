import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DrinkCard from "@/components/DrinkCard";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles, Search, Coffee, Camera, Link2, Brain, DollarSign,
  ShieldCheck, TrendingUp, ArrowRight, Zap, Heart, Star, Users
} from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const trending = trpc.recipes.trending.useQuery();

  const features = [
    { icon: Brain, title: "AI Drink Mixer", desc: "Tell us your mood and taste — AI creates your perfect secret menu drink", color: "from-purple-500 to-violet-600", href: "/ai-customizer" },
    { icon: Camera, title: "Snap to Recipe", desc: "Take a photo of any Starbucks drink and we extract the full recipe", color: "from-pink-500 to-rose-600", href: "/import" },
    { icon: Link2, title: "Social Import", desc: "Paste a TikTok, Instagram, or YouTube link — we grab the recipe", color: "from-blue-500 to-cyan-600", href: "/import" },
    { icon: DollarSign, title: "Price Calculator", desc: "Know exactly what your custom order will cost before you get to the register", color: "from-emerald-500 to-green-600", href: "/explore" },
    { icon: ShieldCheck, title: "Barista Mode", desc: "Step-by-step ordering guide — show your barista exactly what to make", color: "from-amber-500 to-orange-600", href: "/explore" },
    { icon: Users, title: "Community Votes", desc: "Upvote the best secret recipes. Top-voted drinks rise to the top", color: "from-red-500 to-pink-600", href: "/explore" },
  ];

  const stats = [
    { label: "Secret Recipes", value: "500+", icon: Coffee },
    { label: "Community Members", value: "10K+", icon: Users },
    { label: "AI Creations", value: "2K+", icon: Sparkles },
    { label: "5-Star Ratings", value: "98%", icon: Star },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden" aria-label="Hero">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-background to-pink-900/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl" />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4 px-4 py-1.5">
                <Sparkles className="w-3 h-3 mr-1" /> AI-Powered Secret Menu Platform
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            >
              Unlock the{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                Secret Menu
              </span>
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            >
              Discover, create, and share Starbucks secret menu drinks. Our AI creates custom recipes based on your taste, mood, and dietary needs.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/explore">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 shadow-lg shadow-purple-500/25 gap-2 w-full sm:w-auto">
                  <Search className="w-4 h-4" /> Explore Recipes
                </Button>
              </Link>
              <Link href="/ai-customizer">
                <Button size="lg" variant="outline" className="glass gap-2 w-full sm:w-auto">
                  <Sparkles className="w-4 h-4" /> AI Drink Mixer
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-y border-border/30" aria-label="Platform statistics">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      {trending.data && trending.data.length > 0 && (
        <section className="py-16" aria-label="Trending recipes">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-orange-400" /> Trending Now
                </h2>
                <p className="text-muted-foreground text-sm mt-1">The hottest secret menu drinks this week</p>
              </div>
              <Link href="/explore?sort=popular">
                <Button variant="ghost" className="gap-1">See All <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.data.slice(0, 4).map((recipe, i) => (
                <DrinkCard key={recipe.id} recipe={recipe} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 relative" aria-label="Platform features">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
        <div className="container relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              Not Your Average Recipe App
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Blue ocean features that no other drink platform has. We built what we wished existed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link href={feature.href}>
                  <Card className="glass p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" aria-label="Call to action">
        <div className="container">
          <Card className="glass-strong p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <Zap className="w-10 h-10 mx-auto text-amber-400" />
              <h2 className="text-2xl md:text-3xl font-bold">Ready to Discover Your Next Obsession?</h2>
              <p className="text-muted-foreground">Join thousands of secret menu enthusiasts. Create, share, and vote on the best hidden drinks.</p>
              {!isAuthenticated ? (
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 shadow-lg gap-2" onClick={() => { window.location.href = getLoginUrl(); }}>
                  <Heart className="w-4 h-4" /> Join Free — Get 10 AI Tokens
                </Button>
              ) : (
                <Link href="/ai-customizer">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 shadow-lg gap-2">
                    <Sparkles className="w-4 h-4" /> Create Your Dream Drink
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
