import { Coffee, Heart, Github } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 mt-auto" role="contentinfo">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Coffee className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Secret Sips</span>
            </div>
            <p className="text-sm text-muted-foreground">THE go-to platform for Starbucks secret menu drinks and custom recipes.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Discover</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/explore" className="block hover:text-foreground transition-colors">Explore Recipes</Link>
              <Link href="/ai-customizer" className="block hover:text-foreground transition-colors">AI Drink Mixer</Link>
              <Link href="/import" className="block hover:text-foreground transition-colors">Import Recipe</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Community</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/explore?sort=popular" className="block hover:text-foreground transition-colors">Top Rated</Link>
              <Link href="/explore?category=Viral+Today" className="block hover:text-foreground transition-colors">Trending Now</Link>
              <Link href="/support" className="block hover:text-foreground transition-colors">Support</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Legal</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Not affiliated with Starbucks Corporation. All drink names are community-created.</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-1">Made with <Heart className="w-3 h-3 text-pink-500" /> by the Secret Sips community</p>
          <p>&copy; {new Date().getFullYear()} Secret Sips. FOSS-first.</p>
        </div>
      </div>
    </footer>
  );
}
