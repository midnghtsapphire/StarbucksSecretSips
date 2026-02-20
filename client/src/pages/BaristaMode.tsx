import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConfettiRain from "@/components/ConfettiRain";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Coffee, ShieldCheck, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function BaristaMode() {
  const [, params] = useRoute("/barista-mode/:id");
  const id = Number(params?.id);
  const { data: recipe, isLoading } = trpc.recipes.getById.useQuery({ id }, { enabled: !!id });
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div></div>
  );

  const baristaSteps = Array.isArray(recipe?.baristaSteps) ? recipe.baristaSteps as string[] : [];
  const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients as any[] : [];

  if (!recipe || baristaSteps.length === 0) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center flex-col gap-4 pt-20">
        <ShieldCheck className="w-16 h-16 text-muted-foreground" />
        <p className="text-xl font-medium">No barista steps available</p>
        <p className="text-muted-foreground">This recipe doesn't have ordering instructions yet.</p>
        <Link href={`/recipe/${id}`}><Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Recipe</Button></Link>
      </div>
    </div>
  );

  const progress = ((currentStep + 1) / baristaSteps.length) * 100;
  const isComplete = currentStep >= baristaSteps.length;

  const handleNext = () => {
    if (currentStep < baristaSteps.length - 1) setCurrentStep(s => s + 1);
    else { setCurrentStep(baristaSteps.length); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ConfettiRain active={showConfetti} />

      <main className="pt-20 pb-16 flex-1">
        <div className="container max-w-2xl space-y-6">
          <Link href={`/recipe/${id}`}>
            <Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Recipe</Button>
          </Link>

          <div className="text-center space-y-2">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 gap-1"><ShieldCheck className="w-3 h-3" />Barista Mode</Badge>
            <h1 className="text-2xl font-bold">{recipe.name}</h1>
            <p className="text-muted-foreground text-sm">Show this to your barista or follow step-by-step</p>
          </div>

          {!isComplete && <Progress value={progress} className="h-2" />}
          {!isComplete && <p className="text-center text-sm text-muted-foreground">Step {currentStep + 1} of {baristaSteps.length}</p>}

          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div key={currentStep} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                <Card className="glass-strong p-8 text-center space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                    {currentStep + 1}
                  </div>
                  <p className="text-lg font-medium">{baristaSteps[currentStep]}</p>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="glass-strong p-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">Order Complete!</h2>
                  <p className="text-muted-foreground">Enjoy your {recipe.name}!</p>
                  {recipe.basePrice && <p className="text-lg font-bold text-emerald-400">Estimated: ${Number(recipe.basePrice).toFixed(2)}</p>}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 glass" onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0 && !isComplete}>
              <ArrowLeft className="w-4 h-4 mr-2" />{isComplete ? "Review Steps" : "Previous"}
            </Button>
            {!isComplete && (
              <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-2" onClick={handleNext}>
                {currentStep === baristaSteps.length - 1 ? "Complete" : "Next"}<ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Card className="glass p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Coffee className="w-4 h-4" />Quick Reference — Full Ingredient List</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {ingredients.map((ing: any, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {ing.name}{ing.quantity && ` — ${ing.quantity}`}
                </li>
              ))}
            </ul>
          </Card>

          <Button variant="outline" className="w-full glass gap-2" onClick={async () => {
            try { await navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); } catch { toast.error("Could not copy"); }
          }}>
            <Share2 className="w-4 h-4" />Share Barista Mode Link
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
