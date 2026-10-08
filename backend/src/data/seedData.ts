import type { PricingSlab, ProductSpecification } from '../types/index.js';

export interface SeedCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export interface SeedProduct {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  priceFrom: number;
  description: string;
  shortDescription: string;
  image: string;
  featured: boolean;
  customizable: boolean;
  bulkPricing: boolean;
  printingOptions?: Array<{ id: string; label: string; pricePerUnit: number }>;
  pricingSlabs?: PricingSlab[];
  specifications: ProductSpecification[];
  tags: string[];
  available: boolean;
  stock: number;
}

const specOnEnquiry = (label: string): ProductSpecification => ({
  label,
  value: 'Available on enquiry',
});

/** `Infinity` does not survive JSON, so the open-ended slab uses a large finite max. */
export const OPEN_ENDED_MAX = 1_000_000;

/** Verbatim from web/src/data/categories.ts, with an explicit display order. */
export const seedCategories: SeedCategory[] = [
  {
    id: 'bottles-sippers',
    slug: 'bottles-sippers',
    name: 'Bottles & Sippers',
    description: 'Branded drinkware for teams, events and everyday use.',
    icon: 'Droplets',
    order: 1,
  },
  {
    id: 'mugs',
    slug: 'mugs',
    name: 'Mugs',
    description: 'Ceramic and corporate mugs with custom print options.',
    icon: 'Coffee',
    order: 2,
  },
  {
    id: 'pens',
    slug: 'pens',
    name: 'Pens',
    description: 'Metal and promotional pens for corporate stationery.',
    icon: 'PenLine',
    order: 3,
  },
  {
    id: 'diaries',
    slug: 'diaries',
    name: 'Diaries',
    description: 'Premium diaries and notebooks for professional gifting.',
    icon: 'BookOpen',
    order: 4,
  },
  {
    id: 'bags',
    slug: 'bags',
    name: 'Bags',
    description: 'Laptop bags and corporate carry solutions.',
    icon: 'Briefcase',
    order: 5,
  },
  {
    id: 'table-lamps',
    slug: 'table-lamps',
    name: 'Table Lamps',
    description: 'Desk lamps suited for office and executive gifts.',
    icon: 'Lamp',
    order: 6,
  },
  {
    id: 'speakers',
    slug: 'speakers',
    name: 'Speakers',
    description: 'Bluetooth speakers for premium promotional gifting.',
    icon: 'Speaker',
    order: 7,
  },
  {
    id: 'keychains',
    slug: 'keychains',
    name: 'Keychains',
    description: 'Promotional keychains for events, campaigns and everyday branding.',
    icon: 'KeyRound',
    order: 8,
  },
  {
    id: 'trophies',
    slug: 'trophies',
    name: 'Trophies',
    description: 'Awards and trophies for recognition, milestones and celebrations.',
    icon: 'Trophy',
    order: 9,
  },
  {
    id: 'gift-sets',
    slug: 'gift-sets',
    name: 'Gift Sets',
    description: 'Curated executive and corporate gift combinations.',
    icon: 'Gift',
    order: 10,
  },
  {
    id: 'corporate-hampers',
    slug: 'corporate-hampers',
    name: 'Corporate Hampers',
    description: 'Thoughtful combinations for clients, employees and festivals.',
    icon: 'Package',
    order: 11,
  },
  {
    id: 'custom-printing',
    slug: 'custom-printing',
    name: 'Custom Printing',
    description: 'Logo printing and branding across product categories.',
    icon: 'Palette',
    order: 12,
  },
];

/** Verbatim product data from web/src/data/products.ts, plus admin inventory. */
export const seedProducts: SeedProduct[] = [
  {
    id: 'steel-bottle-750ml',
    slug: 'steel-bottle-750ml',
    name: 'Steel Bottle – 750ml',
    categoryId: 'bottles-sippers',
    priceFrom: 145,
    description:
      'High-quality stainless steel bottle, suitable for corporate gifting and logo branding.',
    shortDescription: 'Stainless steel 750ml bottle with custom branding options.',
    image: '/products/steel-bottle-750ml.svg',
    featured: true,
    customizable: true,
    bulkPricing: true,
    printingOptions: [
      { id: 'none', label: 'No Printing', pricePerUnit: 0 },
      { id: '1-colour', label: '1 Colour Logo (+₹15/pc)', pricePerUnit: 15 },
      { id: 'multi-colour', label: 'Multi Colour Logo (+₹25/pc)', pricePerUnit: 25 },
    ],
    pricingSlabs: [
      { min: 1, max: 9, price: 250 },
      { min: 10, max: 49, price: 220 },
      { min: 50, max: 99, price: 195 },
      { min: 100, max: 249, price: 175 },
      { min: 250, max: 499, price: 160 },
      { min: 500, max: OPEN_ENDED_MAX, price: 145 },
    ],
    specifications: [
      { label: 'Material', value: 'Stainless steel' },
      { label: 'Capacity', value: '750ml' },
      { label: 'Branding', value: 'Logo printing available (see options)' },
      specOnEnquiry('Color'),
      specOnEnquiry('Size'),
      specOnEnquiry('Packaging'),
      specOnEnquiry('Minimum Order Quantity'),
      specOnEnquiry('Lead Time'),
    ],
    tags: ['bottle', 'steel', 'drinkware', 'branding', 'bulk'],
    available: true,
    stock: 250,
  },
  {
    id: 'stainless-steel-tumbler',
    slug: 'stainless-steel-tumbler',
    name: 'Stainless Steel Tumbler',
    categoryId: 'bottles-sippers',
    priceFrom: 175,
    description:
      'Double-wall stainless steel tumbler designed for hot and cold corporate gifting.',
    shortDescription: 'Insulated stainless steel tumbler for everyday use.',
    image: '/products/steel-bottle-750ml.svg',
    featured: true,
    customizable: true,
    bulkPricing: true,
    specifications: [
      { label: 'Material', value: '304-grade stainless steel' },
      specOnEnquiry('Capacity'),
      specOnEnquiry('Color'),
      { label: 'Branding', value: 'Custom artwork available on enquiry' },
      specOnEnquiry('Packaging'),
      specOnEnquiry('Minimum Order Quantity'),
      specOnEnquiry('Lead Time'),
    ],
    tags: ['tumbler', 'steel', 'drinkware', 'insulated', 'branding'],
    available: true,
    stock: 180,
  },
  {
    id: 'vacuum-flask',
    slug: 'vacuum-flask',
    name: 'Vacuum Flask',
    categoryId: 'bottles-sippers',
    priceFrom: 195,
    description:
      'Double-wall vacuum flask for keeping drinks hot or cold during travel and gifting.',
    shortDescription: 'Premium vacuum flask with a durable carry strap.',
    image: '/products/steel-bottle-750ml.svg',
    featured: true,
    customizable: true,
    bulkPricing: true,
    specifications: [
      { label: 'Material', value: '304-grade stainless steel' },
      specOnEnquiry('Capacity'),
      specOnEnquiry('Color'),
      { label: 'Branding', value: 'Custom artwork available on enquiry' },
      specOnEnquiry('Packaging'),
      specOnEnquiry('Minimum Order Quantity'),
      specOnEnquiry('Lead Time'),
    ],
    tags: ['flask', 'steel', 'drinkware', 'vacuum', 'branding'],
    available: true,
    stock: 140,
  },
  {
    id: 'ceramic-mug',
    slug: 'ceramic-mug',
    name: 'Ceramic Mug',
    categoryId: 'mugs',
    priceFrom: 60,
    description:
      'Corporate ceramic mug suitable for custom mug print and promotional gifting.',
    shortDescription: 'Classic ceramic mug for offices and events.',
    image: '/products/ceramic-mug.svg',
    featured: true,
    customizable: true,
    bulkPricing: true,
    specifications: [
      specOnEnquiry('Material'),
      specOnEnquiry('Capacity'),
      specOnEnquiry('Color'),
      { label: 'Branding', value: 'Mug print available (see Custom Branding)' },
      specOnEnquiry('Packaging'),
      specOnEnquiry('Minimum Order Quantity'),
      specOnEnquiry('Lead Time'),
    ],
    tags: ['mug', 'ceramic', 'drinkware', 'print'],
    available: true,
    stock: 500,
  },
  {
    id: 'metal-pen',
    slug: 'metal-pen',
    name: 'Metal Pen',
    categoryId: 'pens',
    priceFrom: 35,
    description: 'Metal pen for corporate stationery and promotional distribution.',
    shortDescription: 'Professional metal pen for everyday business use.',
    image: '/products/metal-pen.svg',
    featured: true,
    customizable: true,
    bulkPricing: true,
    specifications: [
      { label: 'Material', value: 'Metal' },
      specOnEnquiry('Color'),
      { label: 'Branding', value: 'Pen branding available (see Custom Branding)' },
      specOnEnquiry('Packaging'),
      specOnEnquiry('Minimum Order Quantity'),
      specOnEnquiry('Lead Time'),
    ],
    tags: ['pen', 'stationery', 'metal'],
    available: true,
    stock: 1200,
  },
  {
    id: 'premium-diary',
    slug: 'premium-diary',
    name: 'Premium Diary',
    categoryId: 'diaries',
    priceFrom: 90,
    description: 'Premium diary for executive gifting and pen & diary branding.',
    shortDescription: 'Executive diary for clients and teams.',
    image: '/products/premium-diary.svg',
    featured: true,
    customizable: true,
    bulkPricing: true,
    specifications: [
      specOnEnquiry('Material'),
      specOnEnquiry('Size'),
      { label: 'Branding', value: 'Diary branding available (see Custom Branding)' },
      specOnEnquiry('Packaging'),
      specOnEnquiry('Minimum Order Quantity'),
      specOnEnquiry('Lead Time'),
    ],
    tags: ['diary', 'notebook', 'executive'],
    available: true,
    stock: 320,
  },
  {
    id: 'laptop-bag',
    slug: 'laptop-bag',
    name: 'Laptop Bag',
    categoryId: 'bags',
    priceFrom: 450,
    description:
      'Laptop bag suited for corporate gifting and employee welcome kits.',
    shortDescription: 'Durable laptop bag for professionals.',
    image: '/products/laptop-bag.svg',
    featured: true,
    customizable: true,
    bulkPricing: true,
    specifications: [
      specOnEnquiry('Material'),
      specOnEnquiry('Size'),
      specOnEnquiry('Color'),
      specOnEnquiry('Branding'),
      specOnEnquiry('Packaging'),
      specOnEnquiry('Minimum Order Quantity'),
      specOnEnquiry('Lead Time'),
    ],
    tags: ['bag', 'laptop', 'corporate'],
    available: true,
    stock: 85,
  },
  {
    id: 'table-lamp',
    slug: 'table-lamp',
    name: 'Table Lamp',
    categoryId: 'table-lamps',
    priceFrom: 320,
    description: 'Table lamp for desk and executive corporate gifts.',
    shortDescription: 'Desk lamp for office and home workspaces.',
    image: '/products/table-lamp.svg',
    featured: true,
    customizable: false,
    bulkPricing: true,
    specifications: [
      specOnEnquiry('Material'),
      specOnEnquiry('Color'),
      specOnEnquiry('Size'),
      specOnEnquiry('Branding'),
      specOnEnquiry('Packaging'),
      specOnEnquiry('Minimum Order Quantity'),
      specOnEnquiry('Lead Time'),
    ],
    tags: ['lamp', 'desk', 'office'],
    available: true,
    stock: 60,
  },
  {
    id: 'bluetooth-speaker',
    slug: 'bluetooth-speaker',
    name: 'Bluetooth Speaker',
    categoryId: 'speakers',
    priceFrom: 550,
    description: 'Bluetooth speaker for premium promotional and corporate gifting.',
    shortDescription: 'Wireless speaker for events and client gifts.',
    image: '/products/bluetooth-speaker.svg',
    featured: true,
    customizable: true,
    bulkPricing: true,
    specifications: [
      specOnEnquiry('Material'),
      specOnEnquiry('Color'),
      specOnEnquiry('Branding'),
      specOnEnquiry('Packaging'),
      specOnEnquiry('Minimum Order Quantity'),
      specOnEnquiry('Lead Time'),
    ],
    tags: ['speaker', 'bluetooth', 'tech'],
    available: true,
    stock: 45,
  },
  {
    id: 'executive-gift-set',
    slug: 'executive-gift-set',
    name: 'Executive Gift Set',
    categoryId: 'gift-sets',
    priceFrom: 299,
    description: 'Executive gift set combining curated items for corporate occasions.',
    shortDescription: 'Ready-to-gift executive set for business relationships.',
    image: '/products/executive-gift-set.svg',
    featured: true,
    customizable: true,
    bulkPricing: true,
    specifications: [
      specOnEnquiry('Contents'),
      specOnEnquiry('Branding'),
      specOnEnquiry('Packaging'),
      specOnEnquiry('Minimum Order Quantity'),
      specOnEnquiry('Lead Time'),
    ],
    tags: ['gift set', 'executive', 'combo'],
    available: true,
    stock: 70,
  },
];

/** Verbatim from web/src/data/hampers.ts. */
export const seedHampers = [
  {
    slug: 'executive-hamper',
    name: 'Executive Hamper',
    description: 'A refined selection of desk and lifestyle gifts for senior clients.',
    priceFrom: 1499,
    image: '/products/hamper-placeholder.svg',
    occasions: ['Diwali', 'New Year', 'Client Appreciation'],
    items: ['Premium diary', 'Metal pen', 'Steel bottle 750ml', 'Branded pen holder'],
  },
  {
    slug: 'welcome-kit',
    name: 'Employee Welcome Kit',
    description: 'A practical onboarding hamper for new team members.',
    priceFrom: 999,
    image: '/products/hamper-placeholder.svg',
    occasions: ['Onboarding', 'Festive'],
    items: ['Laptop bag', 'Notebook', 'Steel bottle 750ml', 'Welcome card'],
  },
  {
    slug: 'festival-gifting-hamper',
    name: 'Festival Gifting Hamper',
    description: 'Seasonal hamper curated for festival distributions.',
    priceFrom: 1299,
    image: '/products/hamper-placeholder.svg',
    occasions: ['Diwali', 'Holi', 'Christmas'],
    items: ['Ceramic mug', 'Steel bottle 750ml', 'Premium diary', 'Sweets'],
  },
];