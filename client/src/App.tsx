import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import RecipeDetail from "./pages/RecipeDetail";
import AiCustomizer from "./pages/AiCustomizer";
import BaristaMode from "./pages/BaristaMode";
import Favorites from "./pages/Favorites";
import ImportRecipe from "./pages/ImportRecipe";
import MyRecipes from "./pages/MyRecipes";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import AdminPanel from "./pages/AdminPanel";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/recipe/:id" component={RecipeDetail} />
      <Route path="/ai-customizer" component={AiCustomizer} />
      <Route path="/barista-mode/:id" component={BaristaMode} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/import" component={ImportRecipe} />
      <Route path="/my-recipes" component={MyRecipes} />
      <Route path="/profile" component={Profile} />
      <Route path="/support" component={Support} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster richColors position="top-center" />
            <Router />
          </TooltipProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
