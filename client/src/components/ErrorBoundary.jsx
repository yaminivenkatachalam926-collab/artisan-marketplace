import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Crash caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#FAFAF8',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          color: '#1C1917',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '520px',
            background: '#ffffff',
            padding: '3rem 2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
            border: '1px solid #E7E5E4'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏺</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111D4A' }}>
              Kaivinai Marketplace
            </h2>
            <p style={{ color: '#78716C', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              We encountered a minor display hiccup while loading the craft collection.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              style={{
                background: '#C2410C',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem 1.75rem',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Reload Marketplace
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
