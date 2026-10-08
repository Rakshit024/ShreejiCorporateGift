import { Schema, model, type InferSchemaType } from 'mongoose';

const bannerSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subtitle: { type: String, default: '', trim: true, maxlength: 200 },
    image: { type: String, default: '' },
    mobileImage: { type: String, default: '' },
    ctaLabel: { type: String, default: '', trim: true, maxlength: 40 },
    ctaLink: { type: String, default: '', trim: true, maxlength: 200 },

    placement: {
      type: String,
      enum: ['home-hero', 'home-mid', 'category-top', 'popup'],
      default: 'home-hero',
      index: true,
    },
    order: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true, index: true },
    /** Optional scheduling window; null means always visible. */
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { timestamps: true },
);

bannerSchema.index({ placement: 1, order: 1 });

export type BannerDoc = InferSchemaType<typeof bannerSchema>;
export const Banner = model('Banner', bannerSchema);