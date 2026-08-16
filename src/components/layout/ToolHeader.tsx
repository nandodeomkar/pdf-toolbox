import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ToolDefinition } from '../../types';

interface ToolHeaderProps {
  tool: ToolDefinition;
  onBack: () => void;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({ tool, onBack }) => {
  return (
    <div className="workspace-header">
      <div className="workspace-header-left">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onBack}
          aria-label="Back to all tools"
        >
          <ArrowLeft size={16} />
          <span>All Tools</span>
        </button>

        <div className="workspace-title-group">
          <h2>{tool.title}</h2>
          <p>{tool.shortDescription}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="badge badge-emerald">100% Local</span>
        <span className="badge badge-zinc">{tool.category}</span>
      </div>
    </div>
  );
};
