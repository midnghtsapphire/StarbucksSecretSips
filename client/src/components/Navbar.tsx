import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  Coffee, Search, Heart, Plus, User, LogOut, Menu, X, Sun, Moon,
  Sparkles, Shield, Settings, HelpCircle, ChevronDown
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { mode, setMode, modes } = useAccessibility();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/ai-customizer", label: "AI Mixer", icon: Sparkles },
    { href: "/import", label: "Import", icon: Plus },
  ];

  const authLinks = [
    { href: "/favorites", label: "Favorites", icon: Heart },
    { href: "/my-recipes", label: "My Recipes", icon: Coffee },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong" role="navigation" aria-label="Main navigation">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group" aria-label="Secret Sips Home">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent hidden sm:block">
            Secret Sips
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}>
              <Button variant={location === link.href ? "secondary" : "ghost"} size="sm" className="gap-2">
                <link.icon className="w-4 h-4" />
                {link.label}
              </Button>
            </Link>
          ))}
          {isAuthenticated && authLinks.map(link => (
            <Link key={link.href} href={link.href}>
              <Button variant={location === link.href ? "secondary" : "ghost"} size="sm" className="gap-2">
                <link.icon className="w-4 h-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="hidden sm:flex">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Accessibility settings" className="hidden sm:flex">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {modes.map(m => (
                <DropdownMenuItem key={m.id} onClick={() => setMode(m.id)} className={mode === m.id ? "bg-accent" : ""}>
                  <span className="mr-2">{m.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.description}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:block text-sm max-w-[100px] truncate">{user?.name || "User"}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild><Link href="/profile" className="flex items-center gap-2"><User className="w-4 h-4" />Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/my-recipes" className="flex items-center gap-2"><Coffee className="w-4 h-4" />My Recipes</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/favorites" className="flex items-center gap-2"><Heart className="w-4 h-4" />Favorites</Link></DropdownMenuItem>
                {user?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/admin" className="flex items-center gap-2"><Shield className="w-4 h-4" />Admin Panel</Link></DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/support" className="flex items-center gap-2"><HelpCircle className="w-4 h-4" />Support</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive"><LogOut className="w-4 h-4 mr-2" />Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0" onClick={() => { window.location.href = getLoginUrl(); }}>
              Sign In
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-border/50 pb-4">
          <div className="container flex flex-col gap-1 pt-2">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <Button variant={location === link.href ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                  <link.icon className="w-4 h-4" />{link.label}
                </Button>
              </Link>
            ))}
            {isAuthenticated && authLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <Button variant={location === link.href ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                  <link.icon className="w-4 h-4" />{link.label}
                </Button>
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="gap-2">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                Theme
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
