import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './TrackOrder.css';

export default function TrackOrder() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setOrder(null);
    try {
      const { data } = await api.get(`/orders/track/${query}`);
      setOrder(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'placed', label: 'Order Placed', icon: <Clock size={20} /> },
    { key: 'confirmed', label: 'Confirmed', icon: <Package size={20} /> },
    { key: 'shipped', label: 'Shipped', icon: <Truck size={20} /> },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck size={20} /> },
    { key: 'delivered', label: 'Delivered', icon: <CheckCircle size={20} /> },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order?.orderStatus);

  return (
    <div className="track-order-page">
      <div className="container">
        <div className="track-header">
          <h1 className="track-title font-cinzel">Track Your Treasures</h1>
          <p className="track-subtitle">Enter your Order ID or Tracking ID to see live updates</p>
          
          <form onSubmit={handleTrack} className="track-search-form">
            <div className="track-input-wrap">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="e.g. 65f2a... or ABC123456"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="track-input"
              />
            </div>
            <button type="submit" className="btn btn-primary track-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Track Now'}
            </button>
          </form>
        </div>

        {order && (
          <div className="track-result fade-in">
            {/* Status Stepper */}
            <div className="track-card card">
              <div className="status-stepper">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={step.key} className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="step-icon-wrap">
                        {step.icon}
                        {isCompleted && <div className="step-check"><CheckCircle size={12} fill="white" /></div>}
                      </div>
                      <span className="step-label">{step.label}</span>
                      {index < statusSteps.length - 1 && <div className="step-line" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="track-grid">
              {/* Order Info */}
              <div className="track-card card info-card">
                <h3 className="card-title">Order Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <p className="info-label">Order ID</p>
                    <p className="info-value">#{order._id.toString().toUpperCase()}</p>
                  </div>
                  <div className="info-item">
                    <p className="info-label">Placed On</p>
                    <p className="info-value">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  {order.trackingId && (
                    <>
                      <div className="info-item">
                        <p className="info-label">Tracking ID</p>
                        <p className="info-value text-gold">{order.trackingId}</p>
                      </div>
                      <div className="info-item">
                        <p className="info-label">Courier</p>
                        <p className="info-value">{order.courierName || 'Standard Shipping'}</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="track-items">
                  <h4 className="items-title">Items</h4>
                  {order.items.map((item, i) => (
                    <div key={i} className="track-item-row">
                      <img src={item.product?.images?.[0] || item.image} alt={item.name} className="item-thumb" />
                      <div className="item-info">
                        <p className="item-name">{item.name}</p>
                        <p className="item-meta">Qty: {item.quantity} | Size: {item.size || 'Free'}</p>
                      </div>
                      <p className="item-price">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                  <div className="track-total">
                    <span>Total Amount</span>
                    <span className="total-val">₹{order.total}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="track-card card ship-card">
                <h3 className="card-title"><MapPin size={18} style={{ marginRight: 8 }} /> Shipping Address</h3>
                <div className="address-box">
                  <p className="ship-name">{order.shippingAddress.name}</p>
                  <p className="ship-addr">{order.shippingAddress.street}</p>
                  <p className="ship-addr">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <p className="ship-phone">📞 {order.shippingAddress.phone}</p>
                </div>
                
                <div className="help-box">
                  <p className="help-title">Need Help?</p>
                  <p className="help-desc">If you have any questions about your delivery, please contact our artisan support.</p>
                  <a href="mailto:srihasthikala@gmail.com" className="help-link">Contact Support <ChevronRight size={14} /></a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
