import { useApp } from '../../context/AppContext';
import { inventoryStats } from '../../data/mockData';
import './AdminOverview.css';

const statCards = [
  { label: 'Total Products', key: 'totalProducts', icon: '📦', color: 'turquoise', suffix: '' },
  { label: 'Total Revenue', key: 'totalRevenue', icon: '💰', color: 'success', suffix: '$', prefix: true },
  { label: 'Total Orders', key: 'totalOrders', icon: '🛒', color: 'info', suffix: '' },
  { label: 'Low Stock Items', key: 'lowStock', icon: '⚠️', color: 'warning', suffix: '' },
];

const recentActivity = [
  { id: 1, type: 'sale', text: 'New order #DC-8821 — Phantom Oversized Tee', time: '2 min ago', color: 'success' },
  { id: 2, type: 'stock', text: 'Low stock alert: ARCHIVAL Drop Hoodie (12 left)', time: '18 min ago', color: 'warning' },
  { id: 3, type: 'product', text: 'New product added: Cargo Utility Pants', time: '1 hr ago', color: 'turquoise' },
  { id: 4, type: 'sale', text: 'New order #DC-8820 — DC Signature Cap x3', time: '2 hr ago', color: 'success' },
  { id: 5, type: 'review', text: '5★ review received on Minimal Waffle Knit', time: '3 hr ago', color: 'info' },
];

export default function AdminOverview() {
  const { products, categories } = useApp();

  const topProducts = [...products]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 5);

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
          <div key={card.key} className={`admin-stat-card admin-stat-card--${card.color}`}>
            <div className="admin-stat-card__icon">{card.icon}</div>
            <div className="admin-stat-card__info">
              <p className="admin-stat-card__label">{card.label}</p>
              <p className="admin-stat-card__value">
                {card.prefix && '$'}
                {card.key === 'totalRevenue'
                  ? inventoryStats[card.key].toLocaleString()
                  : inventoryStats[card.key]}
              </p>
            </div>
            <div className="admin-stat-card__trend">
              <span className={`badge badge-${card.color === 'warning' ? 'warning' : 'success'}`}>
                {card.key === 'lowStock' ? '↓ -1' : '↑ +12%'}
              </span>
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
                    ${p.price.toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${p.stock <= 15 ? 'badge-warning' : p.stock <= 5 ? 'badge-danger' : 'badge-success'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td style={{ color: 'var(--turquoise)', fontFamily: 'var(--font-accent)', fontWeight: 700 }}>
                    ★ {p.rating} ({p.reviewCount})
                  </td>
                </tr>
              ))}
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
            {recentActivity.map(item => (
              <div key={item.id} className="admin-overview__activity-item">
                <div className={`admin-overview__activity-dot admin-overview__activity-dot--${item.color}`} />
                <div className="admin-overview__activity-info">
                  <p className="admin-overview__activity-text">{item.text}</p>
                  <p className="admin-overview__activity-time">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
