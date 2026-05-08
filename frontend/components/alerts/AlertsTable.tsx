'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { Alert, AlertFilters } from '@/types/alert';
import { formatDistanceToNow, formatLabel } from '@/lib/utils';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  alerts: Alert[];
  filters: AlertFilters;
  onFiltersChange: (filters: AlertFilters) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  stickyPanel: boolean;
}

function SortIcon({ column, filters }: { column: 'timestamp' | 'severity'; filters: AlertFilters }) {
  if (filters.sortBy !== column) return <ChevronsUpDown className="size-3 text-muted-foreground/50" />;
  return filters.sortOrder === 'asc'
    ? <ArrowUp className="size-3" />
    : <ArrowDown className="size-3" />;
}

export function AlertsTable({ alerts, filters, onFiltersChange, selectedId, onSelect, stickyPanel }: Props) {
  const toggleSort = (col: 'timestamp' | 'severity') => {
    onFiltersChange({
      ...filters,
      sortBy: col,
      sortOrder: filters.sortBy === col && filters.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1,
    });
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/80 bg-muted">
            <TableHead className="w-28">
              <button
                className="flex items-center gap-1 font-medium text-xs hover:text-foreground transition-colors"
                onClick={() => toggleSort('severity')}
              >
                Severity <SortIcon column="severity" filters={filters} />
              </button>
            </TableHead>
            <TableHead>
              <span className="font-medium text-xs">Title</span>
            </TableHead>
            {!stickyPanel && (
              <TableHead className="w-40">
                <span className="font-medium text-xs">Category</span>
              </TableHead>
            )}
            <TableHead className="w-36">
              <span className="font-medium text-xs">Source</span>
            </TableHead>
            <TableHead className="w-36">
              <span className="font-medium text-xs">Status</span>
            </TableHead>
            <TableHead className="w-28">
              <button
                className="flex items-center gap-1 font-medium text-xs hover:text-foreground transition-colors"
                onClick={() => toggleSort('timestamp')}
              >
                Time <SortIcon column="timestamp" filters={filters} />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => (
            <TableRow
              key={alert.id}
              className={cn(
                'cursor-pointer transition-colors',
                selectedId === alert.id && 'bg-muted/60'
              )}
              onClick={() => onSelect(alert.id)}
            >
              <TableCell>
                <SeverityBadge severity={alert.severity} />
              </TableCell>
              <TableCell className="max-w-0">
                <span className="text-sm font-bold block truncate w-full">
                  {alert.title}
                </span>
              </TableCell>
              {!stickyPanel && (
                <TableCell className="text-sm text-muted-foreground">
                  {formatLabel(alert.category)}
                </TableCell>
              )}
              <TableCell className="text-sm text-muted-foreground">{alert.source}</TableCell>
              <TableCell>
                <StatusBadge status={alert.status} />
              </TableCell>
              <TableCell
                className="text-sm text-muted-foreground"
                title={new Date(alert.timestamp).toLocaleString()}
              >
                {formatDistanceToNow(new Date(alert.timestamp))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
