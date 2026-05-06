import React from 'react';
import { Truck, MapPin, CreditCard, Clock } from 'lucide-react';
import './InfoPages.css';

const ShippingInfo = () => {
  return (
    <div className="info-page fade-in">
      <div className="info-container">
        <header className="info-header">
          <h1 className="info-title">Shipping Info</h1>
          <p className="section-subtitle">Fast, reliable, and secure delivery to your doorstep.</p>
        </header>

        <section className="info-section">
          <h3><Clock size={24} /> Delivery Timelines</h3>
          <div className="info-content">
            <div className="measure-grid">
              <div className="measure-item">
                <h4>Metro Cities</h4>
                <p>3–4 Business Days</p>
              </div>
              <div className="measure-item">
                <h4>Other Cities</h4>
                <p>5–7 Business Days</p>
              </div>
              <div className="measure-item">
                <h4>Remote Areas</h4>
                <p>7–10 Business Days</p>
              </div>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h3><MapPin size={24} /> Delivery Locations</h3>
          <div className="info-content">
            <p>We ship across India, covering over 19,000 pin codes. We partner with India's leading courier services to ensure your package arrives safely.</p>
            <div className="highlight-box">
              <Truck className="text-gold" size={24} />
              <div>
                <p>Our Courier Partners</p>
                <span className="text-sm">BlueDart, Delhivery, Ecom Express, and India Post.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h3><CreditCard size={24} /> Cash on Delivery (COD)</h3>
          <div className="info-content">
            <p>Yes, we offer Cash on Delivery for most locations across India. A small convenience fee of ₹50 may apply to COD orders. You can verify COD availability at the checkout page by entering your pin code.</p>
          </div>
        </section>

        <section className="info-section">
          <h3>Tracking Your Order</h3>
          <div className="info-content">
            <p>Once your order is shipped, you will receive a tracking link via SMS and Email. You can also track your order directly from our website using the 'Order Tracking' link in the footer.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShippingInfo;
