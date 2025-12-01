import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, 
  Cake, 
  Coffee, 
  Cookie, 
  Croissant,
  IceCream,
  CakeSlice,
  Pizza,
  Sandwich,
  Apple,
  Beef,
  Carrot,
  Cherry,
  Donut,
  Egg,
  Fish,
  Grape,
  Ham,
  Lollipop,
  Milk,
  Soup,
  Wine,
  icons,
  LucideIcon
} from "lucide-react";

const POPULAR_FOOD_ICONS = [
  { name: "Cake", Icon: Cake },
  { name: "Cookie", Icon: Cookie },
  { name: "Croissant", Icon: Croissant },
  { name: "IceCream", Icon: IceCream },
  { name: "CakeSlice", Icon: CakeSlice },
  { name: "Coffee", Icon: Coffee },
  { name: "Pizza", Icon: Pizza },
  { name: "Sandwich", Icon: Sandwich },
  { name: "Apple", Icon: Apple },
  { name: "Beef", Icon: Beef },
  { name: "Carrot", Icon: Carrot },
  { name: "Cherry", Icon: Cherry },
  { name: "Donut", Icon: Donut },
  { name: "Egg", Icon: Egg },
  { name: "Fish", Icon: Fish },
  { name: "Grape", Icon: Grape },
  { name: "Ham", Icon: Ham },
  { name: "Lollipop", Icon: Lollipop },
  { name: "Milk", Icon: Milk },
  { name: "Soup", Icon: Soup },
  { name: "Wine", Icon: Wine },
  { name: "Package", Icon: Package },
];

interface IconSelectorProps {
  value: string;
  onSelect: (iconName: string) => void;
}

export const IconSelector = ({ value, onSelect }: IconSelectorProps) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const SelectedIcon = (icons[value as keyof typeof icons] || Package) as LucideIcon;

  const filteredIcons = POPULAR_FOOD_ICONS.filter(icon =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <SelectedIcon className="w-5 h-5 mr-2" />
          {value || "Choisir une icône"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Rechercher une icône..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-4 gap-2 p-2">
            {filteredIcons.map(({ name, Icon }) => (
              <button
                key={name}
                onClick={() => {
                  onSelect(name);
                  setOpen(false);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-lg hover:bg-accent transition-colors ${
                  value === name ? "bg-accent" : ""
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs text-center line-clamp-1">{name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
