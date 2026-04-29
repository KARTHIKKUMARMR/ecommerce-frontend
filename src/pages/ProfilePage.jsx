import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, User, LogOut, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: ''
  });

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    // Fetch mock orders for this user
    if (user) {
      const allOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
      const userOrders = allOrders.filter(o => o.userId === user._id || o.shippingAddress?.name === user.name);
      setOrders(userOrders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  }, [user]);

  if (!user) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToUpdate = { name: formData.name, phone: formData.phone };
      if (formData.password) dataToUpdate.password = formData.password;
      
      await updateProfile(dataToUpdate);
      toast.success('Profile updated successfully');
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="container" style={{ padding: '60px 24px', minHeight: '70vh' }}>
      <h1 className="page-title text-center">My Account</h1>
      <div className="ornament-divider" style={{ marginBottom: '40px' }}>⬥ ⬦ ⬥</div>

      <div style={{ display: 'flex', gap: '40px', maxWidth: '1000px', margin: '0 auto', flexWrap: 'wrap' }}>
        
        {/* Sidebar */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{user.name}</h3>
                <p className="text-muted text-sm">{user.email}</p>
                {user.role === 'admin' && <span className="badge badge-gold" style={{ marginTop: 4, display: 'inline-block' }}>Admin</span>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`} 
                style={{ justifyContent: 'flex-start' }}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} /> Account Details
              </button>
              <button 
                className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`} 
                style={{ justifyContent: 'flex-start' }}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={18} /> My Orders
              </button>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                  <ChevronRight size={18} /> Go to Admin Panel
                </Link>
              )}
              <button 
                className="btn btn-outline" 
                style={{ justifyContent: 'flex-start', color: '#ff6b6b', borderColor: '#ffcece' }}
                onClick={handleLogout}
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: '2', minWidth: '300px' }}>
          {activeTab === 'profile' && (
            <div className="card" style={{ padding: '32px' }}>
              <h2>Account Details</h2>
              <p className="text-muted" style={{ marginBottom: '24px' }}>Update your personal information and password here.</p>
              
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address (Cannot be changed)</label>
                  <input type="email" className="form-input" value={formData.email} disabled style={{ backgroundColor: '#f5f5f5', color: '#888' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password (leave blank to keep current)</label>
                  <input type="password" className="form-input" placeholder="Enter new password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="card" style={{ padding: '32px' }}>
              <h2>My Orders</h2>
              <p className="text-muted" style={{ marginBottom: '24px' }}>View and track your recent orders.</p>
              
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Package size={48} style={{ color: 'var(--border)', margin: '0 auto 16px' }} />
                  <h3>No orders yet</h3>
                  <p className="text-muted" style={{ marginBottom: '24px' }}>Looks like you haven't made your first purchase yet.</p>
                  <Link to="/products" className="btn btn-primary">Start Shopping</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orders.map(order => (
                    <div key={order._id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 'bold' }}>Order #{order._id.slice(-6).toUpperCase()}</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`status-badge ${order.status?.toLowerCase() === 'delivered' ? 'delivered' : order.status?.toLowerCase() === 'processing' ? 'processing' : 'shipped'}`}>
                            {order.status || 'Processing'}
                          </span>
                          <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: 'var(--gold)' }}>
                            ₹{order.total?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {order.items?.map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <img src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '4px' }} />
                            <div>
                              <p style={{ margin: 0, fontWeight: '500' }}>{item.name}</p>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
