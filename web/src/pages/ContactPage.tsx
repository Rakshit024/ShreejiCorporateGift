import { MessageCircle, MapPin, Phone } from 'lucide-react';
import { PageMeta } from '../components/common/PageMeta';
import { Button } from '../components/common/Button';
import { QuoteForm } from '../components/quote/QuoteForm';
import { COMPANY } from '../data/company';
import { pageTitle } from '../config/seo';
import { openWhatsApp, generateGeneralEnquiryMessage } from '../utils/whatsapp';
import styles from '../components/home/HomeSections.module.css';

export function ContactPage() {
  return (
    <>
      <PageMeta
        title={pageTitle('Contact')}
        description={`Contact ${COMPANY.name} — ${COMPANY.phone}, WhatsApp, ${COMPANY.locationShort}.`}
      />
      <section className="section">
        <div className="container">
          <h1 className="section-title">Contact</h1>
          <p className="section-subtitle">
            Reach Shreeji Corporate Gift for product enquiries, bulk quotes and corporate hampers.
          </p>
          <div className={styles.contactBand} style={{ marginBottom: '2rem' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Phone size={18} /> {COMPANY.phone}
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>WhatsApp Available</p>
              <p style={{ margin: 0, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <MapPin size={18} /> {COMPANY.location}
              </p>
            </div>
            <Button variant="whatsapp" onClick={() => openWhatsApp(generateGeneralEnquiryMessage())}>
              <MessageCircle size={18} /> WhatsApp Us
            </Button>
          </div>
          <h2 className="section-title" style={{ fontSize: '1.35rem' }}>
            Business enquiry
          </h2>
          <div style={{ maxWidth: 720 }}>
            <QuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
