import { Schema, model, type InferSchemaType } from 'mongoose';

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    sku: { type: String, default: '' },
    image: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    brandingOptionId: { type: String, default: null },
    brandingLabel: { type: String, default: '' },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    reference: { type: String, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },

    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    customerPhone: { type: String, default: '', trim: true },
    companyName: { type: String, default: '', trim: true },
    deliveryAddress: {
      type: new Schema(
        {
          line1: { type: String, default: '', trim: true },
          line2: { type: String, default: '', trim: true },
          city: { type: String, default: '', trim: true },
          state: { type: String, default: '', trim: true },
          postalCode: { type: String, default: '', trim: true },
          country: { type: String, default: 'India', trim: true },
        },
        { _id: false },
      ),
      default: () => ({}),
    },

    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },

    couponCode: { type: String, default: '', trim: true, uppercase: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded'],
      default: 'unpaid',
      index: true,
    },
    paymentMethod: { type: String, default: '', trim: true },

    notes: { type: String, default: '', trim: true, maxlength: 2000 },
    adminNotes: { type: String, default: '', trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

orderSchema.index({ createdAt: -1 });

export type OrderDoc = InferSchemaType<typeof orderSchema>;
export const Order = model('Order', orderSchema);