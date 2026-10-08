import { Schema, model, type InferSchemaType } from 'mongoose';

/** Mirrors `Category` in web/src/types/index.ts, plus admin-only fields. */
const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '', trim: true, maxlength: 400 },
    /** Lucide icon name, resolved on the client via CategoryIcon. */
    icon: { type: String, default: 'Gift', trim: true },
    image: { type: String, default: '' },
    /** Lower numbers render first on the storefront. */
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seoTitle: { type: String, default: '', trim: true, maxlength: 70 },
    seoDescription: { type: String, default: '', trim: true, maxlength: 180 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId',
  count: true,
});

export type CategoryDoc = InferSchemaType<typeof categorySchema>;
export const Category = model('Category', categorySchema);