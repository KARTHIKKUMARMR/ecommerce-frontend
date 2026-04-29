import { TrendingUp, Package, ShoppingBag, Users, IndianRupee } from 'lucide-react';
import './Admin.css';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Revenue', value: '₹1,24,500', icon: IndianRupee, trend: '+12.5%', trendUp: true },
    { title: 'Total Orders', value: '156', icon: ShoppingBag, trend: '+8.2%', trendUp: true },
    { title: 'Products', value: '42', icon: Package, trend: 'Stable', trendUp: true },
    { title: 'Active Users', value: '89', icon: Users, trend: '+2.4%', trendUp: true },
  ];

  const recentOrders = [
    { id: 'ORD-7829', customer: 'Priya Sharma', date: 'Today', amount: '₹4,999', status: 'Processing' },
    { id: 'ORD-7828', customer: 'Aisha Khan', date: 'Yesterday', amount: '₹1,899', status: 'Shipped' },
    { id: 'ORD-7827', customer: 'Meera Patel', date: 'Yesterday', amount: '₹6,499', status: 'Delivered' },
    { id: 'ORD-7826', customer: 'Neha Gupta', date: 'Oct 12', amount: '₹1,299', status: 'Delivered' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Dashboard Overview</h1>
        <p className="admin-subtitle">Welcome back, Admin</p>
      </div>

      <div className="admin-stats-grid">
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
                <TrendingUp size={14} /> {stat.trend} from last month
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-dashboard-layout">
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
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="font-medium">{order.id}</td>
                    <td>{order.customer}</td>
                    <td className="text-muted">{order.date}</td>
                    <td className="font-medium text-gold">{order.amount}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
