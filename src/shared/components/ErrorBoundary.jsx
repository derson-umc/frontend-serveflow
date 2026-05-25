import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          background: '#F5F5F5',
        }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#424242' }}>
            Algo deu errado ao carregar esta página.
          </p>
          <p style={{ fontSize: 13, color: '#757575', maxWidth: 360, textAlign: 'center' }}>
            {this.state.error?.message ?? 'Erro inesperado. Tente recarregar.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#2E7D32',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
