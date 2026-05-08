'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertFilters } from '@/types/alert';
import { X } from 'lucide-react';
import { formatLabel } from '@/lib/utils';

interface Props {
  filters: AlertFilters;
  onChange: (filters: AlertFilters) => void;
}

const SEVERITY_OPTIONS = ['critical', 'high', 'medium', 'low', 'info'];
const STATUS_OPTIONS = ['new', 'investigating', 'resolved', 'false_positive'];
const CATEGORY_OPTIONS = [
  'malware',
  'phishing',
  'unauthorized_access',
  'data_exfiltration',
  'policy_violation',
  'suspicious_login',
];
const SOURCE_OPTIONS = ['endpoint-agent', 'email-gateway', 'firewall', 'cloud-audit'];

export function AlertsFilters({ filters, onChange }: Props) {
  const hasActiveFilters = Object.entries(filters).some(
    ([key, val]) => !['page', 'limit', 'sortBy', 'sortOrder'].includes(key) && !!val
  );

  const set = (key: keyof AlertFilters, value: string | undefined) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const clearAll = () => {
    onChange({ page: 1, limit: filters.limit, sortBy: filters.sortBy, sortOrder: filters.sortOrder });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filters.severity || ''} onValueChange={(v) => set('severity', v || undefined)}>
        <SelectTrigger className="w-36 h-8 text-xs">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          {SEVERITY_OPTIONS.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">{formatLabel(s)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status || ''} onValueChange={(v) => set('status', v || undefined)}>
        <SelectTrigger className="w-40 h-8 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">{formatLabel(s)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.category || ''} onValueChange={(v) => set('category', v || undefined)}>
        <SelectTrigger className="w-44 h-8 text-xs">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map((c) => (
            <SelectItem key={c} value={c} className="text-xs">{formatLabel(c)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.source || ''} onValueChange={(v) => set('source', v || undefined)}>
        <SelectTrigger className="w-40 h-8 text-xs">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          {SOURCE_OPTIONS.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">{formatLabel(s)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-36 h-8 text-xs"
        value={filters.from || ''}
        onChange={(e) => set('from', e.target.value || undefined)}
      />
      <Input
        type="date"
        className="w-36 h-8 text-xs"
        value={filters.to || ''}
        onChange={(e) => set('to', e.target.value || undefined)}
      />

      <Input
        type="text"
        placeholder="Search alerts..."
        className="w-48 h-8 text-xs"
        value={filters.search || ''}
        onChange={(e) => set('search', e.target.value || undefined)}
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={clearAll}>
          <X className="size-3 mr-1" />
          Clear all
        </Button>
      )}
    </div>
  );
}
