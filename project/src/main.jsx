import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('NearlyY Runtime Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F5FF] flex items-center justify-center p-6 text-center font-sans">
          <div className="bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full border border-purple-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-black">
              !
            </div>
            <h2 className="text-lg font-black text-slate-900 mb-1">NearlyY Notice</h2>
            <p className="text-xs text-slate-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred while loading.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-[#5128E8] text-white font-bold rounded-xl text-xs hover:bg-[#431fcd] transition shadow-md"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

