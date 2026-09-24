import { brandingProcessSteps, brandingServices } from '../../data/services';
import { ButtonLink } from '../common/Button';
import styles from './HomeSections.module.css';

export function BrandingSection() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Custom Printing & Branding</h2>
        <p className="section-subtitle">
          Mug Print · T-shirt Print · Pillow Print · Bottle Print · Pen & Diary Branding · Corporate
          Logo Printing
        </p>
        <div className={styles.process}>
          {brandingProcessSteps.map((step) => (
            <div key={step.title} className={styles.processStep}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <ButtonLink to="/custom-branding" variant="primary">
            Explore custom branding
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

export function BrandingServicesGrid() {
  return (
    <div className={styles.serviceGrid}>
      {brandingServices.map((s) => (
        <article key={s.id} className={styles.serviceCard}>
          <h3>{s.name}</h3>
          <p>{s.description}</p>
        </article>
      ))}
    </div>
  );
}
