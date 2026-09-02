import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminOverview.css';
import './AdminInventory.css';

export default function AdminManifesto() {
  const { manifesto, updateManifesto, resetManifesto, uploadProductImages } = useApp();
  const [form, setForm] = useState(manifesto || {});
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'preview'
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (manifesto) {
      setForm(manifesto);
    }
  }, [manifesto]);

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const [uploadedUrl] = await uploadProductImages([file]);
      if (uploadedUrl) {
        setForm(prev => ({ ...prev, heroImage: uploadedUrl }));
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePillarChange = (index, field, value) => {
    setForm(prev => {
      const newPillars = [...(prev.pillars || [])];
      newPillars[index] = { ...newPillars[index], [field]: value };
      return { ...prev, pillars: newPillars };
    });
  };

  const handleEasterEggChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      animeEasterEgg: {
        ...(prev.animeEasterEgg || {}),
        [field]: value
      }
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    updateManifesto(form);
    setTimeout(() => setSaving(false), 400);
  };

  return (
    <div className="admin-categories">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Clan of DE Visual Editor</h1>
          <p className="admin-page-subtitle">
            Easily update the founder story, 3 pillars (God, Health, Good Vibes), and anime easter egg without touching code.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={resetManifesto}
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'editor' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('editor')}
        >
          ✏️ Visual Editor
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'preview' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('preview')}
        >
          👁️ Live Preview
        </button>
      </div>

      {activeTab === 'editor' ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Hero & Greeting */}
          <div className="admin-card">
            <h2 className="admin-card__title" style={{ fontSize: '1.05rem', color: 'var(--turquoise)', marginBottom: '16px' }}>
              1. Hero Header & Background Image
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Hero Cover Image (Optional)</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ fontSize: '0.85rem' }}
                    disabled={uploadingImage}
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, minWidth: '240px' }}
                    placeholder="Or paste direct image URL (https://... or /products/...)"
                    value={form.heroImage || ''}
                    onChange={e => handleFieldChange('heroImage', e.target.value)}
                  />
                  {form.heroImage && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ color: '#ef4444', borderColor: '#ef4444' }}
                      onClick={() => handleFieldChange('heroImage', '')}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {form.heroImage && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={form.heroImage} alt="Manifesto Preview" style={{ height: '80px', borderRadius: '6px', objectFit: 'cover' }} />
                  </div>
                )}
                {uploadingImage && <p style={{ fontSize: '0.8rem', color: 'var(--turquoise)', marginTop: '4px' }}>Uploading photo...</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="heroTitle">Page Title</label>
                <input
                  id="heroTitle"
                  type="text"
                  className="form-input"
                  value={form.heroTitle || ''}
                  onChange={e => handleFieldChange('heroTitle', e.target.value)}
                  placeholder="Welcome to the Clan of DE 👋🏾"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="heroTagline">Tagline</label>
                <input
                  id="heroTagline"
                  type="text"
                  className="form-input"
                  value={form.heroTagline || ''}
                  onChange={e => handleFieldChange('heroTagline', e.target.value)}
                  placeholder="God × Health × Good Vibes"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="introGreeting">Greeting Badge</label>
                <input
                  id="introGreeting"
                  type="text"
                  className="form-input"
                  value={form.introGreeting || ''}
                  onChange={e => handleFieldChange('introGreeting', e.target.value)}
                  placeholder="Hi there! 😃"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="slogan">Slogan Pill</label>
                <input
                  id="slogan"
                  type="text"
                  className="form-input"
                  value={form.slogan || ''}
                  onChange={e => handleFieldChange('slogan', e.target.value)}
                  placeholder="God. Health. Good Vibes."
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label" htmlFor="introLead">Introductory Story Paragraph</label>
              <textarea
                id="introLead"
                rows={4}
                className="form-input"
                style={{ resize: 'vertical' }}
                value={form.introLead || ''}
                onChange={e => handleFieldChange('introLead', e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: The Three Pillars */}
          <div className="admin-card">
            <h2 className="admin-card__title" style={{ fontSize: '1.05rem', color: 'var(--turquoise)', marginBottom: '16px' }}>
              2. The Three Core Pillars
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(form.pillars || []).map((pillar, idx) => (
                <div
                  key={pillar.id || idx}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Icon/Emoji</label>
                      <input
                        type="text"
                        className="form-input"
                        value={pillar.icon || ''}
                        onChange={e => handlePillarChange(idx, 'icon', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Pillar Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={pillar.title || ''}
                        onChange={e => handlePillarChange(idx, 'title', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subtitle Hook</label>
                      <input
                        type="text"
                        className="form-input"
                        value={pillar.subtitle || ''}
                        onChange={e => handlePillarChange(idx, 'subtitle', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pillar Description / Story</label>
                    <textarea
                      rows={4}
                      className="form-input"
                      style={{ resize: 'vertical' }}
                      value={pillar.body || ''}
                      onChange={e => handlePillarChange(idx, 'body', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Community Closing */}
          <div className="admin-card">
            <h2 className="admin-card__title" style={{ fontSize: '1.05rem', color: 'var(--turquoise)', marginBottom: '16px' }}>
              3. Community Closing Message
            </h2>
            <div className="form-group">
              <label className="form-label" htmlFor="closingText">Closing Call & Invitation</label>
              <textarea
                id="closingText"
                rows={5}
                className="form-input"
                style={{ resize: 'vertical' }}
                value={form.closingText || ''}
                onChange={e => handleFieldChange('closingText', e.target.value)}
              />
            </div>
          </div>

          {/* Section 4: Anime Reference Easter Egg */}
          <div className="admin-card" style={{ border: '1px dashed var(--turquoise)' }}>
            <h2 className="admin-card__title" style={{ fontSize: '1.05rem', color: 'var(--turquoise)', marginBottom: '16px' }}>
              4. Anime Reference Easter Egg Section 👀
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="easterBadge">Badge Text</label>
                <input
                  id="easterBadge"
                  type="text"
                  className="form-input"
                  value={form.animeEasterEgg?.badge || ''}
                  onChange={e => handleEasterEggChange('badge', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="easterHeading">Heading</label>
                <input
                  id="easterHeading"
                  type="text"
                  className="form-input"
                  value={form.animeEasterEgg?.heading || ''}
                  onChange={e => handleEasterEggChange('heading', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="easterText">Hint / Challenge Text</label>
              <textarea
                id="easterText"
                rows={4}
                className="form-input"
                style={{ resize: 'vertical' }}
                value={form.animeEasterEgg?.text || ''}
                onChange={e => handleEasterEggChange('text', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="easterFooter">Footer Note</label>
              <input
                id="easterFooter"
                type="text"
                className="form-input"
                value={form.animeEasterEgg?.footerNote || ''}
                onChange={e => handleEasterEggChange('footerNote', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={resetManifesto}>
              Reset to Defaults
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Clan of DE Updates'}
            </button>
          </div>
        </form>
      ) : (
        /* Live Preview */
        <div style={{ background: '#0a0a0a', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ color: 'var(--turquoise)', letterSpacing: '0.2em', fontSize: '0.75rem', fontWeight: 700 }}>
              {form.heroBrand || 'Clan of DE'}
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', margin: '8px 0' }}>
              {form.heroTitle || 'Welcome to the Clan of DE 👋🏾'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{form.heroTagline}</p>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '8px', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(0,200,200,0.1)', color: 'var(--turquoise)', padding: '4px 14px', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
              {form.introGreeting}
            </div>
            <p style={{ color: '#fff', whiteSpace: 'pre-line', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 16px auto' }}>
              {form.introLead}
            </p>
            <div style={{ display: 'inline-block', border: '1px solid var(--turquoise)', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, letterSpacing: '0.1em' }}>
              {form.slogan}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {(form.pillars || []).map((p, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{p.icon}</div>
                <h3 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>{p.title}</h3>
                <h4 style={{ color: 'var(--turquoise)', margin: '0 0 8px 0', fontSize: '0.8rem' }}>{p.subtitle}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{p.body}</p>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(0,200,200,0.05)', border: '1px dashed var(--turquoise)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <span style={{ color: 'var(--turquoise)', fontSize: '0.75rem', fontWeight: 700 }}>{form.animeEasterEgg?.badge}</span>
            <h3 style={{ color: '#fff', margin: '6px 0 12px 0' }}>{form.animeEasterEgg?.heading}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'pre-line', maxWidth: '500px', margin: '0 auto 12px auto' }}>
              {form.animeEasterEgg?.text}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{form.animeEasterEgg?.footerNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}
