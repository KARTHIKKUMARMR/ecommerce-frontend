import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Tag, Truck, Megaphone, Trash2, Plus, Calendar } from 'lucide-react';

export default function AdminMarketing() {
  const [activeTab, setActiveTab] = useState('banner');
  const [loading, setLoading] = useState(false);
  
  // Banner state
  const [banner, setBanner] = useState({ text: '', enabled: false });
  // Shipping state
  const [shipping, setShipping] = useState({ minOrder: 999, fee: 99, enabled: true });
  // Coupons state
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: '', type: 'percentage', value: '', minCartValue: 0, endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, couponRes] = await Promise.all([
        api.get('/marketing/settings'),
        api.get('/marketing/coupons')
      ]);
      if (settingsRes.data.banner) setBanner(settingsRes.data.banner);
      if (settingsRes.data.shipping) setShipping(settingsRes.data.shipping);
      setCoupons(couponRes.data);
    } catch (err) {
      toast.error('Failed to load marketing data');
    }
  };

  const updateBanner = async () => {
    setLoading(true);
    try {
      await api.put('/marketing/settings/top_banner', { value: banner });
      toast.success('Banner updated successfully');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const updateShipping = async () => {
    setLoading(true);
    try {
      await api.put('/marketing/settings/shipping_config', { value: shipping });
      toast.success('Shipping config updated');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/marketing/coupons', newCoupon);
      toast.success('Coupon created');
      setNewCoupon({ code: '', type: 'percentage', value: '', minCartValue: 0, endDate: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/marketing/coupons/${id}`);
      toast.success('Coupon removed');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="admin-marketing">
      <h2 className="admin-page-title">Marketing & Offers</h2>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'banner' ? 'active' : ''}`} onClick={() => setActiveTab('banner')}>
          <Megaphone size={18} /> Top Banner
        </button>
        <button className={`admin-tab ${activeTab === 'shipping' ? 'active' : ''}`} onClick={() => setActiveTab('shipping')}>
          <Truck size={18} /> Free Shipping
        </button>
        <button className={`admin-tab ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>
          <Tag size={18} /> Coupons
        </button>
      </div>

      <div className="admin-card card" style={{ padding: '30px' }}>
        {/* Banner Tab */}
        {activeTab === 'banner' && (
          <div className="admin-form">
            <h3>Top Announcement Banner</h3>
            <p className="text-muted text-sm">This message appears at the very top of all pages.</p>
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">Banner Text</label>
              <textarea 
                className="form-input" 
                rows="2" 
                value={banner.text} 
                onChange={e => setBanner({...banner, text: e.target.value})}
                placeholder="e.g., Free shipping on orders above ₹999 | Use code HANDKALA for 10% off"
              />
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input 
                type="checkbox" 
                id="banner-enabled"
                checked={banner.enabled} 
                onChange={e => setBanner({...banner, enabled: e.target.checked})} 
              />
              <label htmlFor="banner-enabled" className="form-label" style={{ margin: 0 }}>Enable Banner Visibility</label>
            </div>
            <button className="btn btn-primary mt-24" onClick={updateBanner} disabled={loading}>
              {loading ? 'Saving...' : 'Save Banner Settings'}
            </button>
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && (
          <div className="admin-form">
            <h3>Free Shipping Configuration</h3>
            <div className="form-row" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Minimum Order Value (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={shipping.minOrder} 
                  onChange={e => setShipping({...shipping, minOrder: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Shipping Fee (if below min) (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={shipping.fee} 
                  onChange={e => setShipping({...shipping, fee: e.target.value})} 
                />
              </div>
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input 
                type="checkbox" 
                id="shipping-enabled"
                checked={shipping.enabled} 
                onChange={e => setShipping({...shipping, enabled: e.target.checked})} 
              />
              <label htmlFor="shipping-enabled" className="form-label" style={{ margin: 0 }}>Enable Shipping Rules</label>
            </div>
            <button className="btn btn-primary mt-24" onClick={updateShipping} disabled={loading}>
              {loading ? 'Saving...' : 'Save Shipping Rules'}
            </button>
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div>
            <form onSubmit={createCoupon} className="admin-form" style={{ background: '#fcfcfc', padding: '20px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '30px' }}>
              <h4>Create New Coupon</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Coupon Code</label>
                  <input type="text" className="form-input" required placeholder="e.g. FESTIVE20" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input" value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input type="number" className="form-input" required value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Cart Value (₹)</label>
                  <input type="number" className="form-input" value={newCoupon.minCartValue} onChange={e => setNewCoupon({...newCoupon, minCartValue: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input type="date" className="form-input" required value={newCoupon.endDate} onChange={e => setNewCoupon({...newCoupon, endDate: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary mt-16"><Plus size={18} /> Create Coupon</button>
            </form>

            <h4>Active Coupons</h4>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Min Order</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c._id}>
                      <td><strong style={{ color: 'var(--gold)' }}>{c.code}</strong></td>
                      <td>{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                      <td>₹{c.minCartValue}</td>
                      <td>{new Date(c.endDate).toLocaleDateString()}</td>
                      <td>
                        <button className="icon-btn danger" onClick={() => deleteCoupon(c._id)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && <tr><td colSpan="5" className="text-center">No coupons found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
