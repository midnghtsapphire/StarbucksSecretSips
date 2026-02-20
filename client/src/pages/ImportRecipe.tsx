import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Camera, Link2, PenTool, Loader2, Coins, Upload, ArrowRight, Check } from "lucide-react";
import { useLocation } from "wouter";

const categories = ["Viral Today", "Pretty n Pink", "Mad Matchas", "Blues Clues", "Foam Frenzy", "Mocha Magic", "Budget Babe Brews", "Caramel Dreams", "Merry Mocha"];

export default function ImportRecipe() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const tokenBalance = trpc.tokens.balance.useQuery(undefined, { enabled: isAuthenticated });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL extraction state
  const [url, setUrl] = useState("");
  const [urlResult, setUrlResult] = useState<any>(null);

  // Image extraction state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageResult, setImageResult] = useState<any>(null);

  // Manual form state
  const [manualForm, setManualForm] = useState({ name: "", description: "", category: "Viral Today", instructions: "", ingredients: "" });

  const extractUrl = trpc.ai.extractFromUrl.useMutation({
    onSuccess: (data) => { setUrlResult(data.recipe); toast.success("Recipe extracted!"); },
    onError: (err) => toast.error(err.message),
  });

  const extractImage = trpc.ai.extractFromImage.useMutation({
    onSuccess: (data) => { setImageResult(data.recipe); toast.success("Recipe extracted from image!"); },
    onError: (err) => toast.error(err.message),
  });

  const createRecipe = trpc.recipes.create.useMutation({
    onSuccess: (data) => { toast.success("Recipe saved!"); navigate(`/recipe/${data.id}`); },
    onError: (err) => toast.error(err.message),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImagePreview(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const saveExtractedRecipe = (recipe: any) => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    createRecipe.mutate({
      name: recipe.name || "Untitled Drink",
      description: recipe.description,
      category: recipe.category || "Viral Today",
      instructions: recipe.instructions,
      ingredients,
      tags: recipe.tags || [],
      basePrice: recipe.basePrice,
      source: recipe.source,
      originalUrl: recipe.originalUrl,
    });
  };

  const handleManualSubmit = () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    if (!manualForm.name.trim()) { toast.error("Name is required"); return; }
    const ingredients = manualForm.ingredients.split("\n").filter(Boolean).map(line => {
      const parts = line.split(" - ");
      return { name: parts[0]?.trim() || line.trim(), quantity: parts[1]?.trim() };
    });
    createRecipe.mutate({
      name: manualForm.name,
      description: manualForm.description,
      category: manualForm.category,
      instructions: manualForm.instructions,
      ingredients,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-20 pb-16 flex-1">
        <div className="container max-w-3xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Import a Recipe</h1>
            <p className="text-muted-foreground">Extract from social media, snap a photo, or add manually</p>
            {isAuthenticated && tokenBalance.data && (
              <Badge variant="outline" className="glass gap-1"><Coins className="w-3 h-3" />{tokenBalance.data.tokens} tokens</Badge>
            )}
          </div>

          <Tabs defaultValue="url" className="space-y-4">
            <TabsList className="grid grid-cols-3 glass">
              <TabsTrigger value="url" className="gap-2"><Link2 className="w-4 h-4" />Social URL</TabsTrigger>
              <TabsTrigger value="image" className="gap-2"><Camera className="w-4 h-4" />Photo</TabsTrigger>
              <TabsTrigger value="manual" className="gap-2"><PenTool className="w-4 h-4" />Manual</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <Card className="glass p-6 space-y-4">
                <h2 className="font-semibold">Extract from Social Media</h2>
                <p className="text-sm text-muted-foreground">Paste a TikTok, Instagram, YouTube, or any URL with a drink recipe</p>
                <Input placeholder="https://www.tiktok.com/@user/video/..." value={url} onChange={e => setUrl(e.target.value)} className="glass" />
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 gap-2" onClick={() => {
                  if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
                  if (!url.trim()) { toast.error("Enter a URL"); return; }
                  extractUrl.mutate({ url });
                }} disabled={extractUrl.isPending}>
                  {extractUrl.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Extracting...</> : <><Link2 className="w-4 h-4" />Extract Recipe (1 token)</>}
                </Button>
              </Card>
              {urlResult && (
                <Card className="glass p-6 space-y-3">
                  <div className="flex items-center gap-2"><Check className="w-5 h-5 text-green-400" /><h3 className="font-semibold">Extracted: {urlResult.name}</h3></div>
                  {urlResult.description && <p className="text-sm text-muted-foreground">{urlResult.description}</p>}
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 gap-2" onClick={() => saveExtractedRecipe(urlResult)} disabled={createRecipe.isPending}>
                    {createRecipe.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" />Save Recipe</>}
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <Card className="glass p-6 space-y-4">
                <h2 className="font-semibold">Snap to Recipe</h2>
                <p className="text-sm text-muted-foreground">Upload a photo of a Starbucks drink and our AI extracts the recipe</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Uploaded drink" className="w-full max-h-64 object-contain rounded-lg" />
                    <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => { setImagePreview(null); setImageResult(null); }}>Change</Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  </div>
                )}
                {imagePreview && (
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 gap-2" onClick={() => {
                    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
                    if (!imagePreview) return;
                    extractImage.mutate({ imageBase64: imagePreview });
                  }} disabled={extractImage.isPending}>
                    {extractImage.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</> : <><Camera className="w-4 h-4" />Extract Recipe (1 token)</>}
                  </Button>
                )}
              </Card>
              {imageResult && (
                <Card className="glass p-6 space-y-3">
                  <div className="flex items-center gap-2"><Check className="w-5 h-5 text-green-400" /><h3 className="font-semibold">Extracted: {imageResult.name}</h3></div>
                  {imageResult.description && <p className="text-sm text-muted-foreground">{imageResult.description}</p>}
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 gap-2" onClick={() => saveExtractedRecipe(imageResult)} disabled={createRecipe.isPending}>
                    {createRecipe.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" />Save Recipe</>}
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <Card className="glass p-6 space-y-4">
                <h2 className="font-semibold">Add Manually</h2>
                <Input placeholder="Drink Name" value={manualForm.name} onChange={e => setManualForm(p => ({ ...p, name: e.target.value }))} className="glass" />
                <Textarea placeholder="Description" value={manualForm.description} onChange={e => setManualForm(p => ({ ...p, description: e.target.value }))} className="glass" rows={2} />
                <Select value={manualForm.category} onValueChange={v => setManualForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Textarea placeholder="Instructions (how to order)" value={manualForm.instructions} onChange={e => setManualForm(p => ({ ...p, instructions: e.target.value }))} className="glass" rows={3} />
                <Textarea placeholder="Ingredients (one per line, format: Name - Quantity)" value={manualForm.ingredients} onChange={e => setManualForm(p => ({ ...p, ingredients: e.target.value }))} className="glass" rows={4} />
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 gap-2" onClick={handleManualSubmit} disabled={createRecipe.isPending}>
                  {createRecipe.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><PenTool className="w-4 h-4" />Save Recipe</>}
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
