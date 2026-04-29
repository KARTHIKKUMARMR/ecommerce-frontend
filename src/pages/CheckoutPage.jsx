import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const STEPS = ['Address', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);

  const shipping = cartTotal > 999 ? 0 : 99;
  const total = cartTotal + shipping;

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  if (!user) return (
    <div className="checkout-login-prompt">
      <h2>Please sign in to checkout</h2>
      <Link to="/login" className="btn btn-primary btn-lg">Sign In</Link>
    </div>
  );

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleAddressNext = (e) => {
    e.preventDefault();
    const required = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
    if (required.some(k => !address[k])) { toast.error('Please fill all address fields'); return; }
    setStep(1);
  };

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'HERITAGE10') {
      setDiscount(Math.round(total * 0.1));
      toast.success('Coupon applied! 10% off 🎉');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    const orderData = {
      items: cart.map(i => ({
        product: i._id,
        name: i.name,
        image: i.images?.[0],
        price: i.price,
        quantity: i.quantity,
        size: i.selectedSize,
        color: i.selectedColor,
      })),
      shippingAddress: address,
      paymentMethod,
      subtotal: cartTotal,
      shippingCharge: shipping,
      discount,
      total: total - discount,
    };

    try {
      const { data } = await api.post('/orders', orderData);
      clearCart();
      navigate(`/order-confirm/${data._id}`);
    } catch (err) {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container-sm">
        <h1 className="page-title">Checkout</h1>
        <div className="ornament-divider">⬥ ⬦ ⬥</div>

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
            {/* Step 0: Address */}
            {step === 0 && (
              <form onSubmit={handleAddressNext} className="checkout-card card">
                <h3 className="checkout-card-title">Delivery Address</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={address.name} onChange={e => setAddress(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input className="form-input" value={address.phone} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} placeholder="+91 00000 00000" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input className="form-input" value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} placeholder="House no., Building, Street, Area" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className="form-input" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} placeholder="City" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input className="form-input" value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} placeholder="State" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
                    <input className="form-input" value={address.pincode} onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))} placeholder="000000" maxLength={6} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg">Continue to Payment <ChevronRight size={18} /></button>
              </form>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="checkout-card card">
                <h3 className="checkout-card-title">Payment Method</h3>
                <div className="payment-options">
                  {[
                    { value: 'COD', label: 'Cash on Delivery', icon: '💰', desc: 'Pay when you receive your order' },
                    { value: 'UPI', label: 'UPI Payment', icon: '📱', desc: 'Pay via Google Pay, PhonePe, etc.' },
                    { value: 'Card', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
                    { value: 'NetBanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks supported' },
                  ].map(opt => (
                    <label key={opt.value} className={`payment-option ${paymentMethod === opt.value ? 'active' : ''}`}>
                      <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="sr-only" />
                      <span className="payment-icon">{opt.icon}</span>
                      <div>
                        <p className="payment-label">{opt.label}</p>
                        <p className="payment-desc">{opt.desc}</p>
                      </div>
                      <div className="payment-check">{paymentMethod === opt.value && <Check size={14} />}</div>
                    </label>
                  ))}
                </div>

                {/* Coupon */}
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

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="checkout-card card">
                <h3 className="checkout-card-title">Review & Place Order</h3>
                <div className="review-section">
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

          {/* Order summary sidebar */}
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
