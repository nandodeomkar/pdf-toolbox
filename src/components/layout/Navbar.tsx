import React from 'react';
import { ShieldCheck, Sun, Moon, Search, Layers, X } from 'lucide-react';
import { ThemeMode } from '../../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenPrivacyModal: () => void;
  onGoHome: () => void;
  isInsideTool: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
  onOpenPrivacyModal,
  onGoHome,
  isInsideTool
}) => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-logo" onClick={onGoHome} role="button" tabIndex={0}>
          <div className="brand-icon">
            <Layers size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="brand-name">PDF Toolbox</span>
              <span className="brand-badge">Local</span>
            </div>
          </div>
        </div>

        {/* Search */}
        {!isInsideTool && (
          <div className="navbar-center">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search tools (merge, compress, split...)"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search tools"
              />
              {searchQuery && (
                <button
                  className="btn-icon"
                  style={{ position: 'absolute', right: 8, padding: 4 }}
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="navbar-actions">
          <button
            className="privacy-pill"
            onClick={onOpenPrivacyModal}
            title="View 100% Client-Side Privacy Guarantee"
          >
            <ShieldCheck size={16} />
            <span>100% Offline</span>
          </button>

          <button
            className="btn-icon"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
