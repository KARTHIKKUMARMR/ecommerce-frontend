import React from 'react';
import { RefreshCw, ShieldCheck, Clock, Package, HelpCircle } from 'lucide-react';
import './InfoPages.css';

const ReturnPolicy = () => {
  return (
    <div className="info-page fade-in">
      <div className="info-container">
        <header className="info-header">
          <h1 className="info-title">Return Policy</h1>
          <p className="section-subtitle">We want you to love what you ordered. If not, we're here to help.</p>
        </header>

        <section className="info-section">
          <h3><Clock size={24} /> 7-Day Return Window</h3>
          <div className="info-content">
            <p>You have <strong>7 days</strong> from the date of delivery to initiate a return for your items. We believe this provides ample time to ensure your purchase meets your expectations.</p>
            <div className="highlight-box">
              <ShieldCheck className="text-gold" size={24} />
              <p>Items must be unused, unwashed, and in their original packaging with all tags attached.</p>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h3><RefreshCw size={24} /> The Return Process</h3>
          <div className="info-content">
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <li>
                <strong>Initiate Request:</strong> Log in to your account and go to 'My Orders' to request a return, or contact our support team.
              </li>
              <li>
                <strong>Quality Check:</strong> Once we receive your returned item, it will undergo a quality inspection.
              </li>
              <li>
                <strong>Refund Approval:</strong> If approved, your refund will be processed to your original payment method or as store credit.
              </li>
            </ol>
          </div>
        </section>

        <section className="info-section">
          <h3><Package size={24} /> Non-Returnable Items</h3>
          <div className="info-content">
            <p>For hygiene and safety reasons, certain items cannot be returned:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Customized or personalized products</li>
              <li>Items purchased during 'Final Sale' events</li>
              <li>Innerwear and certain jewelry items</li>
            </ul>
          </div>
        </section>

        <div className="text-center mt-24">
          <p className="text-secondary"><HelpCircle size={16} inline /> Still have questions?</p>
          <div className="contact-card">
            <a href="mailto:srihastikala@gmail.com" className="contact-button btn-email">
              Email Support
            </a>
            <a href="https://wa.me/918897270798" target="_blank" rel="noopener noreferrer" className="contact-button btn-whatsapp">
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
