import React from "react";
import {
  Leaf,
  TreePine,
  Flower2,
  Flower,
  Sparkles,
  Home,
  Laptop,
  Shirt,
  Package,
  Sun,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  leaf: Leaf,
  "tree-pine": TreePine,
  treepine: TreePine,
  "flower-2": Flower2,
  flower2: Flower2,
  flower: Flower,
  sparkles: Sparkles,
  home: Home,
  laptop: Laptop,
  shirt: Shirt,
  package: Package,
  sun: Sun,
};

export function getCategoryIcon(iconName?: string): LucideIcon {
  if (!iconName) return Leaf;
  const key = iconName.toLowerCase().trim();
  return CATEGORY_ICON_MAP[key] || Leaf;
}

export function CategoryIcon({
  name,
  className = "h-4 w-4",
}: {
  name?: string;
  className?: string;
}) {
  const icon = getCategoryIcon(name);
  return React.createElement(icon, { className });
}
