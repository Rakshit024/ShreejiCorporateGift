import { Schema, model, type InferSchemaType } from 'mongoose';

const pricingSlabSchema = new Schema(
  {
    min: { type: Number, required: true, min: 1 },
    /** Use a very large number for "and above" instead of Infinity, which does not survive JSON. */
    max: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const printingOptionSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true, maxlength: 80 },
    pricePerUnit: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const specificationSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 60 },
    value: { type: String, required: true, trim: true, maxlength: 200 },
  },
  { _id: false },
);

/**
 * Mirrors `Product` in web/src/types/index.ts (the storefront reads these fields
 * directly), plus admin-only merchandising fields.
 */
const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    sku: { type: String, trim: true, uppercase: true, index: true, sparse: true },

    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    /** Denormalised so the storefront can render cards without a second lookup. */
    category: { type: String, required: true, trim: true },

    priceFrom: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['INR'], default: 'INR' },

    description: { type: String, default: '', trim: true, maxlength: 4000 },
    shortDescription: { type: String, default: '', trim: true, maxlength: 240 },

    image: { type: String, default: '' },
    images: { type: [String], default: [] },

    featured: { type: Boolean, default: false, index: true },
    customizable: { type: Boolean, default: false },
    bulkPricing: { type: Boolean, default: true },
    available: { type: Boolean, default: true, index: true },

    printingOptions: { type: [printingOptionSchema], default: [] },
    pricingSlabs: { type: [pricingSlabSchema], default: [] },
    specifications: { type: [specificationSchema], default: [] },
    tags: { type: [String], default: [] },

    /** Admin-only inventory. The storefront treats `available` as the gate. */
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    minimumOrderQuantity: { type: Number, default: 1, min: 1 },
    leadTimeDays: { type: Number, default: null },

    metaTitle: { type: String, default: '', trim: true, maxlength: 70 },
    metaDescription: { type: String, default: '', trim: true, maxlength: 180 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Powers the storefront catalog search box.
productSchema.index({ name: 'text', description: 'text', shortDescription: 'text', tags: 'text' });
productSchema.index({ categoryId: 1, available: 1 });
productSchema.index({ priceFrom: 1 });
productSchema.index({ createdAt: -1 });

productSchema.virtual('inStock').get(function (this: { available?: boolean; stock?: number }) {
  return Boolean(this.available) && (this.stock ?? 0) > 0;
});

export type ProductDoc = InferSchemaType<typeof productSchema>;
export const Product = model('Product', productSchema);