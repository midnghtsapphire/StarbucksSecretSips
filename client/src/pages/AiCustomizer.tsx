import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConfettiRain from "@/components/ConfettiRain";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Coffee, Coins, ArrowRight, ChefHat, DollarSign, Flame, Zap, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const flavorOptions = ["Vanilla", "Caramel", "Chocolate", "Matcha", "Strawberry", "Lavender", "Cinnamon", "Hazelnut", "Coconut", "Mint", "Toffee", "Pumpkin", "Mango", "Peach", "Raspberry", "Brown Sugar"];
const dietaryOptions = ["Dairy-Free", "Sugar-Free", "Vegan", "Decaf", "Low-Cal", "Nut-Free"];
const moodOptions = ["Cozy & Warm", "Energized", "Treat Yourself", "Refreshed", "Adventurous", "Nostalgic", "Party Mode", "Study Session"];

export default function AiCustomizer() {
  const { isAuthenticated } = useAuth();
  const tokenBalance = trpc.tokens.balance.useQuery(undefined, { enabled: isAuthenticated });
  const [sweetness, setSweetness] = useState([5]);
  const [caffeine, setCaffeine] = useState<"none" | "low" | "medium" | "high" | "extreme">("medium");
  const [temperature, setTemperature] = useState<"iced" | "blended" | "hot" | "warm">("iced");
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [budget, setBudget] = useState<"budget" | "moderate" | "premium">("moderate");
  const [mood, setMood] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [result, setResult] = useState<any>(null);

  const customizeMutation = trpc.ai.customizeDrink.useMutation({
    onSuccess: (data) => {
      setResult(data.recipe);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast.success("Your dream drink is ready!");
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleFlavor = (f: string) => setSelectedFlavors(prev => prev.includes(f) ? prev.filter(x => x !== f) : prev.length < 5 ? [...prev, f] : prev);
  const toggleDietary = (d: string) => setSelectedDietary(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const handleCreate = () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    if (selectedFlavors.length === 0) { toast.error("Pick at least one flavor!"); return; }
    customizeMutation.mutate({
      sweetness: sweetness[0],
      caffeine,
      temperature,
      flavorNotes: selectedFlavors,
      dietaryNeeds: selectedDietary,
      budget,
      mood,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ConfettiRain active={showConfetti} />

      <main className="pt-20 pb-16 flex-1">
        <div className="container max-w-4xl space-y-8">
          <div className="text-center space-y-3">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1" /> Blue Ocean Feature
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold">AI Drink Mixer</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">Tell us your mood, taste preferences, and dietary needs — our AI creates a unique secret menu drink just for you.</p>
            {isAuthenticated && tokenBalance.data && (
              <Badge variant="outline" className="glass gap-1"><Coins className="w-3 h-3" />{tokenBalance.data.tokens} tokens remaining</Badge>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <Card className="glass p-6 space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Sweetness Level: {sweetness[0]}/10</label>
                    <Slider value={sweetness} onValueChange={setSweetness} min={0} max={10} step={1} className="w-full" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>No sugar</span><span>Sugar rush</span></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Caffeine Level</label>
                      <Select value={caffeine} onValueChange={(v: any) => setCaffeine(v)}>
                        <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Decaf)</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="extreme">Extreme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Temperature</label>
                      <Select value={temperature} onValueChange={(v: any) => setTemperature(v)}>
                        <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iced">Iced</SelectItem>
                          <SelectItem value="blended">Blended</SelectItem>
                          <SelectItem value="hot">Hot</SelectItem>
                          <SelectItem value="warm">Warm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Flavor Notes (pick up to 5)</label>
                    <div className="flex flex-wrap gap-2">
                      {flavorOptions.map(f => (
                        <Badge key={f} variant={selectedFlavors.includes(f) ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${selectedFlavors.includes(f) ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0" : "glass hover:bg-accent"}`}
                          onClick={() => toggleFlavor(f)}>{f}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Dietary Needs</label>
                    <div className="flex flex-wrap gap-2">
                      {dietaryOptions.map(d => (
                        <Badge key={d} variant={selectedDietary.includes(d) ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${selectedDietary.includes(d) ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0" : "glass hover:bg-accent"}`}
                          onClick={() => toggleDietary(d)}>{d}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Budget</label>
                      <Select value={budget} onValueChange={(v: any) => setBudget(v)}>
                        <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="budget">Budget ($3-5)</SelectItem>
                          <SelectItem value="moderate">Moderate ($5-7)</SelectItem>
                          <SelectItem value="premium">Premium ($7+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Current Mood</label>
                      <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger className="glass"><SelectValue placeholder="How are you feeling?" /></SelectTrigger>
                        <SelectContent>
                          {moodOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 shadow-lg shadow-purple-500/25 gap-2" onClick={handleCreate} disabled={customizeMutation.isPending}>
                  {customizeMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Creating your drink...</> : <><Sparkles className="w-4 h-4" />Create My Dream Drink (1 token)</>}
                </Button>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card className="glass-strong p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                      <Coffee className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">{result.name}</h2>
                    <p className="text-muted-foreground">{result.description}</p>
                    <Badge>{result.category}</Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {result.basePrice && <Card className="glass p-3 text-center"><DollarSign className="w-4 h-4 mx-auto mb-1 text-emerald-400" /><div className="font-bold">${result.basePrice}</div><div className="text-xs text-muted-foreground">Price</div></Card>}
                    {result.calories && <Card className="glass p-3 text-center"><Flame className="w-4 h-4 mx-auto mb-1 text-orange-400" /><div className="font-bold">{result.calories}</div><div className="text-xs text-muted-foreground">Calories</div></Card>}
                    {result.caffeineMg && <Card className="glass p-3 text-center"><Zap className="w-4 h-4 mx-auto mb-1 text-yellow-400" /><div className="font-bold">{result.caffeineMg}mg</div><div className="text-xs text-muted-foreground">Caffeine</div></Card>}
                    {result.difficultyLevel && <Card className="glass p-3 text-center"><ChefHat className="w-4 h-4 mx-auto mb-1 text-blue-400" /><div className="font-bold">{result.difficultyLevel}/5</div><div className="text-xs text-muted-foreground">Difficulty</div></Card>}
                  </div>

                  {result.ingredients && (
                    <div>
                      <h3 className="font-semibold mb-2">Ingredients</h3>
                      <ul className="space-y-1">{result.ingredients.map((ing: any, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" />{ing.name}{ing.quantity && <span className="text-muted-foreground">— {ing.quantity}</span>}</li>
                      ))}</ul>
                    </div>
                  )}

                  {result.baristaSteps && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-400" />How to Order (Barista Mode)</h3>
                      <ol className="space-y-2">{result.baristaSteps.map((step: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{i + 1}</div><p>{step}</p></li>
                      ))}</ol>
                    </div>
                  )}

                  {result.dietaryFlags && result.dietaryFlags.length > 0 && (
                    <div className="flex flex-wrap gap-2">{result.dietaryFlags.map((f: string) => <Badge key={f} variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">{f}</Badge>)}</div>
                  )}
                </Card>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 glass" onClick={() => setResult(null)}>Create Another</Button>
                  {result.id && <Link href={`/recipe/${result.id}`} className="flex-1"><Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 gap-2">View Full Recipe <ArrowRight className="w-4 h-4" /></Button></Link>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
