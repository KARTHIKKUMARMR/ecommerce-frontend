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
              <img src="/logo.png" alt="HASHTHAKALA Logo" className="footer-logo-image" />
            </div>
            <p className="footer-desc">
              Srikalahasthikala is an ancient Indian ethnic hand art on textiles. Tiny wonder we have firmly established ourselves in srikalahasthi. Our collections are premium sarees, Duppattas, dress materials and running fabrics. Srikalahasthikala is vowed to provide eco-friendly swadeshi products
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
                { to: '/products?category=Kurtis', label: 'Kurtis' },
                { to: '/products?category=Earrings', label: 'Earrings' },
                { to: '/products?category=Bangles', label: 'Bangles' },
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
                { to: '/profile', label: 'Order Tracking' },
                { to: '#', label: 'Size Guide' },
                { to: '#', label: 'Return Policy' },
                { to: '#', label: 'Shipping Info' },
                { to: '#', label: 'FAQ' },
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
            <div className="business-id">
              <span className="bid-label">Business ID:</span>
              <span className="bid-value">BN-2024-IN-007</span>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <div className="newsletter-inner">
            <div className="newsletter-text">
              <h4>Join Our Royal Circle</h4>
              <p>Get exclusive offers, new arrivals & festive collection updates</p>
            </div>
            <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" className="form-input newsletter-input" />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-ornament-bottom" />

      {/* Bottom footer */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p className="footer-copy">© 2024 Srikalahasthikala. All rights reserved.</p>
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
