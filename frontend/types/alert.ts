export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Status = 'new' | 'investigating' | 'resolved' | 'false_positive';
export type Category =
  | 'malware'
  | 'phishing'
  | 'unauthorized_access'
  | 'data_exfiltration'
  | 'policy_violation'
  | 'suspicious_login';
export type Source = 'endpoint-agent' | 'email-gateway' | 'firewall' | 'cloud-audit';

export interface Alert {
  id: string;
  timestamp: string;
  title: string;
  severity: Severity;
  severityRank: number;
  status: Status;
  category: Category;
  source: Source;
  affectedAsset: string;
  assignee: string | null;
  description: string;
  rawEvent: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAlerts {
  data: Alert[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AlertStats {
  bySeverity: { severity: Severity; count: number }[];
  byStatus: { status: Status; count: number }[];
  byCategory: { category: Category; count: number }[];
}

export interface AlertFilters {
  severity?: string[];
  status?: string[];
  category?: string[];
  source?: string[];
  from?: string;
  to?: string;
  sortBy?: 'timestamp' | 'severity';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  page?: number;
  limit?: number;
}
