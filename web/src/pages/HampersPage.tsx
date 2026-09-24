import { PageMeta } from '../components/common/PageMeta';
import { HampersSection } from '../components/home/HampersSection';
import { pageTitle } from '../config/seo';

export function HampersPage() {
  return (
    <>
      <PageMeta
        title={pageTitle('Corporate Hampers')}
        description="Corporate hampers for clients, employees and festivals — request a hamper quote."
      />
      <h1 className="visually-hidden">Corporate Hampers</h1>
      <HampersSection />
    </>
  );
}
