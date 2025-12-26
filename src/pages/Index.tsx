import { JsonEditor } from '@/components/JsonViewer/JsonEditor';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        {/* Main Editor Area */}
        <main className="flex-1">
          <div className="h-[calc(100vh-50px)] min-h-[500px]">
            <JsonEditor />
          </div>
        </main>

        {/* Footer */}
        <footer className="gradient-header py-3 text-center text-sm">
          <p>
            <span className="text-destructive">❤</span>{' '}
            <span className="font-medium">Support this one-nerd project</span>,{' '}
            <span className="font-medium">remove ads</span> and{' '}
            <span className="font-medium">increase loading speed</span> all for $19 (one-time):{' '}
            <a href="#" className="text-primary font-medium hover:underline">
              Are you with me?
            </a>
          </p>
        </footer>
      </div>
      <Toaster position="bottom-right" />
    </>
  );
};

export default Index;
