'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAlert } from '@/hooks/useAlert';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { X, PanelRight, PanelRightClose, ChevronDown, ChevronRight, ShieldOff } from 'lucide-react';
import { Severity, Status } from '@/types/alert';
import { cn, formatLabel } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from '@/lib/utils';

interface Props {
  alertId: string;
  mode: 'overlay' | 'sticky';
  onModeChange: (mode: 'overlay' | 'sticky') => void;
  onClose: () => void;
}

const SEVERITY_OPTIONS: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
const STATUS_OPTIONS: Status[] = ['new', 'investigating', 'resolved', 'false_positive'];

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium break-all">{value}</span>
    </div>
  );
}

export function AlertDetailPanel({ alertId, mode, onModeChange, onClose }: Props) {
  const { data: alert, isLoading } = useAlert(alertId);
  const queryClient = useQueryClient();
  const [rawEventOpen, setRawEventOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (patch: { status?: Status; severity?: Severity; assignee?: string | null }) => {
    setUpdating(true);
    try {
      await api.patch(`/alerts/${alertId}`, patch);
      queryClient.invalidateQueries({ queryKey: ['alert', alertId] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert updated');
    } catch {
      toast.error('Failed to update alert');
    } finally {
      setUpdating(false);
    }
  };

  const panelClass = cn(
    'flex flex-col bg-background border-l',
    mode === 'overlay'
      ? 'fixed top-14 right-0 bottom-0 w-[420px] z-30 shadow-xl'
      : 'w-[420px] shrink-0'
  );

  return (
    <div className={panelClass}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <span className="text-sm font-semibold text-muted-foreground">Alert Detail</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title={mode === 'overlay' ? 'Pin panel' : 'Unpin panel'}
            onClick={() => onModeChange(mode === 'overlay' ? 'sticky' : 'overlay')}
          >
            {mode === 'overlay' ? <PanelRight className="size-4" /> : <PanelRightClose className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="size-7" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : alert ? (
          <div className="p-4 space-y-4">
            {/* Title + badges */}
            <div className="space-y-2">
              <h2 className="font-semibold text-sm leading-snug">{alert.title}</h2>
              <div className="flex flex-wrap gap-2">
                <SeverityBadge severity={alert.severity} />
                <StatusBadge status={alert.status} />
              </div>
            </div>

            <Separator />

            {/* Meta */}
            <div className="space-y-2.5">
              <DetailRow label="Category" value={formatLabel(alert.category)} />
              <DetailRow label="Source" value={alert.source} />
              <DetailRow label="Asset" value={alert.affectedAsset} />
              <DetailRow label="Assignee" value={alert.assignee ?? <span className="text-muted-foreground italic">Unassigned</span>} />
              <DetailRow label="Time" value={formatDistanceToNow(new Date(alert.timestamp))} />
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</p>
              <p className="text-sm leading-relaxed">{alert.description}</p>
            </div>

            <Separator />

            {/* Raw event */}
            <div className="space-y-1.5">
              <button
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
                onClick={() => setRawEventOpen((o) => !o)}
              >
                {rawEventOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                Raw Event
              </button>
              {rawEventOpen && (
                <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(alert.rawEvent, null, 2)}
                </pre>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20 shrink-0">Status</span>
                <Select
                  value={alert.status}
                  onValueChange={(v) => handleUpdate({ status: v as Status })}
                  disabled={updating}
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">{formatLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20 shrink-0">Severity</span>
                <Select
                  value={alert.severity}
                  onValueChange={(v) => handleUpdate({ severity: v as Severity })}
                  disabled={updating}
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">{formatLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950 gap-2"
                disabled={updating || alert.status === 'false_positive'}
                onClick={() => handleUpdate({ status: 'false_positive' })}
              >
                <ShieldOff className="size-3.5" />
                Dismiss as false positive
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
