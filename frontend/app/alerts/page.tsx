import { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { AlertsView } from './AlertsView';

export default function AlertsPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Suspense>
          <AlertsView />
        </Suspense>
      </div>
    </RequireAuth>
  );
}
