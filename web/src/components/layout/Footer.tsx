import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.jpg';
import { COMPANY } from '../../data/company';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <img src={logo} alt={COMPANY.name} width={48} height={48} />
            <p className={styles.tagline}>{COMPANY.tagline}</p>
          </div>
          <div className={styles.col}>
            <h3>Quick Links</h3>
            <nav className={styles.links} aria-label="Footer">
              <Link to="/">Home</Link>
              <Link to="/products">Products</Link>
              <Link to="/hampers">Corporate Hampers</Link>
              <Link to="/custom-branding">Custom Printing</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>
          <div className={styles.col}>
            <h3>Contact</h3>
            <div className={styles.contact}>
              <p>{COMPANY.phone}</p>
              <p>WhatsApp Available</p>
              <p>{COMPANY.locationShort}</p>
            </div>
          </div>
        </div>
        <p className={styles.bottom}>
          © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
