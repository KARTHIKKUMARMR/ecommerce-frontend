import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ChevronRight, User, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const STEPS = ['Address', 'Payment', 'Review'];

// Payment options definition
const PAYMENT_OPTIONS = [
  { value: 'COD',        label: 'Cash on Delivery', icon: '💰', desc: 'Pay when you receive your order',       type: 'COD'    },
  { value: 'UPI',        label: 'UPI Payment',       icon: '📱', desc: 'Google Pay, PhonePe, Paytm, etc.',     type: 'Online' },
  { value: 'Card',       label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay',               type: 'Online' },
  { value: 'NetBanking', label: 'Net Banking',        icon: '🏦', desc: 'All major banks supported',             type: 'Online' },
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]           = useState(0);
  const [placing, setPlacing]     = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [coupon, setCoupon]       = useState('');
  const [discount, setDiscount]   = useState(0);
  // blockedMethods: set of 'COD' or 'Online' that are not allowed by any cart item
  const [blockedMethods, setBlockedMethods] = useState(new Set());

  const shipping = cartTotal > 999 ? 0 : 99;
  const total    = cartTotal + shipping;

  // Guest info (only used when user is not logged in)
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '', email: '' });

  const [address, setAddress] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    street:  '',
    city:    '',
    state:   '',
    pincode: '',
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) navigate('/cart');
  }, [cart, navigate]);

  // Determine blocked payment methods from cart products
  // We read allowedPaymentMethods from products already in cart (stored when added)
  useEffect(() => {
    const blocked = new Set();
    cart.forEach(item => {
      const allowed = item.allowedPaymentMethods;
      if (allowed && allowed.length > 0) {
        if (!allowed.includes('COD'))    blocked.add('COD');
        if (!allowed.includes('Online')) blocked.add('Online');
      }
    });
    setBlockedMethods(blocked);
    // Auto-switch payment if current selection is blocked
    if (blocked.has('COD') && paymentMethod === 'COD') setPaymentMethod('UPI');
    if (blocked.has('Online') && paymentMethod !== 'COD') setPaymentMethod('COD');
  }, [cart]);

  if (cart.length === 0) return null;

  // ── Address step validation ──────────────────────────────────────────────
  const handleAddressNext = (e) => {
    e.preventDefault();
    // For guests, validate guest info first
    if (!user) {
      if (!guestInfo.name.trim() || !guestInfo.phone.trim()) {
        return toast.error('Please enter your name and phone number');
      }
    }
    const required = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
    if (required.some(k => !address[k])) {
      return toast.error('Please fill all address fields');
    }
    setStep(1);
  };

  // ── Coupon logic ─────────────────────────────────────────────────────────
  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'HERITAGE10') {
      setDiscount(Math.round(total * 0.1));
      toast.success('Coupon applied! 10% off 🎉');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  // ── Place Order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setPlacing(true);
    const items = cart.map(i => ({
      product:  i._id,
      name:     i.name,
      image:    i.images?.[0],
      price:    i.price,
      quantity: i.quantity,
      size:     i.selectedSize,
      color:    i.selectedColor,
    }));

    const orderPayload = {
      items,
      shippingAddress: address,
      paymentMethod,
      subtotal: cartTotal,
      shippingCharge: shipping,
      discount,
      total: total - discount,
    };

    try {
      let data;
      if (user) {
        // Logged-in order
        const res = await api.post('/orders', orderPayload);
        data = res.data;
      } else {
        // Guest order — send guestInfo along
        const res = await api.post('/orders/guest', { ...orderPayload, guestInfo });
        data = res.data;
      }
      clearCart();
      navigate(`/order-confirm/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const isMethodBlocked = (opt) => {
    return blockedMethods.has(opt.type);
  };

  return (
    <div className="checkout-page">
      <div className="container-sm">
        <h1 className="page-title">Checkout</h1>
        <div className="ornament-divider">⬥ ⬦ ⬥</div>

        {/* Guest banner */}
        {!user && (
          <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <User size={20} color="var(--gold)" />
            <div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Checking out as <strong style={{ color: 'var(--gold)' }}>Guest</strong>
              </p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <Link to="/login" style={{ color: 'var(--gold)' }}>Sign in</Link> to save your order history
              </p>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="checkout-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`checkout-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="step-circle">{i < step ? <Check size={14} /> : i + 1}</div>
              <span className="step-label">{s}</span>
              {i < STEPS.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">

            {/* ── Step 0: Address ── */}
            {step === 0 && (
              <form onSubmit={handleAddressNext} className="checkout-card card">
                <h3 className="checkout-card-title">Delivery Address</h3>

                {/* Guest info fields (only for non-logged-in users) */}
                {!user && (
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 20, border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: 12, fontSize: '0.9rem' }}>
                      👤 Guest Information
                    </p>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Your Name *</label>
                        <input className="form-input" required placeholder="Full name" value={guestInfo.name}
                          onChange={e => setGuestInfo(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mobile Number *</label>
                        <input className="form-input" required placeholder="+91 00000 00000" value={guestInfo.phone}
                          onChange={e => setGuestInfo(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Optional — for order updates)</span></label>
                      <input className="form-input" type="email" placeholder="your@email.com" value={guestInfo.email}
                        onChange={e => setGuestInfo(p => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Recipient Name *</label>
                    <input className="form-input" value={address.name} placeholder="Name on delivery" onChange={e => setAddress(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input className="form-input" value={address.phone} placeholder="+91 00000 00000" onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input className="form-input" value={address.street} placeholder="House no., Building, Street, Area" onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className="form-input" value={address.city} placeholder="City" onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input className="form-input" value={address.state} placeholder="State" onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
                    <input className="form-input" value={address.pincode} placeholder="000000" maxLength={6} onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg">
                  Continue to Payment <ChevronRight size={18} />
                </button>
              </form>
            )}

            {/* ── Step 1: Payment ── */}
            {step === 1 && (
              <div className="checkout-card card">
                <h3 className="checkout-card-title">Payment Method</h3>

                {blockedMethods.size > 0 && (
                  <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.85rem', color: '#ff9999' }}>
                    ⚠️ {blockedMethods.has('COD')
                      ? 'One or more items in your cart require online payment only.'
                      : 'One or more items are available for Cash on Delivery only.'}
                  </div>
                )}

                <div className="payment-options">
                  {PAYMENT_OPTIONS.map(opt => {
                    const blocked = isMethodBlocked(opt);
                    return (
                      <label key={opt.value}
                        className={`payment-option ${paymentMethod === opt.value ? 'active' : ''} ${blocked ? 'disabled' : ''}`}
                        style={{ opacity: blocked ? 0.4 : 1, cursor: blocked ? 'not-allowed' : 'pointer' }}
                      >
                        <input type="radio" name="payment" value={opt.value}
                          checked={paymentMethod === opt.value}
                          disabled={blocked}
                          onChange={() => !blocked && setPaymentMethod(opt.value)}
                          className="sr-only"
                        />
                        <span className="payment-icon">{opt.icon}</span>
                        <div>
                          <p className="payment-label">{opt.label}</p>
                          <p className="payment-desc">{blocked ? '⛔ Not available for your cart items' : opt.desc}</p>
                        </div>
                        <div className="payment-check">{paymentMethod === opt.value && <Check size={14} />}</div>
                      </label>
                    );
                  })}
                </div>

                <div className="coupon-section">
                  <h4>Have a coupon?</h4>
                  <div className="coupon-row">
                    <input className="form-input" placeholder="Enter coupon code (try: HERITAGE10)" value={coupon} onChange={e => setCoupon(e.target.value)} />
                    <button className="btn btn-outline btn-sm" onClick={handleApplyCoupon} type="button">Apply</button>
                  </div>
                  {discount > 0 && <p className="text-gold text-sm">✓ Coupon applied! ₹{discount} off</p>}
                </div>

                <div className="checkout-btn-row">
                  <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Review Order <ChevronRight size={18} /></button>
                </div>
              </div>
            )}

            {/* ── Step 2: Review ── */}
            {step === 2 && (
              <div className="checkout-card card">
                <h3 className="checkout-card-title">Review &amp; Place Order</h3>
                <div className="review-section">
                  {!user && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>Guest: {guestInfo.name} · {guestInfo.phone}</p>}
                  <h4>Delivery to:</h4>
                  <p className="review-text">{address.name} · {address.phone}</p>
                  <p className="review-text">{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                </div>
                <div className="review-section">
                  <h4>Payment: {paymentMethod}</h4>
                </div>
                <div className="review-items">
                  {cart.map((item, i) => (
                    <div key={i} className="review-item-row">
                      <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'} alt={item.name} className="review-item-img" />
                      <div className="review-item-info">
                        <p className="review-item-name">{item.name}</p>
                        <p className="text-muted text-sm">{item.selectedSize && `Size: ${item.selectedSize}`} {item.selectedColor && `· ${item.selectedColor}`} · Qty: {item.quantity}</p>
                      </div>
                      <p className="review-item-price">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="checkout-btn-row">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={placing}>
                    {placing ? 'Placing Order...' : `Place Order · ₹${((total || 0) - (discount || 0)).toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="checkout-summary card">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-ornament">⬥ ⬦ ⬥</div>
            <div className="checkout-items-mini">
              {cart.map((item, i) => (
                <div key={i} className="checkout-mini-item">
                  <span className="mini-item-name">{item.name}</span>
                  <span className="mini-item-price">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="summary-lines" style={{ marginTop: 16 }}>
              <div className="summary-line"><span>Subtotal</span><span>₹{cartTotal?.toLocaleString() || 0}</span></div>
              <div className="summary-line"><span>Shipping</span><span className={shipping === 0 ? 'text-gold' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              {discount > 0 && <div className="summary-line text-gold"><span>Coupon</span><span>-₹{discount}</span></div>}
              <div className="summary-divider" />
              <div className="summary-line total-line"><span>Total</span><span>₹{((total || 0) - (discount || 0)).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
