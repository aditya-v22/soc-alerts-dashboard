'use client';

import { useCallback } from 'react';
import { AlertsTable } from '@/components/alerts/AlertsTable';
import { AlertsFilters } from '@/components/alerts/AlertsFilters';
import { AlertDetailPanel } from '@/components/alerts/AlertDetailPanel';
import { Pagination } from '@/components/alerts/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useAlerts } from '@/hooks/useAlerts';
import { useAlertFilters } from '@/hooks/useAlertFilters';
import { cn } from '@/lib/utils';

export function AlertsView() {
  const { filters, selectedId, panelMode, setFilters, setSelectedId, setPanelMode } = useAlertFilters();
  const { data, isLoading } = useAlerts(filters);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(selectedId === id ? null : id);
  }, [selectedId, setSelectedId]);

  const handleClosePanel = useCallback(() => {
    setSelectedId(null);
  }, [setSelectedId]);

  const isSticky = selectedId !== null && panelMode === 'sticky';

  return (
    <main className="flex-1 flex overflow-hidden">
      <div className={cn('flex-1 flex flex-col min-w-0 p-6 gap-4', isSticky && 'overflow-hidden')}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Alerts</h1>
          {data && (
            <span className="text-sm text-muted-foreground">
              {data.meta.total.toLocaleString()} total
            </span>
          )}
        </div>

        <AlertsFilters filters={filters} onChange={setFilters} />

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <p className="text-lg font-medium">No alerts found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <AlertsTable
              alerts={data?.data ?? []}
              filters={filters}
              onFiltersChange={setFilters}
              selectedId={selectedId}
              onSelect={handleSelect}
              stickyPanel={isSticky}
            />
            {data && (
              <Pagination
                page={filters.page ?? 1}
                totalPages={data.meta.totalPages}
                onPageChange={(p) => setFilters({ ...filters, page: p })}
              />
            )}
          </>
        )}
      </div>

      {selectedId && (
        <AlertDetailPanel
          alertId={selectedId}
          mode={panelMode}
          onModeChange={setPanelMode}
          onClose={handleClosePanel}
        />
      )}
    </main>
  );
}
