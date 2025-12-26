import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ToolbarProps {
  onPaste: () => void;
  onCopy: () => void;
  onFormat: () => void;
  onMinify: () => void;
  onClear: () => void;
  onLoadSample: () => void;
}

export const Toolbar = ({
  onPaste,
  onCopy,
  onFormat,
  onMinify,
  onClear,
  onLoadSample,
}: ToolbarProps) => {
  return (
    <div className="flex items-center justify-between px-2 py-1 bg-muted border-b border-border">
      <div className="flex items-center text-sm">
        <button
          onClick={onPaste}
          className="px-2 py-1 text-foreground hover:text-primary transition-colors"
        >
          Paste
        </button>
        <span className="text-border">|</span>
        <button
          onClick={onCopy}
          className="px-2 py-1 text-foreground hover:text-primary transition-colors"
        >
          Copy
        </button>
        <span className="text-border">|</span>
        <button
          onClick={onFormat}
          className="px-2 py-1 text-foreground hover:text-primary transition-colors"
        >
          Format
        </button>
        <span className="text-border">|</span>
        <button
          onClick={onMinify}
          className="px-2 py-1 text-foreground hover:text-primary transition-colors"
        >
          Remove white space
        </button>
        <span className="text-border">|</span>
        <button
          onClick={onClear}
          className="px-2 py-1 text-foreground hover:text-primary transition-colors"
        >
          Clear
        </button>
        <span className="text-border">|</span>
        <button
          onClick={onLoadSample}
          className="px-2 py-1 text-foreground hover:text-primary transition-colors"
        >
          Load JSON data
        </button>
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <button className="px-2 py-1 text-sm text-foreground hover:text-primary transition-colors">
            About
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Online JSON Viewer</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="font-medium text-foreground mb-1">About JSON</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>JSON</strong>, short for <strong>JavaScript Object Notation</strong>, 
                    is a lightweight computer data interchange format. JSON is a text-based, 
                    human-readable format for representing simple data structures and associative 
                    arrays (called objects).
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Security</h4>
                  <p className="text-sm text-muted-foreground">
                    The JSON code entered is not saved anywhere. All processing happens 
                    locally in your browser.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};