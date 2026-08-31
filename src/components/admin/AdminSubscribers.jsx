import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AdminSubscribers() {
  const { subscribers, subscribeToClan, deleteSubscriber, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [newEmail, setNewEmail] = useState('');
  const [newType, setNewType] = useState('all');
  const [adding, setAdding] = useState(false);

  const filtered = subscribers.filter(s => {
    const matchSearch = !search || s.email.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || s.type === filterType;
    return matchSearch && matchType;
  });

  const allCount = subscribers.length;
  const promoCount = subscribers.filter(s => s.type === 'all' || s.type === 'promotions').length;
  const newsCount = subscribers.filter(s => s.type === 'newsletter').length;

  const handleCopyEmails = () => {
    if (filtered.length === 0) {
      showToast('No emails to copy.', 'warning');
      return;
    }
    const emailList = filtered.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emailList);
    showToast(`Copied ${filtered.length} email addresses to clipboard!`, 'success');
  };

  const handleExportCsv = () => {
    if (subscribers.length === 0) {
      showToast('No subscribers to export.', 'warning');
      return;
    }
    const headers = 'ID,Email,Preference,Subscribed Date\n';
    const rows = subscribers.map(s => `"${s.id}","${s.email}","${s.type || 'all'}","${s.created_at || new Date().toISOString()}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `de_creatives_subscribers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Subscribers CSV downloaded!', 'success');
  };

  const handleAddManual = async (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      showToast('Please provide a valid email.', 'warning');
      return;
    }
    setAdding(true);
    const ok = await subscribeToClan(newEmail, newType);
    setAdding(false);
    if (ok) {
      setNewEmail('');
      showToast(`Subscriber ${newEmail} added!`, 'success');
    }
  };

  return (
    <div className="admin-subscribers">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Clan Subscribers & Marketing</h1>
          <p className="admin-page-subtitle">Manage newsletter members, promotional audience, and email lists.</p>
        </div>
        <div className="admin-page-header__actions" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={handleCopyEmails}>
            📋 Copy Filtered Emails
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportCsv}>
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-overview__stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 'var(--space-6)' }}>
        <div className="admin-stat-card admin-stat-card--turquoise">
          <div className="admin-stat-card__icon">👥</div>
          <div className="admin-stat-card__info">
            <p className="admin-stat-card__label">Total Clan Members</p>
            <p className="admin-stat-card__value">{allCount}</p>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-card--success">
          <div className="admin-stat-card__icon">🎁</div>
          <div className="admin-stat-card__info">
            <p className="admin-stat-card__label">Promotions & Drops</p>
            <p className="admin-stat-card__value">{promoCount}</p>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-card--info">
          <div className="admin-stat-card__icon">📰</div>
          <div className="admin-stat-card__info">
            <p className="admin-stat-card__label">Newsletter Only</p>
            <p className="admin-stat-card__value">{newsCount}</p>
          </div>
        </div>
      </div>

      {/* Add Subscriber Bar */}
      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '0.9rem', margin: '0 0 10px 0', fontFamily: 'var(--font-accent)', color: 'var(--white)' }}>
          + Add Subscriber Manually
        </h3>
        <form onSubmit={handleAddManual} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="email"
            placeholder="customer@email.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            className="form-input"
            style={{ flex: 1, minWidth: '240px' }}
            required
          />
          <select
            value={newType}
            onChange={e => setNewType(e.target.value)}
            className="form-input"
            style={{ width: 'auto' }}
          >
            <option value="all">All Drops & Promos</option>
            <option value="newsletter">Newsletter Only</option>
            <option value="promotions">Promotions Only</option>
          </select>
          <button type="submit" className="btn btn-primary" disabled={adding}>
            {adding ? 'Adding...' : 'Add to Clan'}
          </button>
        </form>
      </div>

      {/* Filter and Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'promotions', 'newsletter'].map(type => (
              <button
                key={type}
                type="button"
                className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterType(type)}
                style={{ textTransform: 'capitalize' }}
              >
                {type === 'all' ? 'All Subscribers' : type}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '220px', padding: '6px 12px' }}
          />
        </div>

        <table className="data-table" aria-label="Subscribers list">
          <thead>
            <tr>
              <th scope="col">Email Address</th>
              <th scope="col">Audience Type</th>
              <th scope="col">Joined Date</th>
              <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((sub) => (
                <tr key={sub.id || sub.email}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--white)', fontFamily: 'var(--font-accent)' }}>
                      {sub.email}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${sub.type === 'newsletter' ? 'badge-neutral' : 'badge-turquoise'}`}>
                      {sub.type === 'newsletter' ? 'Newsletter' : 'All Drops & Promos'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                      onClick={() => deleteSubscriber(sub.id, sub.email)}
                      aria-label={`Remove subscriber ${sub.email}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                  No subscribers match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
