import { Navbar } from '@/components/layout/Navbar';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { DashboardView } from './DashboardView';

export default function DashboardPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <DashboardView />
      </div>
    </RequireAuth>
  );
}
