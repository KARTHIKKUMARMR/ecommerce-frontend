import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartPage.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const shipping = cartTotal > 999 ? 0 : 99;
  const total = cartTotal + shipping;

  if (cart.length === 0) return (
    <div className="empty-cart">
      <div className="empty-cart-icon">🛒</div>
      <h2>Your cart is empty</h2>
      <p>Add some beautiful traditional items to get started!</p>
      <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart</h1>
        <div className="ornament-divider">⬥ ⬦ ⬥</div>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cart.map((item, idx) => (
              <div key={idx} className="cart-item card">
                <img
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200'}
                  alt={item.name}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <p className="cart-item-category">{item.category}</p>
                  <h3 className="cart-item-name">{item.name}</h3>
                  <div className="cart-item-meta">
                    {item.selectedSize && <span className="cart-meta-chip">Size: {item.selectedSize}</span>}
                    {item.selectedColor && <span className="cart-meta-chip">Color: {item.selectedColor}</span>}
                  </div>
                  <p className="cart-item-price">₹{item.price?.toLocaleString() || 0}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item._id, item.selectedSize, item.selectedColor, item.quantity - 1)}>
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.selectedSize, item.selectedColor, item.quantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="cart-item-total">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                  <button className="cart-remove-btn" onClick={() => removeFromCart(item._id, item.selectedSize, item.selectedColor)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="cart-summary card">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-ornament">⬥ ⬦ ⬥</div>
            <div className="summary-lines">
              <div className="summary-line">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{cartTotal?.toLocaleString() || 0}</span>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-gold' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {shipping === 0 && <p className="free-shipping-note">🎉 You qualify for free shipping!</p>}
              {shipping > 0 && <p className="free-shipping-note">Add ₹{Math.max(0, 999 - cartTotal).toLocaleString()} more for free shipping</p>}
              <div className="summary-divider" />
              <div className="summary-line total-line">
                <span>Total</span>
                <span>₹{total?.toLocaleString() || 0}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 20 }}>
              Proceed to Checkout
            </Link>
            <Link to="/products" className="btn btn-outline btn-full" style={{ marginTop: 10 }}>
              <ShoppingBag size={16} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
