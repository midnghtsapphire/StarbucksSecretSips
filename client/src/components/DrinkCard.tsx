import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, TrendingUp, Eye, ThumbsUp, DollarSign, Coffee, Flame, Zap } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

const categoryColors: Record<string, string> = {
  "Pretty n Pink": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Mad Matchas": "bg-green-500/20 text-green-300 border-green-500/30",
  "Blues Clues": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Foam Frenzy": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Mocha Magic": "bg-yellow-900/20 text-yellow-200 border-yellow-700/30",
  "Budget Babe Brews": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "Caramel Dreams": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Merry Mocha": "bg-red-500/20 text-red-300 border-red-500/30",
  "Viral Today": "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const categoryEmojis: Record<string, string> = {
  "Pretty n Pink": "🌸",
  "Mad Matchas": "🍵",
  "Blues Clues": "💙",
  "Foam Frenzy": "☁️",
  "Mocha Magic": "🍫",
  "Budget Babe Brews": "💰",
  "Caramel Dreams": "🍯",
  "Merry Mocha": "🎄",
  "Viral Today": "🔥",
};

interface DrinkCardProps {
  recipe: {
    id: number;
    name: string;
    description?: string | null;
    category: string;
    imageUrl?: string | null;
    basePrice?: number | null;
    calories?: number | null;
    caffeineMg?: number | null;
    isTrending?: boolean;
    upvotes: number;
    viewCount: number;
    tags?: any;
  };
  index?: number;
}

export default function DrinkCard({ recipe, index = 0 }: DrinkCardProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const toggleFav = trpc.favorites.toggle.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      toast.success("Updated favorites!");
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error("Sign in to save favorites"); return; }
    toggleFav.mutate({ recipeId: recipe.id });
  };

  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/recipe/${recipe.id}`}>
        <Card className="group glass overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            {recipe.imageUrl ? (
              <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Coffee className="w-16 h-16 text-purple-400/50" />
              </div>
            )}
            {recipe.isTrending && (
              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 gap-1 shadow-lg">
                <TrendingUp className="w-3 h-3" /> Trending
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 hover:text-pink-400 rounded-full w-8 h-8"
              onClick={handleFavorite}
              aria-label="Toggle favorite"
            >
              <Heart className="w-4 h-4" />
            </Button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
              <Badge variant="outline" className={`text-xs ${categoryColors[recipe.category] || "bg-purple-500/20 text-purple-300"}`}>
                {categoryEmojis[recipe.category] || "✨"} {recipe.category}
              </Badge>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-purple-400 transition-colors">
              {recipe.name}
            </h3>
            {recipe.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {recipe.basePrice != null && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />${recipe.basePrice.toFixed(2)}
                </span>
              )}
              {recipe.calories != null && (
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3" />{recipe.calories} cal
                </span>
              )}
              {recipe.caffeineMg != null && (
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />{recipe.caffeineMg}mg
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{recipe.upvotes}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{recipe.viewCount}</span>
              </div>
              {tags.length > 0 && (
                <div className="flex gap-1">
                  {tags.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
