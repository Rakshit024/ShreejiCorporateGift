import { Schema, model, type InferSchemaType } from 'mongoose';

/**
 * A bulk-quote submission from the storefront. Field names mirror
 * `BulkQuoteFormData` in web/src/types/index.ts so the admin can show them as-is.
 */
const enquirySchema = new Schema(
  {
    reference: { type: String, unique: true, index: true },

    name: { type: String, required: true, trim: true },
    companyName: { type: String, default: '', trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },

    product: { type: String, default: '', trim: true },
    quantity: { type: String, default: '', trim: true },
    brandingRequired: { type: String, default: '', trim: true },
    deliveryLocation: { type: String, default: '', trim: true },
    requiredDate: { type: String, default: '' },
    message: { type: String, default: '', trim: true, maxlength: 4000 },

    /** Full quote-cart snapshot so the enquiry survives later product edits. */
    items: {
      type: [
        new Schema(
          {
            productId: { type: Schema.Types.ObjectId, ref: 'Product' },
            productName: String,
            quantity: { type: Number, min: 1 },
            brandingOptionId: { type: String, default: null },
            brandingLabel: { type: String, default: '' },
            unitPrice: { type: Number, min: 0 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },

    source: { type: String, enum: ['quote-form', 'quote-cart', 'contact', 'manual'], default: 'quote-form' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'quoted', 'won', 'lost'],
      default: 'new',
      index: true,
    },
    adminNotes: { type: String, default: '', trim: true, maxlength: 4000 },
    quotedAmount: { type: Number, default: null, min: 0 },
  },
  { timestamps: true },
);

enquirySchema.index({ createdAt: -1 });

export type EnquiryDoc = InferSchemaType<typeof enquirySchema>;
export const Enquiry = model('Enquiry', enquirySchema);