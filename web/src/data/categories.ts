import type { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'bottles-sippers',
    slug: 'bottles-sippers',
    name: 'Bottles & Sippers',
    description: 'Branded drinkware for teams, events and everyday use.',
    icon: 'Droplets',
  },
  {
    id: 'mugs',
    slug: 'mugs',
    name: 'Mugs',
    description: 'Ceramic and corporate mugs with custom print options.',
    icon: 'Coffee',
  },
  {
    id: 'pens',
    slug: 'pens',
    name: 'Pens',
    description: 'Metal and promotional pens for corporate stationery.',
    icon: 'PenLine',
  },
  {
    id: 'diaries',
    slug: 'diaries',
    name: 'Diaries',
    description: 'Premium diaries and notebooks for professional gifting.',
    icon: 'BookOpen',
  },
  {
    id: 'bags',
    slug: 'bags',
    name: 'Bags',
    description: 'Laptop bags and corporate carry solutions.',
    icon: 'Briefcase',
  },
  {
    id: 'table-lamps',
    slug: 'table-lamps',
    name: 'Table Lamps',
    description: 'Desk lamps suited for office and executive gifts.',
    icon: 'Lamp',
  },
  {
    id: 'speakers',
    slug: 'speakers',
    name: 'Speakers',
    description: 'Bluetooth speakers for premium promotional gifting.',
    icon: 'Speaker',
  },
  {
    id: 'keychains',
    slug: 'keychains',
    name: 'Keychains',
    description: 'Promotional keychains for events, campaigns and everyday branding.',
    icon: 'KeyRound',
  },
  {
    id: 'trophies',
    slug: 'trophies',
    name: 'Trophies',
    description: 'Awards and trophies for recognition, milestones and celebrations.',
    icon: 'Trophy',
  },
  {
    id: 'gift-sets',
    slug: 'gift-sets',
    name: 'Gift Sets',
    description: 'Curated executive and corporate gift combinations.',
    icon: 'Gift',
  },
  {
    id: 'corporate-hampers',
    slug: 'corporate-hampers',
    name: 'Corporate Hampers',
    description: 'Thoughtful combinations for clients, employees and festivals.',
    icon: 'Package',
  },
  {
    id: 'custom-printing',
    slug: 'custom-printing',
    name: 'Custom Printing',
    description: 'Logo printing and branding across product categories.',
    icon: 'Palette',
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
