import { useState, useEffect } from 'react';
import { TrendingUp, Package, ShoppingBag, Users, IndianRupee, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import './Admin.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (selectedFilter) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/stats?filter=${selectedFilter}`);
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(filter);
  }, [filter]);

  if (loading && !data) {
    return (
      <div className="admin-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>
        <button onClick={() => fetchDashboardData(filter)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const stats = [
    { title: 'Total Revenue', value: `₹${data?.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, trend: 'Updated', trendUp: true },
    { title: 'Total Orders', value: data?.totalOrders || 0, icon: ShoppingBag, trend: 'Updated', trendUp: true },
    { title: 'Products', value: data?.totalProducts || 0, icon: Package, trend: 'Live', trendUp: true },
    { title: 'Active Users', value: data?.totalUsers || 0, icon: Users, trend: 'Live', trendUp: true },
  ];

  const recentOrders = data?.recentOrders || [];

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="admin-title">Dashboard Overview</h1>
          <p className="admin-subtitle">Welcome back, Admin</p>
        </div>
        <div>
          <select 
            className="form-input" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ minWidth: '150px', cursor: 'pointer' }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      <div className="admin-stats-grid" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="admin-stat-card card">
              <div className="stat-header">
                <span className="stat-title">{stat.title}</span>
                <div className="stat-icon-wrap"><Icon size={18} /></div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-trend ${stat.trendUp ? 'text-success' : 'text-danger'}`}>
                <TrendingUp size={14} /> {stat.trend}
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-dashboard-layout" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
        <div className="admin-panel card">
          <h3 className="panel-title">Recent Orders</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="font-medium">{order._id.slice(-8).toUpperCase()}</td>
                    <td>{order.user?.name || order.guestInfo?.name || 'Guest'}</td>
                    <td className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="font-medium text-gold">₹{order.total?.toLocaleString() || 0}</td>
                    <td>
                      <span className={`status-badge ${(order.orderStatus || 'placed').toLowerCase()}`}>
                        {(order.orderStatus || 'placed').charAt(0).toUpperCase() + (order.orderStatus || 'placed').slice(1)}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No orders found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
