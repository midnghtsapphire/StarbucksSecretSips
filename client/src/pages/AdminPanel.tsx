import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Shield, Users, Coffee, MessageSquare, Loader2, Trash2, Check, X, TrendingUp, Eye, Coins } from "lucide-react";

export default function AdminPanel() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div></div>
  );

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 pt-20">
          <Shield className="w-16 h-16 text-muted-foreground" />
          <p className="text-xl font-medium">Admin Access Required</p>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-20 pb-16 flex-1">
        <div className="container space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="w-7 h-7 text-purple-400" />Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Manage recipes, users, and support tickets</p>
          </div>

          <AdminStats />

          <Tabs defaultValue="recipes" className="space-y-4">
            <TabsList className="glass">
              <TabsTrigger value="recipes" className="gap-2"><Coffee className="w-4 h-4" />Recipes</TabsTrigger>
              <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" />Users</TabsTrigger>
              <TabsTrigger value="tickets" className="gap-2"><MessageSquare className="w-4 h-4" />Tickets</TabsTrigger>
            </TabsList>

            <TabsContent value="recipes"><AdminRecipes /></TabsContent>
            <TabsContent value="users"><AdminUsers /></TabsContent>
            <TabsContent value="tickets"><AdminTickets /></TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function AdminStats() {
  const { data, isLoading } = trpc.admin.stats.useQuery();
  if (isLoading || !data) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="glass p-4 text-center"><Users className="w-5 h-5 mx-auto mb-1 text-purple-400" /><div className="text-2xl font-bold">{data.totalUsers}</div><div className="text-xs text-muted-foreground">Users</div></Card>
      <Card className="glass p-4 text-center"><Coffee className="w-5 h-5 mx-auto mb-1 text-pink-400" /><div className="text-2xl font-bold">{data.totalRecipes}</div><div className="text-xs text-muted-foreground">Recipes</div></Card>
      <Card className="glass p-4 text-center"><TrendingUp className="w-5 h-5 mx-auto mb-1 text-orange-400" /><div className="text-2xl font-bold">{data.totalVotes}</div><div className="text-xs text-muted-foreground">Votes</div></Card>
      <Card className="glass p-4 text-center"><Coins className="w-5 h-5 mx-auto mb-1 text-amber-400" /><div className="text-2xl font-bold">{data.totalFavorites}</div><div className="text-xs text-muted-foreground">Favorites</div></Card>
    </div>
  );
}

function AdminRecipes() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = trpc.admin.allRecipes.useQuery({ search: search || undefined });
  const utils = trpc.useUtils();

  const toggleTrending = trpc.admin.toggleRecipeTrending.useMutation({
    onSuccess: () => { utils.admin.allRecipes.invalidate(); toast.success("Updated!"); },
  });
  const deleteRecipe = trpc.admin.deleteRecipe.useMutation({
    onSuccess: () => { utils.admin.allRecipes.invalidate(); toast.success("Deleted!"); },
  });
  const togglePublic = trpc.admin.toggleRecipePublic.useMutation({
    onSuccess: () => { utils.admin.allRecipes.invalidate(); toast.success("Updated!"); },
  });

  const recipes = data?.recipes ?? [];

  return (
    <Card className="glass p-6 space-y-4">
      <Input placeholder="Search recipes..." value={search} onChange={e => setSearch(e.target.value)} className="glass" />
      {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
        <div className="space-y-2">
          {recipes.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/30">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.name}</p>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span>{r.category}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{r.viewCount}</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{r.upvotes}</span>
                  {!r.isPublic && <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-[10px]">Hidden</Badge>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublic.mutate({ id: r.id, isPublic: !r.isPublic })} title={r.isPublic ? "Hide" : "Publish"}>
                  {r.isPublic ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleTrending.mutate({ id: r.id, isTrending: !r.isTrending })} title="Toggle trending">
                  <TrendingUp className={`w-4 h-4 ${r.isTrending ? "text-orange-400" : "text-muted-foreground"}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm("Delete this recipe?")) deleteRecipe.mutate({ id: r.id }); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {recipes.length === 0 && <p className="text-center text-muted-foreground py-4">No recipes found</p>}
        </div>
      )}
    </Card>
  );
}

function AdminUsers() {
  const { data, isLoading } = trpc.admin.users.useQuery();
  return (
    <Card className="glass p-6">
      {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
        <div className="space-y-2">
          {data?.map((u: any) => (
            <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/30">
              <div>
                <p className="font-medium">{u.name || "Unnamed"}</p>
                <p className="text-xs text-muted-foreground">{u.email || "No email"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={u.role === "admin" ? "default" : "outline"} className={u.role === "admin" ? "bg-purple-500" : ""}>{u.role}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function AdminTickets() {
  const { data, isLoading } = trpc.admin.allTickets.useQuery();
  const utils = trpc.useUtils();
  const resolve = trpc.admin.updateTicket.useMutation({
    onSuccess: () => { utils.admin.allTickets.invalidate(); toast.success("Ticket resolved!"); },
  });

  return (
    <Card className="glass p-6">
      {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
        <div className="space-y-2">
          {data?.map((t: any) => (
            <div key={t.id} className="p-3 rounded-lg bg-card/50 border border-border/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t.type}</Badge>
                  <span className="font-medium text-sm">{t.subject}</span>
                </div>
                <Badge variant={t.status === "resolved" ? "default" : "outline"} className={t.status === "resolved" ? "bg-green-500" : ""}>{t.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t.message}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t.userEmail || "Anonymous"} — {new Date(t.createdAt).toLocaleDateString()}</span>
                {t.status !== "resolved" && (
                  <Button variant="ghost" size="sm" onClick={() => resolve.mutate({ id: t.id, status: "resolved" })} className="text-green-400">
                    <Check className="w-3 h-3 mr-1" />Resolve
                  </Button>
                )}
              </div>
            </div>
          ))}
          {(!data || data.length === 0) && <p className="text-center text-muted-foreground py-4">No tickets</p>}
        </div>
      )}
    </Card>
  );
}
