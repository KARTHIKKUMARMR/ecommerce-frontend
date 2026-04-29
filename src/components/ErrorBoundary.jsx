import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', backgroundColor: '#fff', color: '#d9534f', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1>React Crashed!</h1>
          <p>Please copy the error below and send it to the developer:</p>
          <div style={{ backgroundColor: '#f8d7da', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
            <strong>{this.state.error && this.state.error.toString()}</strong>
            <br /><br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
