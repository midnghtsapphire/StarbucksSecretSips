import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DrinkCard from "@/components/DrinkCard";
import CategoryFilter from "@/components/CategoryFilter";
import { trpc } from "@/lib/trpc";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [dietaryFilter, setDietaryFilter] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  const queryInput = useMemo(() => ({
    search: search || undefined,
    category: category === "All" ? undefined : category,
    sortBy,
    limit: 24,
    offset: page * 24,
  }), [search, category, sortBy, page]);

  const { data, isLoading } = trpc.recipes.list.useQuery(queryInput);

  const dietaryOptions = ["Dairy-Free", "Sugar-Free", "Vegan", "Decaf", "Low-Cal", "Nut-Free", "Gluten-Free"];

  const toggleDietary = (flag: string) => {
    setDietaryFilter(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]);
  };

  const filteredRecipes = data?.recipes?.filter(r => {
    if (dietaryFilter.length === 0) return true;
    const flags = Array.isArray(r.dietaryFlags) ? r.dietaryFlags : [];
    return dietaryFilter.every(f => flags.includes(f));
  }) ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-20 pb-16 flex-1">
        <div className="container space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Explore Secret Menu</h1>
            <p className="text-muted-foreground">Browse hundreds of community-created secret menu drinks</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search drinks, ingredients, tags..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                className="pl-10 glass"
                aria-label="Search recipes"
              />
            </div>
            <Select value={sortBy} onValueChange={v => { setSortBy(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-40 glass">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CategoryFilter selected={category} onSelect={c => { setCategory(c); setPage(0); }} />

          <div className="flex flex-wrap gap-2" role="group" aria-label="Dietary filters">
            {dietaryOptions.map(opt => (
              <Badge
                key={opt}
                variant={dietaryFilter.includes(opt) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${dietaryFilter.includes(opt) ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0" : "glass hover:bg-accent"}`}
                onClick={() => toggleDietary(opt)}
              >
                {opt}
              </Badge>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-2xl">🍵</p>
              <p className="text-lg font-medium">No drinks found</p>
              <p className="text-muted-foreground text-sm">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{data?.total ?? 0} recipes found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.map((recipe, i) => (
                  <DrinkCard key={recipe.id} recipe={recipe} index={i} />
                ))}
              </div>
              {data && data.total > (page + 1) * 24 && (
                <div className="flex justify-center pt-8">
                  <Button variant="outline" className="glass" onClick={() => setPage(p => p + 1)}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
