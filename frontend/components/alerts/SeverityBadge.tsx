'use client';

import { Badge } from '@/components/ui/badge';
import { Severity } from '@/types/alert';
import { cn } from '@/lib/utils';

const SEVERITY_CONFIG: Record<Severity, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' },
  low: { label: 'Low', className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
  info: { label: 'Info', className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400' },
};

interface Props {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: Props) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <Badge variant="outline" className={cn('font-medium text-xs', config.className, className)}>
      {config.label}
    </Badge>
  );
}
