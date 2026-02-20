import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type AccessibilityMode = "default" | "wcag-aaa" | "eco-mode" | "neuro-mode" | "dyslexic-mode" | "no-blue-light";

interface AccessibilityContextType {
  mode: AccessibilityMode;
  setMode: (mode: AccessibilityMode) => void;
  modes: { id: AccessibilityMode; label: string; description: string; icon: string }[];
}

const modes = [
  { id: "default" as const, label: "Standard", description: "Default experience", icon: "🎨" },
  { id: "wcag-aaa" as const, label: "WCAG AAA", description: "Maximum contrast & focus indicators", icon: "♿" },
  { id: "eco-mode" as const, label: "Eco Code", description: "Reduced animations & energy usage", icon: "🌿" },
  { id: "neuro-mode" as const, label: "Neuro Code", description: "ADHD-friendly, reduced clutter", icon: "🧠" },
  { id: "dyslexic-mode" as const, label: "Dyslexic Mode", description: "OpenDyslexic font, extra spacing", icon: "📖" },
  { id: "no-blue-light" as const, label: "No Blue Light", description: "Warm color filter for eye comfort", icon: "🌅" },
];

const AccessibilityContext = createContext<AccessibilityContextType>({
  mode: "default",
  setMode: () => {},
  modes,
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AccessibilityMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("a11y-mode") as AccessibilityMode) || "default";
    }
    return "default";
  });

  const setMode = (newMode: AccessibilityMode) => {
    setModeState(newMode);
    localStorage.setItem("a11y-mode", newMode);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("wcag-aaa", "eco-mode", "neuro-mode", "dyslexic-mode", "no-blue-light");
    if (mode !== "default") {
      root.classList.add(mode);
    }
  }, [mode]);

  return (
    <AccessibilityContext.Provider value={{ mode, setMode, modes }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
