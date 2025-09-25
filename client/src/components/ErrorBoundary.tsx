import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ React Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '40px 20px',
          maxWidth: '600px',
          margin: '0 auto',
          fontFamily: 'Arial, sans-serif',
          lineHeight: '1.6'
        }}>
          <div style={{
            border: '2px solid #ff6b6b',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#ffe6e6'
          }}>
            <h2 style={{ color: '#d63031', marginTop: 0 }}>Something went wrong</h2>
            <p style={{ color: '#2d3436' }}>
              We're sorry, but there was an error loading this page. This might be a temporary issue.
            </p>
            
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#0984e3',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = '/hwin'}
                style={{
                  backgroundColor: '#00b894',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Go to Home
              </button>
            </div>

            {this.state.error && (
              <details style={{ marginTop: '20px' }}>
                <summary style={{ cursor: 'pointer', color: '#636e72' }}>
                  Technical Details (for developers)
                </summary>
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  overflow: 'auto'
                }}>
                  <strong>Error:</strong> {this.state.error.message}
                  <br /><br />
                  <strong>Stack Trace:</strong>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: '5px 0 0 0' }}>
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <br />
                      <strong>Component Stack:</strong>
                      <pre style={{ whiteSpace: 'pre-wrap', margin: '5px 0 0 0' }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}