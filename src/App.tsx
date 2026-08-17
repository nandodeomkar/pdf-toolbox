import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PrivacyModal } from './components/layout/PrivacyModal';
import { Dashboard } from './components/dashboard/Dashboard';
import { ToolHeader } from './components/layout/ToolHeader';
import { ToolWorkspace } from './components/workspace/ToolWorkspace';
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
            
            {/* Tool Workspace - integrated with Web Worker tracer slice */}
            <ToolWorkspace tool={activeTool} />
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
