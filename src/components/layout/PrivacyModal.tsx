import React from 'react';
import { ShieldCheck, Lock, HardDrive, WifiOff, X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-text)'
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 2 }}>100% Client-Side Privacy</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-text)', fontWeight: 600 }}>
                Zero Cloud Uploads • Zero Data Stored
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p>
            Unlike traditional online PDF converters, <strong>PDF Toolbox</strong> processes all your documents
            directly in your browser's local memory using WebAssembly and Web Workers.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 10,
              margin: '6px 0'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <HardDrive size={20} color="var(--accent-text)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.88rem' }}>
                  Files Stay On Your Machine
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Your documents are read and processed entirely in RAM. Not a single byte is uploaded to any server.
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <WifiOff size={20} color="var(--accent-text)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.88rem' }}>
                  Full Offline Mode
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Disconnect your internet entirely or install as an offline PWA — every single tool continues to function smoothly.
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <Lock size={20} color="var(--accent-text)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.88rem' }}>
                  Safe for Confidential Data
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Ideal for sensitive tax documents, legal contracts, medical reports, and private records.
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-primary" onClick={onClose}>
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
