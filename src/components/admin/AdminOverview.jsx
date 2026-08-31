import { useApp } from '../../context/AppContext';
import './AdminOverview.css';

const LOW_STOCK_THRESHOLD = 15;

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminOverview() {
  const { products, orders, formatPrice } = useApp();

  const topProducts = [...products]
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 5);

  const lowStockCount = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD).length;
  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const statCards = [
    { label: 'Total Products', icon: '📦', color: 'turquoise', value: products.length },
    { label: 'Total Revenue', icon: '💰', color: 'success', value: formatPrice(totalRevenue) },
    { label: 'Total Orders', icon: '🛒', color: 'info', value: orders.length },
    { label: 'Low Stock Items', icon: '⚠️', color: 'warning', value: lowStockCount },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  return (
    <div className="admin-overview">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard Overview</h1>
          <p className="admin-page-subtitle">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="admin-page-header__actions">
          <span className="admin-overview__date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-overview__stats">
        {statCards.map(card => (
          <div key={card.label} className={`admin-stat-card admin-stat-card--${card.color}`}>
            <div className="admin-stat-card__icon">{card.icon}</div>
            <div className="admin-stat-card__info">
              <p className="admin-stat-card__label">{card.label}</p>
              <p className="admin-stat-card__value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-overview__body">
        {/* Top Products */}
        <div className="card admin-overview__top-products">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Top Products</h2>
            <span className="badge badge-neutral">By Reviews</span>
          </div>
          <table className="data-table" aria-label="Top products by reviews">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                <th scope="col">Rating</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-overview__product-cell">
                      <img src={(p.images && p.images[0]) || '/logo.png'} alt={p.name} className="admin-overview__product-thumb" loading="lazy" />
                      <div>
                        <p className="admin-overview__product-name">{p.name}</p>
                        <p className="admin-overview__product-sku">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-neutral">{p.categoryName}</span></td>
                  <td style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-accent)', fontWeight: 600 }}>
                    {formatPrice(p.price)}
                  </td>
                  <td>
                    <span className={`badge ${p.stock <= 15 ? 'badge-warning' : p.stock <= 5 ? 'badge-danger' : 'badge-success'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td style={{ color: 'var(--turquoise)', fontFamily: 'var(--font-accent)', fontWeight: 700 }}>
                    ★ {p.rating} ({p.reviewCount || 0})
                  </td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontFamily: 'var(--font-accent)' }}>
                    No products yet — add your first one from the Products tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Activity Feed */}
        <div className="card admin-overview__activity">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Recent Activity</h2>
            <span className="badge badge-turquoise">Live</span>
          </div>
          <div className="admin-overview__activity-feed">
            {recentOrders.map(order => (
              <div key={order.id} className="admin-overview__activity-item">
                <div className="admin-overview__activity-dot admin-overview__activity-dot--success" />
                <div className="admin-overview__activity-info">
                  <p className="admin-overview__activity-text">
                    New order #{order.order_number} — {order.items?.[0]?.name}
                    {order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''}
                  </p>
                  <p className="admin-overview__activity-time">{timeAgo(order.created_at)}</p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-accent)', padding: '24px 0', textAlign: 'center' }}>
                No recent activity yet — orders will appear here as customers check out.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
