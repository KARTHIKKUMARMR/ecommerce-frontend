import React, { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import './InfoPages.css';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button 
        className={`faq-question ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        <ChevronDown className="faq-icon" size={20} />
      </button>
      <div className="faq-answer">
        <p>{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Browse our collection, select your items, and add them to the cart. Click on the cart icon, proceed to checkout, enter your shipping details, and choose your preferred payment method. Once the payment is confirmed, your order is placed!"
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order by clicking on the 'Order Tracking' link in the footer. Enter your Order ID and Billing Email to see the current status of your shipment."
    },
    {
      question: "What is the return process?",
      answer: "To return an item, log in to your account and go to the 'My Orders' section. Select the order you want to return and click 'Return Items'. Follow the instructions to pack and ship the item back to us."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards, UPI, Net Banking, and Cash on Delivery (COD)."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within India. We are working on expanding our services to international locations soon."
    },
    {
      question: "How do I change or cancel my order?",
      answer: "You can cancel your order within 24 hours of placement as long as it hasn't been shipped. Please contact our customer support team for any changes or cancellations."
    }
  ];

  return (
    <div className="info-page fade-in">
      <div className="info-container">
        <header className="info-header">
          <h1 className="info-title">Frequently Asked Questions</h1>
          <p className="section-subtitle">Got questions? We've got answers.</p>
        </header>

        <div className="info-section">
          <h3><MessageSquare size={24} /> General Questions</h3>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        <div className="highlight-box">
          <p>Didn't find what you were looking for?</p>
          <div className="contact-card">
            <a href="mailto:srihastikala@gmail.com" className="contact-button btn-email">
              Email Us
            </a>
            <a href="https://wa.me/918897270798" target="_blank" rel="noopener noreferrer" className="contact-button btn-whatsapp">
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
