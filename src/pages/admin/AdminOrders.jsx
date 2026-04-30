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

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === id ? { ...o, orderStatus: newStatus } : o));
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
    (o.user?.name && o.user.name.toLowerCase().includes(search.toLowerCase()))
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
              placeholder="Search by Order ID or Customer..." 
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
                <th>Date</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o._id}>
                  <td className="font-medium">{o._id.slice(-8).toUpperCase()}</td>
                  <td>{o.user?.name || 'Guest'}</td>
                  <td className="text-muted">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>{o.items?.length || 0} items</td>
                  <td className="font-medium text-gold">₹{o.total?.toLocaleString() || 0}</td>
                  <td>
                    <span className={`status-badge ${(o.orderStatus || 'placed').toLowerCase()}`}>
                      {(o.orderStatus || 'placed').charAt(0).toUpperCase() + (o.orderStatus || 'placed').slice(1)}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select 
                      className="form-input" 
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      value={o.orderStatus || 'placed'}
                      onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
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
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
