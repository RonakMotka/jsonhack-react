import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { TabSwitcher } from './TabSwitcher';
import { Toolbar } from './Toolbar';
import { JsonTreeNode } from './JsonTreeNode';
import { KeyValueTable } from './KeyValueTable';
import { SearchBar } from './SearchBar';

const SAMPLE_JSON = [
  {
    "id": "6d0a722b-868f-4f76-83a3-724ffd28a441",
    "text": "What is Method Overloading?",
    "technology": "python",
    "difficulty_level": "medium",
    "time_limit": 120,
    "is_default": false,
    "is_deleted": false,
    "created_at": "2025-12-18T15:47:43.054946+05:30",
    "updated_at": "2025-12-26T10:22:40.873635+05:30"
  },
  {
    "id": "51c447d4-17a0-441b-817c-6aab61cbd8d2",
    "text": "Difference between is & ==",
    "technology": "python",
    "difficulty_level": "medium",
    "time_limit": 120,
    "is_default": false,
    "is_deleted": false,
    "created_at": "2025-12-18T15:47:42.394992+05:30",
    "updated_at": "2025-12-18T15:47:42.395024+05:30"
  },
  {
    "id": "4f480e04-d801-45d3-8cec-ec788cb4708f",
    "text": "What is Python",
    "technology": "python",
    "difficulty_level": "medium",
    "time_limit": 120,
    "is_default": false,
    "is_deleted": false,
    "created_at": "2025-12-18T15:47:42.255660+05:30",
    "updated_at": "2025-12-18T15:47:42.256303+05:30"
  }
];

export const JsonEditor = () => {
  const [activeTab, setActiveTab] = useState<'viewer' | 'text'>('text');
  const [jsonText, setJsonText] = useState('');
  const [parsedJson, setParsedJson] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<unknown>(null);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMatches, setSearchMatches] = useState<string[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const parseJson = useCallback((text: string) => {
    if (!text.trim()) {
      setParsedJson(null);
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      setParsedJson(parsed);
      setError(null);
    } catch (e) {
      setParsedJson(null);
      setError((e as Error).message);
    }
  }, []);

  const handleTextChange = (text: string) => {
    setJsonText(text);
    parseJson(text);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleTextChange(text);
      toast.success('Pasted from clipboard');
    } catch {
      toast.error('Failed to read clipboard');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleFormat = () => {
    if (!jsonText.trim()) return;
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setParsedJson(parsed);
      setError(null);
      toast.success('JSON formatted');
    } catch {
      toast.error('Invalid JSON - cannot format');
    }
  };

  const handleMinify = () => {
    if (!jsonText.trim()) return;
    try {
      const parsed = JSON.parse(jsonText);
      const minified = JSON.stringify(parsed);
      setJsonText(minified);
      setParsedJson(parsed);
      setError(null);
      toast.success('Whitespace removed');
    } catch {
      toast.error('Invalid JSON - cannot minify');
    }
  };

  const handleClear = () => {
    setJsonText('');
    setParsedJson(null);
    setError(null);
    setSelectedData(null);
    setSelectedPath('');
    setSearchMatches([]);
    toast.success('Cleared');
  };

  const handleLoadSample = () => {
    const sampleText = JSON.stringify(SAMPLE_JSON, null, 2);
    setJsonText(sampleText);
    setParsedJson(SAMPLE_JSON);
    setError(null);
    setSelectedData(null);
    setSelectedPath('');
    toast.success('Sample JSON loaded');
  };

  const handleNodeSelect = (value: unknown, path: string) => {
    setSelectedData(value);
    setSelectedPath(path);
  };

  // Search functionality
  const findMatches = useCallback((obj: unknown, query: string, path: string = ''): string[] => {
    if (!query.trim()) return [];
    
    const matches: string[] = [];
    const lowerQuery = query.toLowerCase();

    if (obj === null || obj === undefined) {
      return matches;
    }

    if (typeof obj === 'object') {
      const entries = Object.entries(obj as object);
      for (const [key, value] of entries) {
        const currentPath = path ? `${path}.${key}` : String(key);
        
        // Check if key matches
        if (String(key).toLowerCase().includes(lowerQuery)) {
          matches.push(currentPath);
        }
        
        // Check if value matches (for primitives)
        if (typeof value !== 'object' && value !== null) {
          if (String(value).toLowerCase().includes(lowerQuery)) {
            if (!matches.includes(currentPath)) {
              matches.push(currentPath);
            }
          }
        }
        
        // Recurse for objects
        if (typeof value === 'object' && value !== null) {
          matches.push(...findMatches(value, query, currentPath));
        }
      }
    }

    return matches;
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!parsedJson || !query.trim()) {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    const matches = findMatches(parsedJson, query);
    setSearchMatches(matches);
    setCurrentMatchIndex(0);
    
    if (matches.length > 0) {
      // Navigate to first match
      navigateToPath(matches[0]);
      toast.success(`Found ${matches.length} match${matches.length > 1 ? 'es' : ''}`);
    } else {
      toast.info('No matches found');
    }
  };

  const navigateToPath = (path: string) => {
    // Get value at path
    const parts = path.split('.');
    let current: unknown = parsedJson;
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      }
    }
    
    setSelectedPath(path);
    setSelectedData(current);
  };

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIndex);
    navigateToPath(searchMatches[nextIndex]);
  };

  const handlePreviousMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIndex = currentMatchIndex === 0 ? searchMatches.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    navigateToPath(searchMatches[prevIndex]);
  };

  return (
    <div className="flex flex-col h-full bg-background border border-border overflow-hidden">
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'text' && (
        <Toolbar
          onPaste={handlePaste}
          onCopy={handleCopy}
          onFormat={handleFormat}
          onMinify={handleMinify}
          onClear={handleClear}
          onLoadSample={handleLoadSample}
        />
      )}
      
      <div className="flex-1 relative overflow-hidden border-t border-border">
        {activeTab === 'text' ? (
          <textarea
            value={jsonText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Paste the JSON code here (your code is not saved anywhere)"
            className="w-full h-full p-4 font-mono text-sm bg-background resize-none focus:outline-none editor-scrollbar placeholder:text-muted-foreground/60"
            spellCheck={false}
          />
        ) : (
          <div className="flex h-full">
            {/* Left panel - Tree view */}
            <div className="flex-1 flex flex-col border-r border-border">
              {/* JSON label */}
              {/* <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-muted/30">
                <span className="text-purple-600 font-bold font-mono">[ ]</span>
                <span className="text-sm font-medium">JSON</span>
              </div> */}
              
              {/* Tree content */}
              <div className="flex-1 p-2 overflow-auto editor-scrollbar bg-background">
                {error ? (
                  <div className="text-destructive font-mono text-sm">
                    <p className="font-medium mb-1">Parse Error:</p>
                    <p>{error}</p>
                  </div>
                ) : parsedJson !== null ? (
                  <JsonTreeNode 
                    value={parsedJson} 
                    onSelect={handleNodeSelect}
                    selectedPath={selectedPath}
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Enter JSON in the Text tab to view it here
                  </p>
                )}
              </div>
              
              {/* Search bar at bottom */}
              <SearchBar
                onSearch={handleSearch}
                onNext={handleNextMatch}
                onPrevious={handlePreviousMatch}
                matchCount={searchMatches.length}
                currentMatch={currentMatchIndex}
              />
            </div>
            
            {/* Right panel - Key/Value table */}
            <div className="w-80 overflow-auto editor-scrollbar">
              <KeyValueTable data={selectedData} />
            </div>
          </div>
        )}
        
        {activeTab === 'text' && error && (
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-destructive/10 border-t border-destructive/20">
            <p className="text-destructive text-xs font-mono truncate">
              Error: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
