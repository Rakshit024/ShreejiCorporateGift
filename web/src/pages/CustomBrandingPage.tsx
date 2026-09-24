import { PageMeta } from '../components/common/PageMeta';
import { BrandingServicesGrid } from '../components/home/BrandingSection';
import { brandingProcessSteps } from '../data/services';
import { pageTitle } from '../config/seo';
import styles from '../components/home/HomeSections.module.css';

export function CustomBrandingPage() {
  return (
    <>
      <PageMeta
        title={pageTitle('Custom Printing & Branding')}
        description="Custom mug, bottle, apparel, pen and diary branding for corporate gifts."
      />
      <section className="section">
        <div className="container">
          <h1 className="section-title">Custom Printing & Branding</h1>
          <p className="section-subtitle">
            Mug Print · T-shirt Print · Pillow Print · Bottle Print · Pen & Diary Branding ·
            Corporate Logo Printing
          </p>
          <div className={styles.process} style={{ marginBottom: '2rem' }}>
            {brandingProcessSteps.map((step) => (
              <div key={step.title} className={styles.processStep}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
          <BrandingServicesGrid />
        </div>
      </section>
    </>
  );
}
