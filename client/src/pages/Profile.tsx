import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { User, Coffee, Heart, Coins, LogIn, Loader2, Calendar, Mail, Shield } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const tokenBalance = trpc.tokens.balance.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div></div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center flex-col gap-4 pt-20">
        <User className="w-16 h-16 text-muted-foreground" />
        <p className="text-xl font-medium">Sign in to view your profile</p>
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
        <div className="container max-w-2xl space-y-6">
          <Card className="glass-strong p-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.name || "User"}</h1>
                {user?.email && <p className="text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</p>}
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="glass">{user?.role === "admin" ? <><Shield className="w-3 h-3 mr-1" />Admin</> : "Member"}</Badge>
                  {user?.createdAt && <Badge variant="outline" className="glass"><Calendar className="w-3 h-3 mr-1" />Joined {new Date(user.createdAt).toLocaleDateString()}</Badge>}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="glass p-6 text-center">
              <Coins className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <div className="text-2xl font-bold">{tokenBalance.data?.tokens ?? 0}</div>
              <div className="text-sm text-muted-foreground">AI Tokens</div>
            </Card>
            <Card className="glass p-6 text-center">
              <Coffee className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold">—</div>
              <div className="text-sm text-muted-foreground">Recipes Created</div>
            </Card>
            <Card className="glass p-6 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-pink-400" />
              <div className="text-2xl font-bold">—</div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </Card>
          </div>

          <Card className="glass p-6 space-y-4">
            <h2 className="font-semibold text-lg">Token Economy</h2>
            <p className="text-sm text-muted-foreground">Tokens are used for AI features like the Drink Mixer, image extraction, and social media import. New users get 10 free tokens.</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>AI Drink Mixer</span><span className="text-muted-foreground">1 token</span></div>
              <div className="flex justify-between"><span>Image Extraction</span><span className="text-muted-foreground">1 token</span></div>
              <div className="flex justify-between"><span>Social URL Import</span><span className="text-muted-foreground">1 token</span></div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
