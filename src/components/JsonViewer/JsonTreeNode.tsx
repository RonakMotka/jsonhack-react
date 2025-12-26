import { useState } from 'react';
import { cn } from '@/lib/utils';

interface JsonTreeNodeProps {
  keyName?: string | number;
  value: unknown;
  depth?: number;
  onSelect?: (value: unknown, path: string) => void;
  path?: string;
  isSelected?: boolean;
  selectedPath?: string;
}

export const JsonTreeNode = ({ 
  keyName, 
  value, 
  depth = 0, 
  onSelect,
  path = '',
  selectedPath = ''
}: JsonTreeNodeProps) => {
  // All nodes collapsed by default
  const [isExpanded, setIsExpanded] = useState(false);

  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const isEmpty = isObject && Object.keys(value as object).length === 0;

  const currentPath = keyName !== undefined ? (path ? `${path}.${keyName}` : String(keyName)) : path;
  const isSelected = currentPath === selectedPath;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(value, currentPath);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEmpty) {
      setIsExpanded(!isExpanded);
    }
  };

  const renderValue = () => {
    if (value === null) {
      return <span className="json-null">null</span>;
    }
    if (typeof value === 'boolean') {
      return <span className="json-boolean">{value.toString()}</span>;
    }
    if (typeof value === 'number') {
      return <span className="json-number">{value}</span>;
    }
    if (typeof value === 'string') {
      return <span className="json-string">"{value}"</span>;
    }
    return null;
  };

  const entries = isObject ? Object.entries(value as object) : [];
  const bracketOpen = isArray ? '[' : '{';
  const bracketClose = isArray ? ']' : '}';

  // Primitive value
  if (!isObject) {
    return (
      <div 
        className={cn(
          "flex items-start font-mono text-sm leading-relaxed cursor-pointer hover:bg-accent/50 py-0.5 px-1 -mx-1 rounded",
          isSelected && "bg-[hsl(200,70%,85%)]"
        )}
        onClick={handleClick}
      >
        <span className="w-4 flex-shrink-0 text-muted-foreground mr-1">■</span>
        {keyName !== undefined && (
          <>
            <span className="json-key">{keyName}</span>
            <span className="text-foreground mx-1">:</span>
          </>
        )}
        {renderValue()}
      </div>
    );
  }

  return (
    <div className="font-mono text-sm leading-relaxed">
      <div 
        className={cn(
          "flex items-start cursor-pointer hover:bg-accent/50 py-0.5 px-1 -mx-1 rounded",
          isSelected && "bg-[hsl(200,70%,85%)]"
        )}
        onClick={handleClick}
      >
        {/* Expand/Collapse button */}
        <button
          onClick={handleToggle}
          className={cn(
            "w-4 h-4 flex items-center justify-center text-xs font-bold text-white rounded-sm mr-1 flex-shrink-0",
            isEmpty ? "bg-transparent" : isExpanded ? "bg-blue-600" : "bg-blue-600"
          )}
          disabled={isEmpty}
        >
          {!isEmpty && (isExpanded ? '−' : '+')}
        </button>
        
        {/* Bracket icon */}
        <span className="text-purple-600 font-bold mr-1">{bracketOpen}{bracketClose}</span>
        
        {keyName !== undefined && (
          <span className="text-foreground">{keyName}</span>
        )}
      </div>
      
      {isExpanded && !isEmpty && (
        <div className="ml-4 border-l border-border/50 pl-2">
          {entries.map(([key, val]) => (
            <JsonTreeNode
              key={key}
              keyName={isArray ? parseInt(key) : key}
              value={val}
              depth={depth + 1}
              onSelect={onSelect}
              path={currentPath}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};
