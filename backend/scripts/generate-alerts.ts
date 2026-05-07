import { v4 as uuidv4 } from 'uuid';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Status =
  | 'new'
  | 'investigating'
  | 'resolved'
  | 'false_positive';
export type Category =
  | 'malware'
  | 'phishing'
  | 'unauthorized_access'
  | 'data_exfiltration'
  | 'policy_violation'
  | 'suspicious_login';
export type Source =
  | 'endpoint-agent'
  | 'email-gateway'
  | 'firewall'
  | 'cloud-audit';

export interface GeneratedAlert {
  id: string;
  timestamp: Date;
  title: string;
  severity: Severity;
  severityRank: number;
  status: Status;
  category: Category;
  source: Source;
  affectedAsset: string;
  assignee: string | null;
  description: string;
  rawEvent: string;
}

function weightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SEVERITY_WEIGHTS: [Severity, number, number][] = [
  ['critical', 5, 5],
  ['high', 10, 4],
  ['medium', 20, 3],
  ['low', 30, 2],
  ['info', 35, 1],
];

const STATUS_WEIGHTS: [Status, number][] = [
  ['new', 45],
  ['investigating', 25],
  ['resolved', 20],
  ['false_positive', 10],
];

const CATEGORY_WEIGHTS: [Category, number][] = [
  ['suspicious_login', 25],
  ['policy_violation', 20],
  ['phishing', 18],
  ['unauthorized_access', 15],
  ['malware', 12],
  ['data_exfiltration', 10],
];

const SOURCE_WEIGHTS: [Source, number][] = [
  ['endpoint-agent', 30],
  ['email-gateway', 25],
  ['firewall', 20],
  ['cloud-audit', 25],
];

const ANALYSTS = [
  'j.smith',
  'a.patel',
  'r.chen',
  'm.garcia',
  null,
  null,
  null,
];

const HOSTNAMES = [
  'DESKTOP-A3F2B1',
  'DESKTOP-9C8D7E',
  'LAPTOP-X4K2M9',
  'LAPTOP-P7R3N1',
  'srv-web-01',
  'srv-db-02',
  'srv-auth-03',
  'srv-proxy-01',
  'wks-finance-12',
  'wks-hr-07',
  'wks-devops-03',
];

const USER_ACCOUNTS = [
  'j.smith@corp.local',
  'a.patel@corp.local',
  'r.chen@corp.local',
  'm.garcia@corp.local',
  'admin@corp.local',
  'svc-backup@corp.local',
  'svc-monitor@corp.local',
];

const IP_ADDRESSES = [
  '192.168.1.45',
  '192.168.2.112',
  '10.0.0.23',
  '10.0.1.88',
  '172.16.0.5',
  '45.33.32.156',
  '185.220.101.47',
  '198.51.100.22',
];

const COUNTRIES = ['Russia', 'China', 'Nigeria', 'Brazil', 'North Korea'];

const PROCESSES = [
  'powershell.exe',
  'cmd.exe',
  'wscript.exe',
  'mshta.exe',
  'rundll32.exe',
  'regsvr32.exe',
];

const TITLES: Record<Category, string[]> = {
  malware: [
    'Potential malware execution on {asset}',
    'Suspicious process spawned by {process}',
    'Known malware hash detected on {asset}',
    'Ransomware behavior detected on {asset}',
    'Trojan activity observed on {asset}',
  ],
  phishing: [
    'Phishing link clicked by {user}',
    'Malicious email attachment opened on {asset}',
    'Credential harvesting page accessed from {asset}',
    'Phishing email delivered to {user}',
    'Suspicious redirect chain detected on {asset}',
  ],
  unauthorized_access: [
    'Unauthorized access attempt on {asset}',
    'Privilege escalation attempt by {user}',
    'Lateral movement detected from {asset}',
    'Unauthorized file access on {asset}',
    'Admin credentials used from unexpected host {asset}',
  ],
  data_exfiltration: [
    'Large data transfer detected from {asset}',
    'Sensitive file upload to external service from {asset}',
    'Unusual outbound traffic volume from {asset}',
    'Data staging activity detected on {asset}',
    'Cloud storage exfiltration attempt from {user}',
  ],
  policy_violation: [
    'USB device connected on {asset}',
    'Unapproved software installed on {asset}',
    'Policy violation: personal email access on {asset}',
    'VPN policy bypass attempted from {asset}',
    'Screen capture tool usage detected on {asset}',
  ],
  suspicious_login: [
    'Failed login attempts from {ip}',
    'Login from unusual location: {country}',
    'Impossible travel detected for {user}',
    'Brute force attempt against {asset}',
    'After-hours login detected for {user}',
  ],
};

const DESCRIPTIONS: Record<Category, string[]> = {
  malware: [
    'The endpoint agent detected execution of a binary matching known malware signatures. The process was spawned from an unusual parent and attempted to disable Windows Defender.',
    'A process was detected executing with obfuscated command-line arguments, consistent with PowerShell-based malware delivery.',
    'File hash matches a known ransomware variant in threat intelligence feeds. Immediate isolation recommended.',
  ],
  phishing: [
    'User clicked a link in an email that redirected through multiple domains before landing on a credential harvesting page.',
    'An email attachment was opened that spawned a child process, potentially executing a macro-enabled document.',
    'Email gateway detected a message containing a URL matching a known phishing kit infrastructure.',
  ],
  unauthorized_access: [
    'Multiple failed authentication attempts were followed by a successful login, suggesting credential stuffing.',
    'A standard user account attempted to execute commands requiring elevated privileges.',
    'Authentication event observed from a host not previously associated with this account.',
  ],
  data_exfiltration: [
    'Outbound traffic to an external IP exceeded the 90-day baseline by 400%. Destination is a newly registered domain.',
    'A batch of sensitive documents was compressed and uploaded to a personal cloud storage service.',
    'Network flow analysis indicates staged data transfer consistent with pre-exfiltration activity.',
  ],
  policy_violation: [
    'A removable USB storage device was connected to a managed endpoint in a restricted zone.',
    'Software not on the approved application whitelist was installed without going through the change management process.',
    'Browser history indicates access to personal webmail from a corporate device in a restricted department.',
  ],
  suspicious_login: [
    'The account recorded login events from two geographically distant locations within a 30-minute window.',
    'Multiple failed password attempts were detected against this account from an external IP address.',
    'Login occurred at 02:14 local time, which is outside the user\'s normal working pattern.',
  ],
};

function generateRawEvent(source: Source, asset: string): object {
  switch (source) {
    case 'endpoint-agent':
      return {
        process_name: randomElement(PROCESSES),
        pid: randomInt(1000, 65535),
        parent_pid: randomInt(1, 999),
        command_line: `${randomElement(PROCESSES)} -ExecutionPolicy Bypass -enc ${uuidv4().replace(/-/g, '').substring(0, 24)}`,
        file_hash: `sha256:${uuidv4().replace(/-/g, '')}${uuidv4().replace(/-/g, '')}`.substring(0, 71),
        user: randomElement(USER_ACCOUNTS),
        hostname: asset,
        event_time: new Date().toISOString(),
      };
    case 'email-gateway':
      return {
        sender: `noreply@${randomElement(['support-update.net', 'secure-login.org', 'account-verify.com', 'helpdesk-ticket.net'])}`,
        recipient: randomElement(USER_ACCOUNTS),
        subject: randomElement([
          'Action Required: Verify Your Account',
          'Your password will expire soon',
          'Invoice #INV-' + randomInt(1000, 9999),
          'Shared document: Q4 Report',
          'Urgent: Security Alert',
        ]),
        url_list: [
          `http://${randomElement(['update', 'login', 'verify', 'secure'])}.${randomElement(['corp-support.net', 'account-help.org', 'service-desk.io'])}/${uuidv4().substring(0, 8)}`,
        ],
        attachment_hash: `md5:${uuidv4().replace(/-/g, '').substring(0, 32)}`,
        message_id: `<${uuidv4()}@mail.example.com>`,
        spam_score: (Math.random() * 10).toFixed(2),
      };
    case 'firewall':
      return {
        src_ip: randomElement(IP_ADDRESSES),
        dst_ip: randomElement(IP_ADDRESSES),
        src_port: randomInt(1024, 65535),
        dst_port: randomElement([80, 443, 22, 3389, 445, 8080, 8443]),
        protocol: randomElement(['TCP', 'UDP']),
        action: randomElement(['BLOCK', 'ALLOW', 'RESET']),
        bytes_in: randomInt(100, 50000),
        bytes_out: randomInt(100, 5000000),
        packets: randomInt(1, 10000),
        rule_id: `FW-RULE-${randomInt(100, 999)}`,
        interface: randomElement(['eth0', 'eth1', 'wan0']),
      };
    case 'cloud-audit':
      return {
        principal: randomElement(USER_ACCOUNTS),
        action: randomElement([
          'iam.roles.update',
          's3.objects.get',
          'compute.instances.delete',
          'storage.buckets.setIamPolicy',
          'cloudresourcemanager.projects.setIamPolicy',
        ]),
        resource: `projects/corp-prod/${randomElement(['buckets', 'instances', 'functions'])}/${randomElement(['backup-data', 'prod-db', 'audit-logs'])}`,
        region: randomElement(['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']),
        user_agent: randomElement([
          'Mozilla/5.0 (compatible; custom-script/1.0)',
          'aws-cli/2.x Python/3.x',
          'Terraform/1.x',
          'custom-tool/0.3.1',
        ]),
        source_ip: randomElement(IP_ADDRESSES),
        success: Math.random() > 0.3,
        mfa_used: Math.random() > 0.5,
      };
  }
}

function generateTitle(category: Category, asset: string): string {
  const template = randomElement(TITLES[category]);
  return template
    .replace('{asset}', asset)
    .replace('{user}', randomElement(USER_ACCOUNTS).split('@')[0])
    .replace('{process}', randomElement(PROCESSES))
    .replace('{ip}', randomElement(IP_ADDRESSES))
    .replace('{country}', randomElement(COUNTRIES));
}

function generateDescription(category: Category): string {
  return randomElement(DESCRIPTIONS[category]);
}

function generateTimestamp(): Date {
  // Spread over last 6 weeks, with recency bias for last 2 weeks
  const now = Date.now();
  const sixWeeksAgo = now - 42 * 24 * 60 * 60 * 1000;
  const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

  // 60% of alerts in last 2 weeks
  const start = Math.random() < 0.6 ? twoWeeksAgo : sixWeeksAgo;
  const end = Math.random() < 0.6 ? now : twoWeeksAgo;

  return new Date(start + Math.random() * (end - start));
}

function getAffectedAsset(source: Source): string {
  switch (source) {
    case 'endpoint-agent':
      return randomElement(HOSTNAMES);
    case 'email-gateway':
      return randomElement(USER_ACCOUNTS);
    case 'firewall':
      return randomElement(IP_ADDRESSES);
    case 'cloud-audit':
      return randomElement(USER_ACCOUNTS);
  }
}

export function generateAlerts(count: number): GeneratedAlert[] {
  const alerts: GeneratedAlert[] = [];

  for (let i = 0; i < count; i++) {
    const [severity, , severityRank] = weightedRandom(
      SEVERITY_WEIGHTS,
      SEVERITY_WEIGHTS.map((s) => s[1]),
    );
    const [status] = weightedRandom(STATUS_WEIGHTS, STATUS_WEIGHTS.map((s) => s[1]));
    const [category] = weightedRandom(CATEGORY_WEIGHTS, CATEGORY_WEIGHTS.map((s) => s[1]));
    const [source] = weightedRandom(SOURCE_WEIGHTS, SOURCE_WEIGHTS.map((s) => s[1]));
    const affectedAsset = getAffectedAsset(source);

    alerts.push({
      id: uuidv4(),
      timestamp: generateTimestamp(),
      title: generateTitle(category, affectedAsset),
      severity,
      severityRank,
      status,
      category,
      source,
      affectedAsset,
      assignee: randomElement(ANALYSTS),
      description: generateDescription(category),
      rawEvent: JSON.stringify(generateRawEvent(source, affectedAsset)),
    });
  }

  return alerts;
}
