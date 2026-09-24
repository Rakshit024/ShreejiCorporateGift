import type { BrandingService } from '../types';

/** From source HTML — Custom Printing & Branding section */
export const brandingServices: BrandingService[] = [
  {
    id: 'mug-print',
    name: 'Mug Print',
    description: 'Custom logo and artwork on corporate mugs.',
  },
  {
    id: 'tshirt-print',
    name: 'T-shirt Print',
    description: 'Branded apparel for events, teams and promotions.',
  },
  {
    id: 'pillow-print',
    name: 'Pillow Print',
    description: 'Custom printed pillows for corporate and festive gifting.',
  },
  {
    id: 'bottle-print',
    name: 'Bottle Print',
    description: 'Logo branding on bottles and sippers.',
  },
  {
    id: 'pen-diary-branding',
    name: 'Pen & Diary Branding',
    description: 'Professional branding on pens and diaries.',
  },
  {
    id: 'corporate-logo',
    name: 'Corporate Logo Printing',
    description: 'End-to-end logo application across promotional products.',
  },
];

export const brandingProcessSteps = [
  { title: 'Product', description: 'Choose from our catalog or bring your item.' },
  { title: 'Custom logo / design', description: 'Share artwork for branding.' },
  { title: 'Bulk production', description: 'Production aligned to your quantity.' },
  { title: 'Corporate delivery', description: 'Delivery as per your business requirement.' },
];
