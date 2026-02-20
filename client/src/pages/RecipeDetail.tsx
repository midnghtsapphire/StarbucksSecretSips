import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { toast } from "sonner";
import {
  ThumbsUp, ThumbsDown, Heart, Share2, Coffee, DollarSign, Flame, Zap,
  Clock, ChefHat, Eye, ArrowLeft, Loader2, ShieldCheck, AlertTriangle
} from "lucide-react";

export default function RecipeDetail() {
  const [, params] = useRoute("/recipe/:id");
  const id = Number(params?.id);
  const { isAuthenticated, user } = useAuth();
  const utils = trpc.useUtils();

  const { data: recipe, isLoading } = trpc.recipes.getById.useQuery({ id }, { enabled: !!id });
  const favCheck = trpc.favorites.check.useQuery({ recipeId: id }, { enabled: !!id && isAuthenticated });
  const voteCheck = trpc.votes.myVote.useQuery({ recipeId: id }, { enabled: !!id && isAuthenticated });

  const toggleFav = trpc.favorites.toggle.useMutation({
    onSuccess: (data) => {
      utils.favorites.check.invalidate({ recipeId: id });
      utils.favorites.list.invalidate();
      toast.success(data.isFavorite ? "Added to favorites!" : "Removed from favorites");
    },
  });

  const castVote = trpc.votes.cast.useMutation({
    onSuccess: () => {
      utils.votes.myVote.invalidate({ recipeId: id });
      utils.recipes.getById.invalidate({ id });
    },
  });

  if (isLoading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
    </div>
  );

  if (!recipe) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center flex-col gap-4 pt-20">
        <p className="text-xl">Recipe not found</p>
        <Link href="/explore"><Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Explore</Button></Link>
      </div>
    </div>
  );

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients as any[] : [];
  const tags = Array.isArray(recipe.tags) ? recipe.tags as string[] : [];
  const baristaSteps = Array.isArray(recipe.baristaSteps) ? recipe.baristaSteps as string[] : [];
  const dietaryFlags = Array.isArray(recipe.dietaryFlags) ? recipe.dietaryFlags as string[] : [];
  const allergens = Array.isArray(recipe.allergens) ? recipe.allergens as string[] : [];

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch { toast.error("Could not copy link"); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-20 pb-16 flex-1">
        <div className="container max-w-4xl">
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="gap-2 mb-4"><ArrowLeft className="w-4 h-4" />Back</Button>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                {recipe.imageUrl ? (
                  <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Coffee className="w-24 h-24 text-purple-400/40" /></div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 glass gap-2" onClick={() => { if (!isAuthenticated) { toast.error("Sign in to vote"); return; } castVote.mutate({ recipeId: id, voteType: "up" }); }}>
                  <ThumbsUp className={`w-4 h-4 ${voteCheck.data?.voteType === "up" ? "text-green-400 fill-green-400" : ""}`} />
                  {recipe.upvotes}
                </Button>
                <Button variant="outline" className="flex-1 glass gap-2" onClick={() => { if (!isAuthenticated) { toast.error("Sign in to vote"); return; } castVote.mutate({ recipeId: id, voteType: "down" }); }}>
                  <ThumbsDown className={`w-4 h-4 ${voteCheck.data?.voteType === "down" ? "text-red-400 fill-red-400" : ""}`} />
                  {recipe.downvotes}
                </Button>
                <Button variant="outline" className="glass" onClick={() => { if (!isAuthenticated) { toast.error("Sign in to save"); return; } toggleFav.mutate({ recipeId: id }); }}>
                  <Heart className={`w-4 h-4 ${favCheck.data?.isFavorite ? "text-pink-400 fill-pink-400" : ""}`} />
                </Button>
                <Button variant="outline" className="glass" onClick={handleShare}><Share2 className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-2">{recipe.category}</Badge>
                <h1 className="text-3xl font-bold">{recipe.name}</h1>
                {recipe.description && <p className="text-muted-foreground mt-2">{recipe.description}</p>}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recipe.basePrice != null && (
                  <Card className="glass p-3 text-center">
                    <DollarSign className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <div className="font-bold">${recipe.basePrice.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Est. Price</div>
                  </Card>
                )}
                {recipe.calories != null && (
                  <Card className="glass p-3 text-center">
                    <Flame className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                    <div className="font-bold">{recipe.calories}</div>
                    <div className="text-xs text-muted-foreground">Calories</div>
                  </Card>
                )}
                {recipe.caffeineMg != null && (
                  <Card className="glass p-3 text-center">
                    <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                    <div className="font-bold">{recipe.caffeineMg}mg</div>
                    <div className="text-xs text-muted-foreground">Caffeine</div>
                  </Card>
                )}
                {recipe.prepTimeMinutes != null && (
                  <Card className="glass p-3 text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                    <div className="font-bold">{recipe.prepTimeMinutes}m</div>
                    <div className="text-xs text-muted-foreground">Prep Time</div>
                  </Card>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{recipe.viewCount} views</span>
                <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{recipe.saveCount} saves</span>
                {recipe.source && <Badge variant="outline" className="text-xs">via {recipe.source}</Badge>}
              </div>

              {dietaryFlags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {dietaryFlags.map(f => <Badge key={f} variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">{f}</Badge>)}
                </div>
              )}

              {allergens.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  {allergens.map(a => <Badge key={a} variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">{a}</Badge>)}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {ingredients.length > 0 && (
              <Card className="glass p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ChefHat className="w-5 h-5 text-purple-400" />Ingredients</h2>
                <ul className="space-y-2">
                  {ingredients.map((ing: any, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      <span className="font-medium">{ing.name}</span>
                      {ing.quantity && <span className="text-muted-foreground">— {ing.quantity}</span>}
                      {ing.type && <Badge variant="outline" className="text-xs ml-auto">{ing.type}</Badge>}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {recipe.instructions && (
              <Card className="glass p-6">
                <h2 className="text-xl font-bold mb-4">Instructions</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{recipe.instructions}</p>
              </Card>
            )}
          </div>

          {baristaSteps.length > 0 && (
            <Card className="glass p-6 mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-400" />Barista Mode</h2>
                <Link href={`/barista-mode/${recipe.id}`}>
                  <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-2">
                    <ShieldCheck className="w-4 h-4" /> Open Full Barista Mode
                  </Button>
                </Link>
              </div>
              <ol className="space-y-3">
                {baristaSteps.map((step: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{i + 1}</div>
                    <p className="pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {tags.map(tag => <Badge key={tag} variant="outline" className="glass">{tag}</Badge>)}
            </div>
          )}

          {/* JSON-LD Recipe Schema */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Recipe",
            name: recipe.name,
            description: recipe.description || `Secret Starbucks menu drink: ${recipe.name}`,
            image: recipe.imageUrl || undefined,
            recipeCategory: recipe.category,
            recipeIngredient: ingredients.map((i: any) => `${i.quantity || ""} ${i.name}`.trim()),
            recipeInstructions: recipe.instructions,
            nutrition: recipe.calories ? { "@type": "NutritionInformation", calories: `${recipe.calories} calories` } : undefined,
            aggregateRating: recipe.upvotes > 0 ? { "@type": "AggregateRating", ratingValue: Math.min(5, 3 + (recipe.upvotes / Math.max(1, recipe.upvotes + recipe.downvotes)) * 2).toFixed(1), reviewCount: recipe.upvotes + recipe.downvotes } : undefined,
          })}} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
