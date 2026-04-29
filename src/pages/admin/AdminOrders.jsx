import { useState, useEffect } from 'react';
import { Search, Eye, Edit2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Mock data in case DB is offline
const MOCK_ORDERS = [
  { _id: 'ORD-7829', user: { name: 'Priya Sharma' }, createdAt: new Date().toISOString(), total: 4999, status: 'Processing', items: [{ name: 'Royal Banarasi Silk Saree', quantity: 1, price: 4999 }] },
  { _id: 'ORD-7828', user: { name: 'Aisha Khan' }, createdAt: new Date(Date.now() - 86400000).toISOString(), total: 1899, status: 'Shipped', items: [{ name: 'Chanderi Printed Saree', quantity: 1, price: 1899 }] },
  { _id: 'ORD-7827', user: { name: 'Meera Patel' }, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), total: 6499, status: 'Delivered', items: [{ name: 'Kanjivaram Silk Saree', quantity: 1, price: 6499 }] },
  { _id: 'ORD-7826', user: { name: 'Neha Gupta' }, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), total: 1299, status: 'Returned', items: [{ name: 'Anarkali Floral Kurti', quantity: 1, price: 1299 }] },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/orders/${id}`, { status: newStatus });
      setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
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
                    <span className={`status-badge ${(o.status || 'Processing').toLowerCase()}`}>
                      {o.status || 'Processing'}
                    </span>
                  </td>
                  <td>
                    <select 
                      className="form-input" 
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      value={o.status || 'Processing'}
                      onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Returned">Returned</option>
                    </select>
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
