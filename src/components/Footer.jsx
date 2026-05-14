import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      {/* Temple arch top decoration */}
      <div className="footer-arch-row">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="footer-arch" />
        ))}
      </div>

      <div className="footer-ornament-top" />

      <div className="container">
        <div className="footer-grid">
          {/* Brand column */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="ApsarasFashions Logo" className="footer-logo-image" />
            </div>
            <p className="footer-desc">
              ApsarasFashions brings you the finest Indian ethnic hand art on textiles. We have firmly established ourselves with premium sarees, dupattas, dress materials and running fabrics. ApsarasFashions is committed to providing eco-friendly swadeshi products.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-btn" aria-label="Facebook">FB</a>
              <a href="#" className="social-btn" aria-label="Instagram">IG</a>
              <a href="#" className="social-btn" aria-label="Twitter">TW</a>
              <a href="#" className="social-btn" aria-label="Youtube">YT</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-title">Our Collections</h4>
            <div className="footer-ornament-small">⬥ ⬦ ⬥</div>
            <ul className="footer-links">
              {[
                { to: '/products?category=Sarees', label: 'Sarees' },
                { to: '/products?category=Dupattas', label: 'Dupattas' },
                { to: '/products?category=Dress Materials', label: 'Dress Materials' },
                { to: '/products?category=Running Fabric', label: 'Running Fabric' },
                { to: '/products?sale=true', label: 'Sale & Offers' },
                { to: '/products?featured=true', label: 'Featured Picks' },
              ].map(l => (
                <li key={l.to}><Link to={l.to} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="footer-col">
            <h4 className="footer-title">Quick Help</h4>
            <div className="footer-ornament-small">⬥ ⬦ ⬥</div>
            <ul className="footer-links">
              {[
                { to: '/profile', label: 'My Account' },
                { to: '/track', label: 'Order Tracking' },
                { to: '/size-guide', label: 'Size Guide' },
                { to: '/return-policy', label: 'Return Policy' },
                { to: '/shipping-info', label: 'Shipping Info' },
                { to: '/faq', label: 'FAQ' },
              ].map(l => (
                <li key={l.label}><Link to={l.to} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-title">Contact Us</h4>
            <div className="footer-ornament-small">⬥ ⬦ ⬥</div>
            <div className="contact-list">
              <div className="contact-item">
                <Phone size={15} />
                <div>
                  <p className="contact-label">Phone</p>
                  <a href="tel:8897270798" className="contact-value">8897270798</a>
                </div>
              </div>
              <div className="contact-item">
                <Mail size={15} />
                <div>
                  <p className="contact-label">Email Us</p>
                  <a href="mailto:srihastikala@gmail.com" className="contact-value">srihastikala@gmail.com</a>
                </div>
              </div>
              <div className="contact-item">
                <MapPin size={15} />
                <div>
                  <p className="contact-label">Store Location</p>
                  <span className="contact-value">Srikalahasthi, Andhra Pradesh, India</span>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>

      <div className="footer-ornament-bottom" />

      {/* Bottom footer */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p className="footer-copy">© {new Date().getFullYear()} ApsarasFashions. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#" className="footer-link-sm">Privacy Policy</a>
              <span>·</span>
              <a href="#" className="footer-link-sm">Terms of Service</a>
              <span>·</span>
              <a href="#" className="footer-link-sm">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
