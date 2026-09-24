import { MotionConfig } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { FloatingWhatsApp } from './components/layout/FloatingWhatsApp';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { PageMeta } from './components/common/PageMeta';
import { EmptyState } from './components/common/EmptyState';
import { ButtonLink } from './components/common/Button';
import { QuoteDrawer } from './components/quote/QuoteDrawer';
import { FavoritesProvider } from './context/FavoritesContext';
import { QuoteCartProvider } from './context/QuoteCartContext';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryProductsPage } from './pages/CategoryProductsPage';
import { ContactPage } from './pages/ContactPage';
import { CustomBrandingPage } from './pages/CustomBrandingPage';
import { HampersPage } from './pages/HampersPage';
import { HomePage } from './pages/HomePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { ProductsPage } from './pages/ProductsPage';
import { QuotePage } from './pages/QuotePage';
import { pageTitle } from './config/seo';
import './index.css';

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hash) {
      let id: string;
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        id = hash.slice(1);
      }

      window.requestAnimationFrame(() => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start',
          });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
        document.getElementById('main-content')?.focus({ preventScroll: true });
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return null;
}

function NotFoundPage() {
  return (
    <>
      <PageMeta
        title={pageTitle('Page Not Found')}
        description="The page you requested could not be found."
      />
      <section className="section">
        <div className="container">
          <EmptyState
            title="Page not found"
            description="The page you requested may have moved or no longer exists."
            action={
              <ButtonLink to="/" variant="gold">
                Back to home
              </ButtonLink>
            }
          />
        </div>
      </section>
    </>
  );
}

function AppShell() {
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <>
      <ScrollManager />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <AnnouncementBar />
      <Header onOpenQuote={() => setQuoteOpen(true)} />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryProductsPage />} />
          <Route path="/hampers" element={<HampersPage />} />
          <Route path="/custom-branding" element={<CustomBrandingPage />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <FloatingWhatsApp />
      <QuoteDrawer open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
        <QuoteCartProvider>
          <MotionConfig reducedMotion="user">
            <AppShell />
          </MotionConfig>
        </QuoteCartProvider>
      </FavoritesProvider>
    </BrowserRouter>
  );
}
