import { COMPANY } from '../data/company';

export const DEFAULT_SEO = {
  title: `${COMPANY.name} | Corporate Gifts & Promotional Products`,
  description:
    'Corporate gifting catalog — bulk orders, custom logo printing, promotional products and corporate hampers. Vadodara, Gujarat.',
  siteName: COMPANY.name,
  locale: 'en_IN',
};

export function pageTitle(page?: string): string {
  if (!page) return DEFAULT_SEO.title;
  return `${page} | ${COMPANY.name}`;
}
