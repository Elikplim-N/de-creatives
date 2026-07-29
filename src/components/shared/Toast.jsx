import { useApp } from '../../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  const icons = { success: '✓', danger: '✕', default: 'ℹ' };
  return (
    <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
      <span className="toast-icon" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
        {icons[toast.type] || icons.default}
      </span>
      <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-accent)' }}>{toast.message}</span>
    </div>
  );
}
