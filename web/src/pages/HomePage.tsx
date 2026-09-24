import { PageMeta } from '../components/common/PageMeta';
import { Hero } from '../components/home/Hero';
import { TrustBar } from '../components/home/TrustBar';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { BulkQuoteCTA } from '../components/home/BulkQuoteCTA';
import { BrandingSection } from '../components/home/BrandingSection';
import { HampersSection } from '../components/home/HampersSection';
import { WhyUs } from '../components/home/WhyUs';
import { ContactSection } from '../components/home/ContactSection';
import { DEFAULT_SEO } from '../config/seo';

export function HomePage() {
  return (
    <>
      <PageMeta title={DEFAULT_SEO.title} description={DEFAULT_SEO.description} />
      <Hero />
      <TrustBar />
      <CategoryGrid />
      <FeaturedProducts />
      <BulkQuoteCTA />
      <BrandingSection />
      <HampersSection compact />
      <WhyUs />
      <BulkQuoteCTA />
      <ContactSection />
    </>
  );
}
