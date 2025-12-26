import { cn } from '@/lib/utils';

interface TabSwitcherProps {
  activeTab: 'viewer' | 'text';
  onTabChange: (tab: 'viewer' | 'text') => void;
}

export const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
  return (
    <div className="flex">
      <button
        onClick={() => onTabChange('viewer')}
        className={cn(
          "px-4 py-1.5 text-sm font-medium border border-border transition-colors",
          activeTab === 'viewer'
            ? "bg-background text-foreground border-b-background"
            : "bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        Viewer
      </button>
      <button
        onClick={() => onTabChange('text')}
        className={cn(
          "px-4 py-1.5 text-sm font-medium border border-border border-l-0 transition-colors",
          activeTab === 'text'
            ? "bg-background text-foreground border-b-background"
            : "bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        Text
      </button>
    </div>
  );
};