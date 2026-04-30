import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';


export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (id, newStatus, trackingId = '', courierName = '') => {
    try {
      await api.put(`/admin/orders/${id}/status`, { 
        status: newStatus,
        trackingId,
        courierName
      });
      setOrders(orders.map(o => o._id === id ? { 
        ...o, 
        orderStatus: newStatus,
        trackingId,
        courierName
      } : o));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      setOrders(orders.filter(o => o._id !== id));
      toast.success('Order deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete order');
    }
  };

  const filtered = orders.filter(o => 
    o._id.toLowerCase().includes(search.toLowerCase()) || 
    (o.user?.name && o.user.name.toLowerCase().includes(search.toLowerCase())) ||
    (o.guestInfo?.name && o.guestInfo.name.toLowerCase().includes(search.toLowerCase())) ||
    (o.trackingId && o.trackingId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Orders</h1>
        <p className="admin-subtitle">Manage customer orders and update shipping status</p>
      </div>

      <div className="admin-panel card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by Order ID, Customer, or Tracking ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Details</th>
                <th>Tracking Info</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o._id}>
                  <td className="font-medium">#{o._id.slice(-8).toUpperCase()}</td>
                  <td>
                    <div>
                      <p style={{ margin: 0 }}>{o.user?.name || o.guestInfo?.name || 'Guest'}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {o.user?.email || o.guestInfo?.email || 'No email'}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <p style={{ margin: 0 }}>{o.items?.length || 0} items</p>
                      <p style={{ margin: 0, fontWeight: '600', color: 'var(--gold)' }}>₹{o.total?.toLocaleString()}</p>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input 
                        type="text" 
                        placeholder="Tracking ID"
                        className="form-input"
                        defaultValue={o.trackingId || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (o.trackingId || '')) {
                            handleUpdateStatus(o._id, o.orderStatus, e.target.value, o.courierName);
                          }
                        }}
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      />
                      <input 
                        type="text" 
                        placeholder="Courier Name"
                        className="form-input"
                        defaultValue={o.courierName || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (o.courierName || '')) {
                            handleUpdateStatus(o._id, o.orderStatus, o.trackingId, e.target.value);
                          }
                        }}
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      />
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${(o.orderStatus || 'placed').toLowerCase()}`}>
                      {(o.orderStatus || 'placed').charAt(0).toUpperCase() + (o.orderStatus || 'placed').slice(1).replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select 
                      className="form-input" 
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      value={o.orderStatus || 'placed'}
                      onChange={(e) => handleUpdateStatus(o._id, e.target.value, o.trackingId, o.courierName)}
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button 
                      onClick={() => handleDeleteOrder(o._id)} 
                      className="btn-icon text-red" 
                      title="Delete Order"
                      style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
