'use client';

import { useRouter } from 'next/navigation';
import { useAlertStats } from '@/hooks/useAlertStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import { ShieldAlert, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { formatLabel } from '@/lib/utils';
import { useAlertTimeline } from '@/hooks/useAlertTimeline';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#3b82f6',
  info:     '#6b7280',
};

const STATUS_COLORS: Record<string, string> = {
  new:            '#ef4444',
  investigating:  '#f97316',
  resolved:       '#22c55e',
  false_positive: '#6b7280',
};

const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#10b981',
];

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex items-center justify-center size-12 rounded-xl" style={{ backgroundColor: `${color}20` }}>
          <Icon className="size-6" style={{ color }} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useAlertStats();
  const { data: timeline } = useAlertTimeline(30);

  const total = (stats?.bySeverity ?? []).reduce((sum, s) => sum + s.count, 0);
  const critical = stats?.bySeverity.find((s) => s.severity === 'critical')?.count ?? 0;
  const open = stats?.byStatus.find((s) => s.status === 'new')?.count ?? 0;
  const investigating = stats?.byStatus.find((s) => s.status === 'investigating')?.count ?? 0;

  const severityData = (stats?.bySeverity ?? []).map((s) => ({
    name: formatLabel(s.severity),
    value: s.count,
    key: s.severity,
  }));

  const statusData = (stats?.byStatus ?? []).map((s) => ({
    name: formatLabel(s.status),
    value: s.count,
    key: s.status,
  }));

  const categoryData = (stats?.byCategory ?? [])
    .sort((a, b) => b.count - a.count)
    .map((c) => ({
      name: formatLabel(c.category),
      value: c.count,
      key: c.category,
    }));

  const goToAlerts = (filterKey: string, value: string) => {
    router.push(`/alerts?${filterKey}=${value}`);
  };

  if (statsLoading) {
    return (
      <main className="flex-1 px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="h-24 pt-6 animate-pulse bg-muted/40 rounded-xl" /></Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-6 space-y-6">
      {/* Timeline chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Alert Trend — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={timeline ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: string) => v.slice(5)}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                labelFormatter={(label) => label}
                formatter={(value) => [value, 'Alerts']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#timelineGrad)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Alerts" value={total} icon={ShieldAlert} color="#6366f1" />
        <StatCard
          title="Critical"
          value={critical}
          icon={AlertTriangle}
          color="#ef4444"
          onClick={() => goToAlerts('severity', 'critical')}
        />
        <StatCard
          title="Open"
          value={open}
          icon={Clock}
          color="#f97316"
          onClick={() => goToAlerts('status', 'new')}
        />
        <StatCard
          title="Investigating"
          value={investigating}
          icon={ShieldCheck}
          color="#3b82f6"
          onClick={() => goToAlerts('status', 'investigating')}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Severity donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">By Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={(entry) => goToAlerts('severity', String(entry.key ?? ''))}
                  className="cursor-pointer"
                >
                  {severityData.map((entry) => (
                    <Cell key={entry.key} fill={SEVERITY_COLORS[entry.key] ?? '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {severityData.map((entry) => (
                <button
                  key={entry.key}
                  onClick={() => goToAlerts('severity', String(entry.key ?? ''))}
                  className="flex items-center gap-1.5 text-xs hover:opacity-70 transition-opacity"
                >
                  <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: SEVERITY_COLORS[entry.key] }} />
                  {entry.name} ({entry.value})
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} onClick={(entry) => goToAlerts('status', String(entry.key ?? ''))} className="cursor-pointer">
                  {statusData.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key] ?? '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} onClick={(entry) => goToAlerts('category', String(entry.key ?? ''))} className="cursor-pointer">
                  {categoryData.map((entry, i) => (
                    <Cell key={entry.key} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
