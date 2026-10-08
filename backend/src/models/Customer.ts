import { Schema, model, type InferSchemaType } from 'mongoose';

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: '', trim: true },
    companyName: { type: String, default: '', trim: true, index: true },
    companyWebsite: { type: String, default: '', trim: true },

    billingAddress: {
      type: new Schema(
        {
          line1: { type: String, default: '' },
          line2: { type: String, default: '' },
          city: { type: String, default: '' },
          state: { type: String, default: '' },
          postalCode: { type: String, default: '' },
          country: { type: String, default: 'India' },
        },
        { _id: false },
      ),
      default: () => ({}),
    },

    notes: { type: String, default: '', trim: true, maxlength: 2000 },
    tags: { type: [String], default: [] },
    isBlocked: { type: Boolean, default: false },
    marketingOptIn: { type: Boolean, default: false },

    totalSpent: { type: Number, default: 0, min: 0 },
    orderCount: { type: Number, default: 0, min: 0 },
    enquiryCount: { type: Number, default: 0, min: 0 },
    lastOrderAt: { type: Date },
  },
  { timestamps: true },
);

customerSchema.index({ name: 'text', companyName: 'text', email: 'text' });

export type CustomerDoc = InferSchemaType<typeof customerSchema>;
export const Customer = model('Customer', customerSchema);