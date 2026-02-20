import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const categories = [
  { name: "All", emoji: "✨" },
  { name: "Viral Today", emoji: "🔥" },
  { name: "Pretty n Pink", emoji: "🌸" },
  { name: "Mad Matchas", emoji: "🍵" },
  { name: "Blues Clues", emoji: "💙" },
  { name: "Foam Frenzy", emoji: "☁️" },
  { name: "Mocha Magic", emoji: "🍫" },
  { name: "Budget Babe Brews", emoji: "💰" },
  { name: "Caramel Dreams", emoji: "🍯" },
  { name: "Merry Mocha", emoji: "🎄" },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollArea className="w-full" role="tablist" aria-label="Recipe categories">
      <div className="flex gap-2 pb-2">
        {categories.map(cat => (
          <Button
            key={cat.name}
            variant={selected === cat.name ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(cat.name)}
            className={`whitespace-nowrap gap-1.5 rounded-full transition-all ${
              selected === cat.name
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 shadow-lg shadow-purple-500/25"
                : "glass hover:shadow-md"
            }`}
            role="tab"
            aria-selected={selected === cat.name}
          >
            <span>{cat.emoji}</span>
            {cat.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
