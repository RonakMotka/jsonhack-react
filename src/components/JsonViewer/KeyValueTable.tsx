import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface KeyValueTableProps {
  data: unknown;
}

export const KeyValueTable = ({ data }: KeyValueTableProps) => {
  if (data === null || data === undefined) {
    return (
      <div className="h-full flex items-start justify-center pt-8 text-muted-foreground text-sm">
        Click on a JSON node to view its properties
      </div>
    );
  }

  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  // For primitive values, show a single row
  if (!isObject) {
    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-[hsl(200,70%,85%)] hover:bg-[hsl(200,70%,85%)]">
            <TableHead className="text-foreground font-medium border-r border-border">Name ▲</TableHead>
            <TableHead className="text-foreground font-medium">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="border-r border-border font-mono text-sm">value</TableCell>
            <TableCell className="font-mono text-sm">{String(data)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  const entries = Object.entries(data);

  const formatValue = (value: unknown): string => {
    if (value === null) return 'null';
    if (typeof value === 'object') return '...';
    if (typeof value === 'string') return `"${value}"`;
    return String(value);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[hsl(200,70%,85%)] hover:bg-[hsl(200,70%,85%)]">
          <TableHead className="text-foreground font-medium border-r border-border">Name ▲</TableHead>
          <TableHead className="text-foreground font-medium">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length === 0 ? (
          <TableRow>
            <TableCell colSpan={2} className="text-center text-muted-foreground">
              Empty {isArray ? 'array' : 'object'}
            </TableCell>
          </TableRow>
        ) : (
          entries
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => (
              <TableRow key={key} className="hover:bg-accent/30">
                <TableCell className="border-r border-border font-mono text-sm py-1 px-2">
                  {isArray ? parseInt(key) : key}
                </TableCell>
                <TableCell className="font-mono text-sm py-1 px-2 truncate max-w-[200px]">
                  {formatValue(value)}
                </TableCell>
              </TableRow>
            ))
        )}
      </TableBody>
    </Table>
  );
};
