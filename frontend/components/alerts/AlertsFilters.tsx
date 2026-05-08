'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertFilters } from '@/types/alert';
import { X, ChevronDown, Check } from 'lucide-react';
import { cn, formatLabel } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

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

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  width?: string;
}

function MultiSelect({ label, options, selected, onChange, width = 'w-36' }: MultiSelectProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const displayLabel = selected.length === 0
    ? label
    : selected.length === 1
      ? formatLabel(selected[0])
      : `${formatLabel(selected[0])} +${selected.length - 1}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center justify-between gap-1 h-8 px-3 rounded-md border border-input bg-background text-xs hover:bg-accent transition-colors',
          width,
          selected.length > 0 && 'border-foreground/40'
        )}
      >
        <span className={cn('truncate', selected.length === 0 && 'text-muted-foreground')}>
          {displayLabel}
        </span>
        <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-1 min-w-[160px]">
        {options.map((opt) => {
          const checked = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded hover:bg-accent transition-colors"
            >
              <div className={cn(
                'flex items-center justify-center size-3.5 rounded-sm border shrink-0',
                checked ? 'bg-primary border-primary text-primary-foreground' : 'border-input'
              )}>
                {checked && <Check className="size-2.5" strokeWidth={3} />}
              </div>
              {formatLabel(opt)}
            </button>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AlertsFilters({ filters, onChange }: Props) {
  const [searchValue, setSearchValue] = useState(filters.search ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local search state if filters.search is cleared externally (e.g. "Clear all")
  useEffect(() => {
    setSearchValue(filters.search ?? '');
  }, [filters.search]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange({ ...filters, search: value || undefined, page: 1 });
    }, 400);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, val]) => {
    if (['page', 'limit', 'sortBy', 'sortOrder'].includes(key)) return false;
    if (Array.isArray(val)) return val.length > 0;
    return !!val;
  });

  const setArray = (key: keyof AlertFilters, values: string[]) => {
    onChange({ ...filters, [key]: values.length > 0 ? values : undefined, page: 1 });
  };

  const set = (key: keyof AlertFilters, value: string | undefined) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const clearAll = () => {
    setSearchValue('');
    onChange({ page: 1, limit: filters.limit, sortBy: filters.sortBy, sortOrder: filters.sortOrder });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="text"
        placeholder="Search alerts..."
        className="w-64 h-8 text-xs"
        value={searchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <MultiSelect
        label="Severity"
        options={SEVERITY_OPTIONS}
        selected={filters.severity ?? []}
        onChange={(v) => setArray('severity', v)}
        width="w-36"
      />
      <MultiSelect
        label="Status"
        options={STATUS_OPTIONS}
        selected={filters.status ?? []}
        onChange={(v) => setArray('status', v)}
        width="w-40"
      />
      <MultiSelect
        label="Category"
        options={CATEGORY_OPTIONS}
        selected={filters.category ?? []}
        onChange={(v) => setArray('category', v)}
        width="w-44"
      />
      <MultiSelect
        label="Source"
        options={SOURCE_OPTIONS}
        selected={filters.source ?? []}
        onChange={(v) => setArray('source', v)}
        width="w-40"
      />
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
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          onClick={clearAll}
        >
          <X className="size-3 mr-1" />
          Clear all
        </Button>
      )}
    </div>
  );
}
