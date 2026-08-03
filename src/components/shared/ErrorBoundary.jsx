import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in app tree:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '2rem',
        textAlign: 'center',
        background: '#0A0A0A',
        color: '#FAFAFA',
        fontFamily: 'sans-serif',
      }}>
        <img src="/logo.png" alt="DE Creatives" style={{ height: '40px', opacity: 0.8 }} />
        <div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Something went wrong.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Please reload the page and try again.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 2rem',
            background: '#14B8A6',
            color: '#0A0A0A',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }
}
