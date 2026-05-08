'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { AlertsTable } from '@/components/alerts/AlertsTable';
import { AlertsFilters } from '@/components/alerts/AlertsFilters';
import { AlertDetailPanel } from '@/components/alerts/AlertDetailPanel';
import { Pagination } from '@/components/alerts/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useAlerts } from '@/hooks/useAlerts';
import { AlertFilters } from '@/types/alert';
import { cn } from '@/lib/utils';

const DEFAULT_FILTERS: AlertFilters = {
  page: 1,
  limit: 25,
  sortBy: 'timestamp',
  sortOrder: 'desc',
};

export default function AlertsPage() {
  const [filters, setFilters] = useState<AlertFilters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<'overlay' | 'sticky'>('overlay');

  const { data, isLoading } = useAlerts(filters);

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handlePanelModeChange = (mode: 'overlay' | 'sticky') => {
    setPanelMode(mode);
    localStorage.setItem('panel_mode', mode);
  };

  const isSticky = selectedId !== null && panelMode === 'sticky';

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 flex overflow-hidden">
          <div className={cn('flex-1 flex flex-col min-w-0 p-6 gap-4', isSticky && 'overflow-hidden')}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Alerts</h1>
              {data && (
                <span className="text-sm text-muted-foreground">
                  {data.meta.total.toLocaleString()} total
                </span>
              )}
            </div>

            {/* Filters */}
            <AlertsFilters filters={filters} onChange={setFilters} />

            {/* Table */}
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
                    onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
                  />
                )}
              </>
            )}
          </div>

          {selectedId && (
            <AlertDetailPanel
              alertId={selectedId}
              mode={panelMode}
              onModeChange={handlePanelModeChange}
              onClose={() => setSelectedId(null)}
            />
          )}
        </main>
      </div>
    </RequireAuth>
  );
}
