import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  matchCount?: number;
  currentMatch?: number;
}

export const SearchBar = ({ 
  onSearch, 
  onNext, 
  onPrevious,
  matchCount = 0,
  currentMatch = 0
}: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(query);
    }
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-muted border-t border-border">
      <span className="text-sm text-foreground">Search:</span>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-6 w-40 text-sm px-2 py-0 bg-background border-border"
        placeholder=""
      />
      <button
        onClick={() => onSearch(query)}
        className="px-2 py-0.5 text-sm bg-muted border border-border rounded hover:bg-accent transition-colors"
      >
        GO!
      </button>
      <button
        onClick={onNext}
        disabled={matchCount === 0}
        className="flex items-center gap-1 px-2 py-0.5 text-sm text-foreground hover:text-primary transition-colors disabled:opacity-50"
      >
        <span className="text-orange-500">↓</span> Next
      </button>
      <button
        onClick={onPrevious}
        disabled={matchCount === 0}
        className="flex items-center gap-1 px-2 py-0.5 text-sm text-foreground hover:text-primary transition-colors disabled:opacity-50"
      >
        <span className="text-green-500">↑</span> Previous
      </button>
      {matchCount > 0 && (
        <span className="text-xs text-muted-foreground">
          {currentMatch + 1} of {matchCount}
        </span>
      )}
    </div>
  );
};
