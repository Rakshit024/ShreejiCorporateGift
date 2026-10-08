export type Currency = 'INR';

export interface PricingSlab {
  min: number;
  max: number;
  price: number;
}

export interface PrintingOption {
  id: string;
  label: string;
  pricePerUnit: number;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Hamper {
  slug: string;
  name: string;
  description: string;
  priceFrom: number;
  image: string;
  occasions: string[];
  items: string[];
}