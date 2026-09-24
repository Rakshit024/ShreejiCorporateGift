import { MessageCircle, Phone } from 'lucide-react';
import { COMPANY } from '../../data/company';
import { openWhatsApp, generateGeneralEnquiryMessage } from '../../utils/whatsapp';
import { Button, ButtonLink } from '../common/Button';
import styles from './HomeSections.module.css';

export function ContactSection() {
  return (
    <section className="section" id="contact-preview">
      <div className="container">
        <div className={styles.contactBand}>
          <div>
            <h2 className="section-title" style={{ marginBottom: '0.35rem' }}>
              Contact Shreeji Corporate Gift
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              {COMPANY.locationShort} · WhatsApp available for product and bulk quote enquiries.
            </p>
            <p style={{ margin: '0.5rem 0 0', fontWeight: 700, color: 'var(--color-navy)' }}>
              <Phone size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
              {COMPANY.phone}
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Button variant="whatsapp" onClick={() => openWhatsApp(generateGeneralEnquiryMessage())}>
              <MessageCircle size={18} /> WhatsApp Us
            </Button>
            <ButtonLink to="/contact" variant="outline">
              Contact page
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
