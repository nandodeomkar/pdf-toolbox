import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastType } from '../../types';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const renderIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} color="var(--accent-primary)" />;
      case 'error':
        return <AlertCircle size={20} color="var(--danger-primary)" />;
      case 'warning':
        return <AlertTriangle size={20} color="var(--warning-primary)" />;
      case 'info':
      default:
        return <Info size={20} color="var(--info-primary)" />;
    }
  };

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            {renderIcon(toast.type)}
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            {toast.message && <div className="toast-desc">{toast.message}</div>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="btn-icon"
            style={{ padding: 4, margin: '-4px -4px 0 0' }}
            aria-label="Dismiss toast"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
