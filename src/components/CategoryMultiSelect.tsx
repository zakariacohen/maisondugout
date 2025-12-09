import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  { value: "normal", label: "Normal", emoji: "📦" },
  { value: "ramadan", label: "Ramadan", emoji: "🌙" },
  { value: "traiteur", label: "Traiteur", emoji: "🍽️" },
  { value: "service", label: "Service", emoji: "🛎️" },
  { value: "autre_service", label: "Autre Service", emoji: "➕" },
];

interface CategoryMultiSelectProps {
  value: string; // comma-separated categories
  onChange: (value: string) => void;
}

export const CategoryMultiSelect = ({ value, onChange }: CategoryMultiSelectProps) => {
  const selectedCategories = value ? value.split(",").filter(Boolean) : [];

  const toggleCategory = (category: string) => {
    let newCategories: string[];
    if (selectedCategories.includes(category)) {
      newCategories = selectedCategories.filter((c) => c !== category);
    } else {
      newCategories = [...selectedCategories, category];
    }
    // Ensure at least one category is selected
    if (newCategories.length === 0) {
      newCategories = ["normal"];
    }
    onChange(newCategories.join(","));
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {CATEGORIES.map((cat) => (
        <div
          key={cat.value}
          className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
            selectedCategories.includes(cat.value)
              ? "bg-primary/10 border-primary"
              : "bg-muted/30 border-border hover:bg-muted/50"
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCategory(cat.value);
          }}
        >
          <Checkbox
            id={`cat-${cat.value}`}
            checked={selectedCategories.includes(cat.value)}
            onCheckedChange={(checked) => {
              toggleCategory(cat.value);
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <Label
            htmlFor={`cat-${cat.value}`}
            className="text-sm cursor-pointer flex-1"
          >
            {cat.emoji} {cat.label}
          </Label>
        </div>
      ))}
    </div>
  );
};

export const getCategoryBadges = (category: string) => {
  const categories = category ? category.split(",").filter(Boolean) : [];
  return categories;
};

export const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; emoji: string; label: string }> = {
  normal: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", emoji: "📦", label: "Normal" },
  ramadan: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", emoji: "🌙", label: "Ramadan" },
  traiteur: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", emoji: "🍽️", label: "Traiteur" },
  service: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", emoji: "🛎️", label: "Service" },
  autre_service: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", emoji: "➕", label: "Autre" },
  both: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", emoji: "🌟", label: "Les Deux" },
};
