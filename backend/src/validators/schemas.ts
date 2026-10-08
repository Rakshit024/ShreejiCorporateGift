import { z } from 'zod';

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === '' ? undefined : value));

/** "and above" slabs are stored with a large finite max instead of Infinity. */
export const OPEN_ENDED_MAX = 1_000_000;

const booleanish = z
  .union([z.boolean(), z.string()])
  .transform((value) =>
    typeof value === 'boolean' ? value : ['true', '1', 'yes', 'on'].includes(value.toLowerCase()),
  );

const numberish = z
  .union([z.number(), z.string()])
  .transform((value) => (typeof value === 'number' ? value : Number(value)))
  .refine((value) => Number.isFinite(value), { message: 'Must be a number' });

const nullableNumber = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  });

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: optionalText(120),
  sort: z.string().optional(),
});

/* ---------------------------------- auth --------------------------------- */

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'New password is too long'),
});

/* ------------------------------- categories ------------------------------ */

export const categoryBodySchema = z.object({
  name: trimmed(80).min(1, 'Name is required'),
  slug: optionalText(80),
  description: z.string().trim().max(400).optional().default(''),
  icon: trimmed(40).optional().default('Gift'),
  image: z.string().trim().optional().default(''),
  order: numberish.optional().default(0),
  isActive: booleanish.optional().default(true),
  seoTitle: z.string().trim().max(70).optional().default(''),
  seoDescription: z.string().trim().max(180).optional().default(''),
});

export const categoryUpdateSchema = categoryBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one field to update',
);

export const categoryListSchema = paginationSchema.extend({
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === true || value === 'true' || value === '1',
    ),
});

/* -------------------------------- products ------------------------------- */

const pricingSlabSchema = z
  .object({
    min: numberish.pipe(z.number().int().min(1, 'Minimum quantity must be at least 1')),
    max: numberish.pipe(z.number().int().min(1, 'Maximum must be at least 1')),
    price: numberish.pipe(z.number().min(0, 'Price cannot be negative')),
  })
  .refine((slab) => slab.max >= slab.min, {
    message: 'Each slab maximum must be greater than or equal to its minimum',
    path: ['max'],
  });

const printingOptionSchema = z.object({
  id: trimmed(40).min(1, 'Option id is required'),
  label: trimmed(80).min(1, 'Option label is required'),
  pricePerUnit: numberish.pipe(z.number().min(0, 'Price cannot be negative')),
});

const specificationSchema = z.object({
  label: trimmed(60).min(1, 'Specification label is required'),
  value: trimmed(200).min(1, 'Specification value is required'),
});

const productBaseSchema = z.object({
  name: trimmed(140).min(1, 'Name is required'),
  slug: optionalText(80),
  sku: optionalText(40),

  categoryId: z.string().regex(/^[a-f\d]{24}$/i, 'Select a valid category'),
  category: optionalText(80),

  priceFrom: numberish.pipe(z.number().min(0, 'Price cannot be negative')),
  currency: z.literal('INR').optional().default('INR'),

  description: z.string().trim().max(4000).optional().default(''),
  shortDescription: z.string().trim().max(240).optional().default(''),

  image: z.string().trim().optional().default(''),
  images: z.array(z.string().trim()).max(10).optional().default([]),

  featured: booleanish.optional().default(false),
  customizable: booleanish.optional().default(false),
  bulkPricing: booleanish.optional().default(true),
  available: booleanish.optional().default(true),

  printingOptions: z.array(printingOptionSchema).optional().default([]),
  pricingSlabs: z.array(pricingSlabSchema).optional().default([]),
  specifications: z.array(specificationSchema).optional().default([]),
  tags: z
    .union([z.array(z.string().trim()), z.string()])
    .optional()
    .transform((value) => {
      if (Array.isArray(value)) return value.filter(Boolean);
      return (value ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    })
    .default([]),

  stock: numberish.optional().default(0),
  lowStockThreshold: numberish.optional().default(5),
  minimumOrderQuantity: numberish.optional().default(1),
  leadTimeDays: nullableNumber,

  metaTitle: z.string().trim().max(70).optional().default(''),
  metaDescription: z.string().trim().max(180).optional().default(''),
});

export const productBodySchema = productBaseSchema.refine(
  (value) => value.pricingSlabs.length <= 1 || areSlabsOrdered(value.pricingSlabs),
  {
    message: 'Pricing slabs must be listed from the lowest quantity upwards',
    path: ['pricingSlabs'],
  },
);

function areSlabsOrdered(slabs: Array<{ min: number; max: number }>): boolean {
  for (let i = 1; i < slabs.length; i += 1) {
    const previous = slabs[i - 1];
    const current = slabs[i];
    if (!previous || !current) return false;
    if (current.min <= previous.min) return false;
  }
  return true;
}

export const productUpdateSchema = productBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one field to update',
);

export const productListSchema = paginationSchema.extend({
  categoryId: optionalText(24),
  featured: booleanish.optional(),
  available: booleanish.optional(),
  customizable: booleanish.optional(),
  priceMin: nullableNumber,
  priceMax: nullableNumber,
  stock: z.enum(['all', 'out', 'low']).optional(),
});

export const bulkProductActionSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')).min(1, 'Select at least one product'),
  action: z.enum(['delete', 'feature', 'unfeature', 'available', 'unavailable', 'category']),
  value: z.string().optional(),
});

/* -------------------------------- enquiries ------------------------------ */

export const enquiryBodySchema = z.object({
  name: trimmed(120).min(1, 'Name is required'),
  companyName: z.string().trim().max(120).optional().default(''),
  phone: trimmed(40).min(1, 'Phone is required'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  product: z.string().trim().max(160).optional().default(''),
  quantity: z.string().trim().max(40).optional().default(''),
  brandingRequired: z.string().trim().max(120).optional().default(''),
  deliveryLocation: z.string().trim().max(160).optional().default(''),
  requiredDate: z.string().trim().max(40).optional().default(''),
  message: z.string().trim().max(4000).optional().default(''),
  source: z.enum(['quote-form', 'quote-cart', 'contact', 'manual']).optional().default('manual'),
  items: z
    .array(
      z.object({
        productId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
        productName: z.string().trim().max(160).optional().default(''),
        quantity: z.coerce.number().int().min(1).optional().default(1),
        brandingOptionId: z.string().trim().max(40).nullable().optional(),
        brandingLabel: z.string().trim().max(80).optional().default(''),
        unitPrice: numberish.optional().default(0),
      }),
    )
    .max(100)
    .optional()
    .default([]),
});

export const enquiryUpdateSchema = z
  .object({
    status: z.enum(['new', 'contacted', 'quoted', 'won', 'lost']).optional(),
    adminNotes: z.string().trim().max(4000).optional(),
    quotedAmount: nullableNumber,
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

export const enquiryListSchema = paginationSchema.extend({
  status: z.enum(['new', 'contacted', 'quoted', 'won', 'lost']).optional(),
});

/* --------------------------------- orders -------------------------------- */

const orderItemInputSchema = z.object({
  productId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product'),
  quantity: z.coerce.number().int().min(1),
  unitPrice: numberish.pipe(z.number().min(0)),
  brandingOptionId: z.string().trim().max(40).nullable().optional(),
  brandingLabel: z.string().trim().max(80).optional().default(''),
});

export const orderBodySchema = z
  .object({
    customerName: trimmed(120).min(1, 'Customer name is required'),
    customerEmail: z.string().trim().toLowerCase().email('Enter a valid email address'),
    customerPhone: z.string().trim().max(40).optional().default(''),
    companyName: z.string().trim().max(120).optional().default(''),
    deliveryAddress: z
      .object({
        line1: z.string().trim().max(160).optional().default(''),
        line2: z.string().trim().max(160).optional().default(''),
        city: z.string().trim().max(80).optional().default(''),
        state: z.string().trim().max(80).optional().default(''),
        postalCode: z.string().trim().max(20).optional().default(''),
        country: z.string().trim().max(80).optional().default('India'),
      })
      .optional(),
    items: z.array(orderItemInputSchema).min(1, 'Add at least one product'),
    couponCode: z.string().trim().max(24).optional().default(''),
    shipping: numberish.optional().default(0),
    tax: numberish.optional().default(0),
    discount: numberish.optional().default(0),
    status: z
      .enum(['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'])
      .optional()
      .default('pending'),
    paymentStatus: z.enum(['unpaid', 'partial', 'paid', 'refunded']).optional().default('unpaid'),
    paymentMethod: z.string().trim().max(40).optional().default(''),
    notes: z.string().trim().max(2000).optional().default(''),
    adminNotes: z.string().trim().max(2000).optional().default(''),
  })
  .transform((value) => ({ ...value, items: value.items }));

export const orderUpdateSchema = z
  .object({
    status: z
      .enum(['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'])
      .optional(),
    paymentStatus: z.enum(['unpaid', 'partial', 'paid', 'refunded']).optional(),
    paymentMethod: z.string().trim().max(40).optional(),
    shipping: numberish.optional(),
    tax: numberish.optional(),
    discount: numberish.optional(),
    adminNotes: z.string().trim().max(2000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

export const orderListSchema = paginationSchema.extend({
  status: z
    .enum(['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'])
    .optional(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid', 'refunded']).optional(),
});

/* ------------------------------- customers ------------------------------- */

export const customerBodySchema = z.object({
  name: trimmed(120).min(1, 'Name is required'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: z.string().trim().max(40).optional().default(''),
  companyName: z.string().trim().max(120).optional().default(''),
  companyWebsite: z.string().trim().max(200).optional().default(''),
  billingAddress: z
    .object({
      line1: z.string().trim().max(160).optional().default(''),
      line2: z.string().trim().max(160).optional().default(''),
      city: z.string().trim().max(80).optional().default(''),
      state: z.string().trim().max(80).optional().default(''),
      postalCode: z.string().trim().max(20).optional().default(''),
      country: z.string().trim().max(80).optional().default('India'),
    })
    .optional(),
  notes: z.string().trim().max(2000).optional().default(''),
  tags: z
    .union([z.array(z.string().trim()), z.string()])
    .optional()
    .transform((value) =>
      Array.isArray(value) ? value.filter(Boolean) : value?.split(',').map((t) => t.trim()).filter(Boolean) ?? [],
    )
    .default([]),
  isBlocked: booleanish.optional().default(false),
  marketingOptIn: booleanish.optional().default(false),
});

export const customerUpdateSchema = customerBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

export const customerListSchema = paginationSchema.extend({
  isBlocked: booleanish.optional(),
});

/* --------------------------------- coupons ------------------------------- */

export const couponBodySchema = z.object({
  code: trimmed(24)
    .min(3, 'Code must be at least 3 characters')
    .transform((value) => value.toUpperCase()),
  description: z.string().trim().max(200).optional().default(''),
  discountType: z.enum(['percentage', 'fixed']).optional().default('percentage'),
  discountValue: numberish.pipe(z.number().min(0, 'Discount cannot be negative')),
  maxDiscountAmount: nullableNumber,
  minimumOrderValue: numberish.optional().default(0),
  minimumQuantity: numberish.optional().default(1),
  usageLimit: nullableNumber,
  perUserLimit: nullableNumber,
  validFrom: nullableNumber,
  validUntil: nullableNumber,
  applicableCategories: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(50).optional().default([]),
  applicableProducts: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(200).optional().default([]),
  isActive: booleanish.optional().default(true),
});

export const couponUpdateSchema = couponBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

/* --------------------------------- banners ------------------------------- */

export const bannerBodySchema = z.object({
  title: trimmed(120).min(1, 'Title is required'),
  subtitle: z.string().trim().max(200).optional().default(''),
  image: z.string().trim().optional().default(''),
  mobileImage: z.string().trim().optional().default(''),
  ctaLabel: z.string().trim().max(40).optional().default(''),
  ctaLink: z.string().trim().max(200).optional().default(''),
  placement: z.enum(['home-hero', 'home-mid', 'category-top', 'popup']).optional().default('home-hero'),
  order: numberish.optional().default(0),
  isActive: booleanish.optional().default(true),
  startsAt: nullableNumber,
  endsAt: nullableNumber,
});

export const bannerUpdateSchema = bannerBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

export const bannerListSchema = paginationSchema.extend({
  placement: z.enum(['home-hero', 'home-mid', 'category-top', 'popup']).optional(),
  isActive: booleanish.optional(),
});

/* -------------------------------- settings ------------------------------- */

export const settingBodySchema = z.object({
  business: z
    .object({
      name: trimmed(120).optional(),
      legalName: trimmed(160).optional(),
      email: z.union([z.literal(''), z.string().email()]).optional(),
      phone: trimmed(40).optional(),
      whatsapp: trimmed(40).optional(),
      gstNumber: trimmed(40).optional(),
      address: z.string().trim().max(400).optional(),
      city: trimmed(80).optional(),
      state: trimmed(80).optional(),
      postalCode: trimmed(20).optional(),
      country: trimmed(80).optional(),
    })
    .optional(),
  commerce: z
    .object({
      currency: trimmed(8).optional(),
      taxPercent: numberish.pipe(z.number().min(0).max(100)).optional(),
      shippingFlatRate: numberish.pipe(z.number().min(0)).optional(),
      freeShippingThreshold: numberish.pipe(z.number().min(0)).optional(),
      defaultLowStockThreshold: numberish.pipe(z.number().min(0)).optional(),
    })
    .optional(),
  seo: z
    .object({
      defaultTitle: trimmed(70).optional(),
      titleSuffix: trimmed(70).optional(),
      defaultDescription: z.string().trim().max(300).optional(),
      ogImage: z.string().trim().optional(),
    })
    .optional(),
  social: z
    .object({
      facebook: z.string().trim().max(200).optional(),
      instagram: z.string().trim().max(200).optional(),
      linkedin: z.string().trim().max(200).optional(),
      twitter: z.string().trim().max(200).optional(),
      youtube: z.string().trim().max(200).optional(),
    })
    .optional(),
  enquiry: z
    .object({
      autoAckEnabled: booleanish.optional(),
      autoAckMessage: z.string().trim().max(2000).optional(),
      notifyEmails: z
        .union([z.array(z.string().email()), z.string()])
        .optional()
        .transform((value) =>
          Array.isArray(value)
            ? value
            : (value ?? '')
                .split(',')
                .map((entry) => entry.trim())
                .filter(Boolean),
        ),
    })
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryInput = z.infer<typeof categoryBodySchema>;
export type ProductInput = z.infer<typeof productBodySchema>;
export type EnquiryInput = z.infer<typeof enquiryBodySchema>;
export type OrderInput = z.infer<typeof orderBodySchema>;
export type CustomerInput = z.infer<typeof customerBodySchema>;
export type CouponInput = z.infer<typeof couponBodySchema>;
export type BannerInput = z.infer<typeof bannerBodySchema>;
export type SettingsInput = z.infer<typeof settingBodySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ProductListInput = z.infer<typeof productListSchema>;
export type CategoryListInput = z.infer<typeof categoryListSchema>;
export type EnquiryListInput = z.infer<typeof enquiryListSchema>;
export type OrderListInput = z.infer<typeof orderListSchema>;
export type CustomerListInput = z.infer<typeof customerListSchema>;
export type CouponListInput = PaginationInput;
export type BannerListInput = z.infer<typeof bannerListSchema>;
export type BulkProductActionInput = z.infer<typeof bulkProductActionSchema>;