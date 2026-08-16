import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="footer-status-dot" />
          <span>Local Engine Active • No data sent to any server</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>Free & Open Source</span>
          <span>•</span>
          <span>Runs 100% in your Browser</span>
        </div>
      </div>
    </footer>
  );
};
