import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="row">
            <div className="col s12">
              <div className="card red lighten-2">
                <div className="card-content white-text">
                  <span className="card-title">Algo salió mal</span>
                  <p>Ha ocurrido un error inesperado. Por favor, intenta recargar la página.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;