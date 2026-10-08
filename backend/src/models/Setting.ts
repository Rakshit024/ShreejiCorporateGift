import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

/**
 * Singleton document holding editable business configuration. Only ever one row
 * (`key: 'default'`), written via `Setting.get()` / `Setting.save()`.
 */
const settingSchema = new Schema(
  {
    key: { type: String, default: 'default', unique: true, immutable: true },

    business: {
      type: new Schema(
        {
          name: { type: String, default: 'Shreeji Corporate Gift' },
          legalName: { type: String, default: '' },
          email: { type: String, default: '' },
          phone: { type: String, default: '' },
          whatsapp: { type: String, default: '' },
          gstNumber: { type: String, default: '' },
          address: { type: String, default: '' },
          city: { type: String, default: '' },
          state: { type: String, default: '' },
          postalCode: { type: String, default: '' },
          country: { type: String, default: 'India' },
        },
        { _id: false },
      ),
      default: () => ({}),
    },

    commerce: {
      type: new Schema(
        {
          currency: { type: String, default: 'INR' },
          /** GST / VAT rate applied at checkout, as a percentage. */
          taxPercent: { type: Number, default: 0, min: 0 },
          shippingFlatRate: { type: Number, default: 0, min: 0 },
          freeShippingThreshold: { type: Number, default: 0, min: 0 },
          defaultLowStockThreshold: { type: Number, default: 5, min: 0 },
        },
        { _id: false },
      ),
      default: () => ({}),
    },

    seo: {
      type: new Schema(
        {
          defaultTitle: { type: String, default: '' },
          titleSuffix: { type: String, default: '' },
          defaultDescription: { type: String, default: '' },
          ogImage: { type: String, default: '' },
        },
        { _id: false },
      ),
      default: () => ({}),
    },

    social: {
      type: new Schema(
        {
          facebook: { type: String, default: '' },
          instagram: { type: String, default: '' },
          linkedin: { type: String, default: '' },
          twitter: { type: String, default: '' },
          youtube: { type: String, default: '' },
        },
        { _id: false },
      ),
      default: () => ({}),
    },

    enquiry: {
      type: new Schema(
        {
          autoAckEnabled: { type: Boolean, default: false },
          autoAckMessage: { type: String, default: '' },
          /** Emails that receive a copy of every new enquiry. */
          notifyEmails: { type: [String], default: [] },
        },
        { _id: false },
      ),
      default: () => ({}),
    },
  },
  { timestamps: true },
);

export type SettingDoc = InferSchemaType<typeof settingSchema>;
export type SettingHydrated = HydratedDocument<SettingDoc>;
export const Setting = model('Setting', settingSchema);

export async function getSettings(): Promise<SettingHydrated> {
  const existing = await Setting.findOne({ key: 'default' });
  if (existing) return existing;
  return Setting.create({ key: 'default' });
}