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

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  order: number;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  categoryId: string;
  category: string;
  priceFrom: number;
  currency: Currency;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  featured: boolean;
  customizable: boolean;
  bulkPricing: boolean;
  available: boolean;
  printingOptions: PrintingOption[];
  pricingSlabs: PricingSlab[];
  specifications: ProductSpecification[];
  tags: string[];
  stock: number;
  lowStockThreshold: number;
  minimumOrderQuantity: number;
  leadTimeDays: number | null;
  metaTitle: string;
  metaDescription: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Enquiry {
  id: string;
  reference: string;
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
  source: string;
  items: EnquiryItem[];
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  adminNotes: string;
  quotedAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryItem {
  productId: string | null;
  productName: string;
  quantity: number;
  brandingOptionId: string | null;
  brandingLabel: string;
  unitPrice: number;
}

export interface Order {
  id: string;
  reference: string;
  customer: { id: string; name: string; email: string; companyName: string } | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string;
  deliveryAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string;
  status: 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  paymentMethod: string;
  notes: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  image: string;
  quantity: number;
  unitPrice: number;
  brandingOptionId: string | null;
  brandingLabel: string;
  lineTotal: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  companyWebsite: string;
  billingAddress: Address;
  notes: string;
  tags: string[];
  isBlocked: boolean;
  marketingOptIn: boolean;
  totalSpent: number;
  orderCount: number;
  enquiryCount: number;
  lastOrderAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount: number | null;
  minimumOrderValue: number;
  minimumQuantity: number;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number | null;
  validFrom: string | null;
  validUntil: string | null;
  applicableCategories: string[];
  applicableProducts: string[];
  isActive: boolean;
  isExpired: boolean;
  isExhausted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  mobileImage: string;
  ctaLabel: string;
  ctaLink: string;
  placement: 'home-hero' | 'home-mid' | 'category-top' | 'popup';
  order: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  business: {
    name: string;
    legalName: string;
    email: string;
    phone: string;
    whatsapp: string;
    gstNumber: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  commerce: {
    currency: Currency;
    taxPercent: number;
    shippingFlatRate: number;
    freeShippingThreshold: number;
    defaultLowStockThreshold: number;
  };
  seo: {
    defaultTitle: string;
    titleSuffix: string;
    defaultDescription: string;
    ogImage: string;
  };
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube: string;
  };
  enquiry: {
    autoAckEnabled: boolean;
    autoAckMessage: string;
    notifyEmails: string[];
  };
}

export interface DashboardStats {
  catalog: {
    totalProducts: number;
    availableProducts: number;
    featuredProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalCategories: number;
    activeCategories: number;
  };
  enquiries: {
    newEnquiries: number;
    totalEnquiries: number;
    wonEnquiries: number;
  };
  sales: {
    lifetimeRevenue: number;
    lifetimeOrders: number;
    revenueLast30Days: number;
    ordersLast30Days: number;
  };
  customers: { total: number; newLast7Days: number };
  marketing: { activeCoupons: number; activeBanners: number };
  recentEnquiries: Enquiry[];
  lowStockItems: { id: string; name: string; slug: string; image: string; stock: number; lowStockThreshold: number; category: string }[];
  topProducts: { id: string; name: string; sold: number; revenue: number }[];
  revenueTrend: { date: string; revenue: number; orders: number }[];
  categoryBreakdown: { id: string; name: string; products: number }[];
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  lastLoginAt: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}