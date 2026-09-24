import { MessageCircle } from 'lucide-react';
import { generateGeneralEnquiryMessage, openWhatsApp } from '../../utils/whatsapp';
import styles from './FloatingWhatsApp.module.css';

export function FloatingWhatsApp() {
  return (
    <button
      type="button"
      className={styles.fab}
      aria-label="Chat on WhatsApp"
      onClick={() => openWhatsApp(generateGeneralEnquiryMessage())}
    >
      <MessageCircle size={26} />
    </button>
  );
}
