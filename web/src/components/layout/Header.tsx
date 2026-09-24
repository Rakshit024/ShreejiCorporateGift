import { Menu, MessageCircle, Search, ShoppingBag, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.jpg';
import { COMPANY } from '../../data/company';
import { useQuoteCart } from '../../context/QuoteCartContext';
import { openWhatsApp, generateGeneralEnquiryMessage } from '../../utils/whatsapp';
import { Button } from '../common/Button';
import { ProductSearch } from '../product/ProductSearch';
import styles from './Header.module.css';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
  { to: '/hampers', label: 'Corporate Hampers' },
  { to: '/custom-branding', label: 'Custom Branding' },
  { to: '/#why-us', label: 'Why Us' },
  { to: '/contact', label: 'Contact' },
];

interface HeaderProps {
  onOpenQuote: () => void;
}

export function Header({ onOpenQuote }: HeaderProps) {
  const [scrolled, setScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY > 8,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const previousPathname = useRef(location.pathname);
  const currentUrlSearch = new URLSearchParams(location.search).get('search') ?? '';
  const previousUrlSearch = useRef(currentUrlSearch);
  const { itemCount } = useQuoteCart();

  useEffect(() => {
    if (previousUrlSearch.current === currentUrlSearch) return;
    previousUrlSearch.current = currentUrlSearch;
    // oxlint-disable-next-line react/set-state-in-effect
    setSearch(currentUrlSearch);
  }, [currentUrlSearch]);

  // Close the menu on path changes, but keep it open while catalog search params update.
  useEffect(() => {
    if (previousPathname.current === location.pathname) return;
    previousPathname.current = location.pathname;
    // oxlint-disable-next-line react/set-state-in-effect
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitSearch = (value: string) => {
    const q = value.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setMobileOpen(false);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className="container">
        <div className={styles.inner}>
          <Link
            to="/"
            className={styles.logo}
            aria-label={COMPANY.name}
            onClick={() => {
              setSearch('');
              setMobileOpen(false);
            }}
          >
            <img src={logo} alt="" width={44} height={44} />
            <span className={styles.logoText}>{COMPANY.name}</span>
          </Link>

          <nav className={styles.nav} aria-label="Main">
            {navItems.map((item) => {
              const isHashLink = item.to.includes('#');
              const hash = isHashLink ? item.to.slice(item.to.indexOf('#')) : '';
              const itemPath = item.to.split('#')[0] || '/';
              const active = isHashLink
                ? location.pathname === '/' && location.hash === hash
                : !location.hash &&
                  (location.pathname === itemPath ||
                    (itemPath !== '/' && location.pathname.startsWith(`${itemPath}/`)));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={active ? styles.active : ''}
                  aria-current={active ? 'page' : undefined}
                  onClick={(event) => {
                    setSearch('');
                    if (!isHashLink) return;
                    if (location.pathname !== '/' || location.hash !== hash) return;
                    event.preventDefault();
                    const reduceMotion =
                      typeof window.matchMedia === 'function' &&
                      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    document.getElementById(hash.slice(1))?.scrollIntoView({
                      behavior: reduceMotion ? 'auto' : 'smooth',
                      block: 'start',
                    });
                    document.getElementById('main-content')?.focus({ preventScroll: true });
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.searchDesktop}>
            <ProductSearch
              compact
              value={search}
              onChange={setSearch}
              id="header-search"
              inputProps={{
                onKeyDown: (e) => {
                  if (e.key === 'Enter') submitSearch(search);
                },
              }}
            />
          </div>

          <div className={styles.actions}>
            <Button
              variant="ghost"
              iconOnly
              className={styles.menuBtn}
              aria-label="Search products"
              aria-controls="mobile-navigation"
              aria-expanded={mobileOpen}
              onClick={() => {
                if (mobileOpen) {
                  document.getElementById('mobile-header-search')?.focus();
                } else {
                  setMobileOpen(true);
                  window.requestAnimationFrame(() => {
                    document.getElementById('mobile-header-search')?.focus();
                  });
                }
              }}
            >
              <Search size={20} />
            </Button>
            <Button
              variant="ghost"
              iconOnly
              className={styles.cartBtn}
              aria-label={`Open quote cart${itemCount ? `, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}` : ''}`}
              onClick={() => {
                setMobileOpen(false);
                onOpenQuote();
              }}
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className={styles.badge} aria-hidden="true">
                  {itemCount}
                </span>
              )}
            </Button>
            <Button
              variant="whatsapp"
              size="sm"
              className={styles.waDesktop}
              onClick={() => openWhatsApp(generateGeneralEnquiryMessage())}
            >
              <MessageCircle size={18} /> WhatsApp
            </Button>
            <Button
              variant="ghost"
              iconOnly
              className={styles.menuBtn}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-controls="mobile-navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <nav id="mobile-navigation" className={styles.mobileNav} aria-label="Mobile navigation">
            <div className={styles.mobileSearch}>
              <ProductSearch
                value={search}
                onChange={setSearch}
                id="mobile-header-search"
              />
              <Button
                variant="primary"
                fullWidth
                style={{ marginTop: '0.5rem' }}
                onClick={() => submitSearch(search)}
              >
                Search catalog
              </Button>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => {
                  setSearch('');
                  setMobileOpen(false);
                }}
              >
                {item.label}
              </Link>
            ))}
            <Button
              variant="whatsapp"
              fullWidth
              onClick={() => openWhatsApp(generateGeneralEnquiryMessage())}
            >
              WhatsApp Us
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
