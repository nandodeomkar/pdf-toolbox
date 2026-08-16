import React from 'react';
import {
  Layers,
  Scissors,
  LayoutGrid,
  Minimize2,
  Image,
  FileImage,
  FileText,
  Lock,
  Stamp,
  Hash,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ToolDefinition } from '../../types';

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect: (toolId: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const renderIcon = (iconName: string) => {
    const props = { size: 22 };
    switch (iconName) {
      case 'Layers':
        return <Layers {...props} />;
      case 'Scissors':
        return <Scissors {...props} />;
      case 'LayoutGrid':
        return <LayoutGrid {...props} />;
      case 'Minimize2':
        return <Minimize2 {...props} />;
      case 'Image':
        return <Image {...props} />;
      case 'FileImage':
        return <FileImage {...props} />;
      case 'FileText':
        return <FileText {...props} />;
      case 'Lock':
        return <Lock {...props} />;
      case 'Stamp':
        return <Stamp {...props} />;
      case 'Hash':
        return <Hash {...props} />;
      default:
        return <Layers {...props} />;
    }
  };

  return (
    <div
      className="tool-card"
      onClick={() => onSelect(tool.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(tool.id);
        }
      }}
    >
      <div>
        <div className="tool-card-top">
          <div className="tool-icon-box">{renderIcon(tool.iconName)}</div>
          {tool.isPopular && (
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
              <Sparkles size={10} /> Popular
            </span>
          )}
        </div>

        <h3 className="tool-card-title">{tool.title}</h3>
        <p className="tool-card-desc">{tool.shortDescription}</p>
      </div>

      <div className="tool-card-footer">
        <span className="tool-card-cat">{tool.category}</span>
        <ArrowRight size={16} className="tool-card-arrow" />
      </div>
    </div>
  );
};
