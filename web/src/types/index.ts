export type Currency = 'INR';

export interface PricingSlab {
  min: number;
  max: number;
  price: number;
}

export interface PrintingOption {
  id: string;
  label: string;
  pricePerUnit: number;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  priceFrom: number;
  currency: Currency;
  description: string;
  shortDescription: string;
  image: string;
  images?: string[];
  featured: boolean;
  customizable: boolean;
  bulkPricing: boolean;
  printingOptions?: PrintingOption[];
  pricingSlabs?: PricingSlab[];
  specifications: ProductSpecification[];
  tags: string[];
  available: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  productCount?: number;
}

export interface BrandingService {
  id: string;
  name: string;
  description: string;
}

export interface Hamper {
  id: string;
  name: string;
  description: string;
  items: string[];
  priceFrom: number | null;
  image: string;
  occasions: string[];
  /** When true, contents/pricing need real business data */
  placeholder?: boolean;
}

export interface QuoteCartItem {
  lineId: string;
  productId: string;
  quantity: number;
  brandingOptionId: string | null;
  brandingLabel: string;
}

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc';

export interface ProductFilters {
  categoryIds: string[];
  priceMin: number | null;
  priceMax: number | null;
  customizable: boolean | null;
  featured: boolean | null;
  available: boolean | null;
  search: string;
}

export interface BulkQuoteFormData {
  name: string;
  companyName: string;
  phone: string;
  email: string;
  product: string;
  quantity: string;
  brandingRequired: string;
  deliveryLocation: string;
  requiredDate: string;
  message: string;
}
