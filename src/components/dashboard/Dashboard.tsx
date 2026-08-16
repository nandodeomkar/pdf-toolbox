import React from 'react';
import { ToolDefinition, ToolCategory } from '../../types';
import { CATEGORIES } from '../../config/tools';
import { ToolCard } from './ToolCard';
import { ShieldCheck, FileSearch } from 'lucide-react';

interface DashboardProps {
  tools: ToolDefinition[];
  selectedCategory: ToolCategory;
  onSelectCategory: (cat: ToolCategory) => void;
  searchQuery: string;
  onSelectTool: (toolId: string) => void;
  onOpenPrivacyModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tools,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSelectTool,
  onOpenPrivacyModal
}) => {
  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesQuery =
      tool.title.toLowerCase().includes(query) ||
      tool.shortDescription.toLowerCase().includes(query) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });

  return (
    <div>
      {/* Hero Section */}
      {!searchQuery && (
        <section className="hero-banner">
          <h1 className="hero-title">
            Every PDF Tool You Need.
            <br />
            <span style={{ color: 'var(--accent-text)' }}>100% Local & Private.</span>
          </h1>
          <p className="hero-subtitle">
            Merge, split, compress, organize, and convert your PDFs right in your browser.
            No server uploads, no size paywalls, completely free and open source.
          </p>
        </section>
      )}

      {/* Category Filter Chips */}
      <div className="category-filter-bar" role="tablist">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={selectedCategory === cat.id}
            className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id as ToolCategory)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="tool-grid">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            marginTop: 20
          }}
        >
          <FileSearch size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h3 style={{ marginBottom: 6 }}>No tools found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            We couldn't find any tool matching "{searchQuery}". Try a different keyword or category.
          </p>
        </div>
      )}

      {/* Privacy Banner Highlight */}
      {!searchQuery && (
        <div
          style={{
            marginTop: 48,
            padding: '24px 28px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-text)',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: 2 }}>Why PDF Toolbox is different</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Your confidential documents are never uploaded to any remote server. Everything is processed locally in RAM.
              </p>
            </div>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onOpenPrivacyModal}>
            Learn How It Works
          </button>
        </div>
      )}
    </div>
  );
};
