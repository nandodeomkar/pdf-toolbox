import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PrivacyModal } from './components/layout/PrivacyModal';
import { Dashboard } from './components/dashboard/Dashboard';
import { ToolHeader } from './components/layout/ToolHeader';
import { TOOLS } from './config/tools';
import { ToolCategory, ThemeMode } from './types';

const MainApp: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('pdf_toolbox_theme') as ThemeMode;
    return saved || 'dark';
  });

  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pdf_toolbox_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const activeTool = activeToolId ? TOOLS.find((t) => t.id === activeToolId) : null;

  const handleSelectTool = (id: string) => {
    setActiveToolId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setActiveToolId(null);
  };

  return (
    <div className="app-container">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onGoHome={handleBackToDashboard}
        isInsideTool={!!activeToolId}
      />

      <main className="main-content">
        {!activeTool ? (
          <Dashboard
            tools={TOOLS}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSelectTool={handleSelectTool}
            onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
          />
        ) : (
          <div className="tool-workspace">
            <ToolHeader tool={activeTool} onBack={handleBackToDashboard} />
            
            {/* Tool placeholder for Phase 1 verification */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: '40px 24px',
                textAlign: 'center'
              }}
            >
              <h3 style={{ marginBottom: 8 }}>{activeTool.title} Workspace</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 20px' }}>
                {activeTool.fullDescription}
              </p>
              <div style={{ display: 'inline-flex', gap: 12 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => addToast('info', 'Phase 1 Shell Active', `Testing notifications for ${activeTool.title}`)}
                >
                  Test Notification
                </button>
                <button className="btn btn-primary" onClick={handleBackToDashboard}>
                  Back to Tools
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

export default App;
