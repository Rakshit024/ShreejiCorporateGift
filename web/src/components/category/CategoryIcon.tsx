import {
  BookOpen,
  Briefcase,
  Coffee,
  Droplets,
  Gift,
  KeyRound,
  Lamp,
  Package,
  Palette,
  PenLine,
  Speaker,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Droplets,
  Coffee,
  PenLine,
  BookOpen,
  Briefcase,
  Lamp,
  Speaker,
  KeyRound,
  Trophy,
  Gift,
  Package,
  Palette,
};

interface CategoryIconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
}

export function CategoryIcon({ name, size = 24, strokeWidth = 1.75 }: CategoryIconProps) {
  const Icon = iconMap[name] ?? Gift;
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden />;
}
