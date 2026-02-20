import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DrinkCard from "@/components/DrinkCard";
import { trpc } from "@/lib/trpc";
import { Heart, Loader2, LogIn } from "lucide-react";

export default function Favorites() {
  const { isAuthenticated, loading } = useAuth();
  const { data, isLoading } = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div></div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center flex-col gap-4 pt-20">
        <Heart className="w-16 h-16 text-muted-foreground" />
        <p className="text-xl font-medium">Sign in to see your favorites</p>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 gap-2" onClick={() => { window.location.href = getLoginUrl(); }}>
          <LogIn className="w-4 h-4" />Sign In
        </Button>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-20 pb-16 flex-1">
        <div className="container space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Heart className="w-7 h-7 text-pink-400" />My Favorites</h1>
            <p className="text-muted-foreground mt-1">Your saved secret menu drinks</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-2xl">💜</p>
              <p className="text-lg font-medium">No favorites yet</p>
              <p className="text-muted-foreground text-sm">Explore recipes and tap the heart to save them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.map((fav: any, i: number) => fav.recipe && <DrinkCard key={fav.id} recipe={fav.recipe} index={i} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
