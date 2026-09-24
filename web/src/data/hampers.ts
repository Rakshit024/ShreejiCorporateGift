import type { Hamper } from '../types';

/** Hamper offerings are configurable in this file. */
export const hampers: Hamper[] = [
  {
    id: 'corporate-hamper',
    name: 'Corporate Hamper',
    description:
      'Thoughtful combinations for clients, employees and festivals.',
    items: ['Custom hamper contents available on enquiry'],
    priceFrom: null,
    image: '/products/hamper-placeholder.svg',
    occasions: ['Clients', 'Employees', 'Festivals'],
    placeholder: true,
  },
  {
    id: 'festive-hamper',
    name: 'Festive Gifting Hamper',
    description: 'Curated festive gifting — configure items and pricing for your catalog.',
    items: ['Custom hamper contents available on enquiry'],
    priceFrom: null,
    image: '/products/hamper-placeholder.svg',
    occasions: ['Festivals', 'Corporate events'],
    placeholder: true,
  },
  {
    id: 'employee-appreciation',
    name: 'Employee Appreciation Hamper',
    description: 'Recognition hampers for teams, milestones and employee celebrations.',
    items: ['Custom hamper contents available on enquiry'],
    priceFrom: null,
    image: '/products/hamper-placeholder.svg',
    occasions: ['Employee recognition', 'Milestones'],
    placeholder: true,
  },
];
