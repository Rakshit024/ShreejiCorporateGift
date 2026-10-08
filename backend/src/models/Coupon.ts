import { Schema, model, type InferSchemaType } from 'mongoose';

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
      index: true,
    },
    description: { type: String, default: '', trim: true, maxlength: 200 },

    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, default: null, min: 0 },

    minimumOrderValue: { type: Number, default: 0, min: 0 },
    minimumQuantity: { type: Number, default: 1, min: 1 },

    usageLimit: { type: Number, default: null, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: null, min: 1 },

    validFrom: { type: Date, default: null },
    validUntil: { type: Date, default: null },

    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

couponSchema.virtual('isExpired').get(function (this: { validUntil?: Date | null }) {
  const until = this.validUntil;
  return Boolean(until && until.getTime() < Date.now());
});

couponSchema.virtual('isExhausted').get(function (this: { usageLimit?: number | null; usedCount?: number }) {
  const limit = this.usageLimit;
  return Boolean(limit && (this.usedCount ?? 0) >= limit);
});

export type CouponDoc = InferSchemaType<typeof couponSchema>;
export const Coupon = model('Coupon', couponSchema);