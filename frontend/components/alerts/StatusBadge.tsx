'use client';

import { Badge } from '@/components/ui/badge';
import { Status } from '@/types/alert';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<Status, { label: string; dotClass: string; className: string }> = {
  new: {
    label: 'New',
    dotClass: 'bg-blue-500',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
  },
  investigating: {
    label: 'Investigating',
    dotClass: 'bg-amber-500',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
  },
  resolved: {
    label: 'Resolved',
    dotClass: 'bg-green-500',
    className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400',
  },
  false_positive: {
    label: 'False Positive',
    dotClass: 'bg-gray-400',
    className: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
  },
};

interface Props {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn('font-medium text-xs gap-1.5', config.className, className)}>
      <span className={cn('size-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </Badge>
  );
}
