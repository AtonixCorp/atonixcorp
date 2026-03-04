// AtonixCorp – Enterprise API Service
// Covers all org-scoped modules: Email, Domains, Branding, Billing, Audit.
// Routes under /api/enterprise/*

import axios from 'axios';
import { config } from '../config/environment';

// ── Axios client ──────────────────────────────────────────────────────────────
const enterpriseClient = axios.create({
  baseURL: config.API_BASE_URL + '/enterprise',
  timeout: config.API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

enterpriseClient.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('authToken');
  if (token) cfg.headers.Authorization = `Token ${token}`;
  return cfg;
});

enterpriseClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(err);
  },
);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OrgData {
  id: string;
  name: string;
  slug: string;
  primary_domain: string;
  industry: string;
  country: string;
  plan: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  member_count: number;
  contact_email: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

export interface OrgGroup {
  id: string;
  team: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface OrgTeam {
  id: string;
  department: string;
  name: string;
  description: string;
  team_type: 'DEPARTMENT' | 'FUNCTION' | 'SQUAD';
  groups: OrgGroup[];
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  organization: string;
  name: string;
  category: string;
  description: string;
  department_lead: string;
  parent: string | null;
  teams: OrgTeam[];
  created_at: string;
  updated_at: string;
}

// ── Department Sidebar ────────────────────────────────────────────────────────
export type SidebarItemType = 'navigation' | 'action' | 'resource' | 'highlight' | 'custom';

export interface DeptSidebarItem {
  id: string;
  item_type: SidebarItemType;
  label: string;
  url: string;
  icon: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type DeptSidebarItemWrite = Omit<DeptSidebarItem, 'id' | 'created_at' | 'updated_at'>;

export interface OrgMember {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  permissions: Record<string, boolean>;
  joined_at: string | null;
  invited_at: string;
}

export interface SendDomain {
  id: string;
  domain: string;
  status: 'PENDING_DNS' | 'VERIFIED' | 'FAILED';
  dkim_record: string;
  spf_record: string;
  tracking_domain: string;
  selector: string;
  last_checked_at: string | null;
  created_at: string;
}

export interface SenderIdentity {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  verified_at: string | null;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string;
  variables: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailLogEntry {
  id: string;
  campaign_id: string;
  to_email: string;
  from_email: string;
  subject: string;
  status: 'QUEUED' | 'SENT' | 'FAILED' | 'BOUNCED' | 'OPENED' | 'CLICKED';
  provider_message_id: string;
  created_at: string;
}

export interface OrgDomain {
  id: string;
  name: string;
  type: 'APP' | 'MARKETING' | 'EMAIL' | 'MIXED';
  status: 'PENDING_DNS' | 'ACTIVE' | 'FAILED';
  linked_apps: string[];
  record_count: number;
  records: DomainRecord[];
  created_at: string;
}

export interface DomainRecord {
  id: string;
  type: 'A' | 'CNAME' | 'TXT' | 'MX';
  name: string;
  value: string;
  ttl: number;
  managed_by_platform: boolean;
}

export interface BrandingProfile {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url: string;
  favicon_url: string;
  font_family: string;
  custom_css: string;
  assets: BrandAsset[];
  created_at: string;
  updated_at: string;
}

export interface BrandAsset {
  id: string;
  type: 'LOGO' | 'ICON' | 'IMAGE' | 'DOCUMENT';
  url: string;
  label: string;
  file_size_bytes: number;
  mime_type: string;
  created_at: string;
}

export interface EnterprisePlan {
  id: string;
  name: string;
  price_monthly: string;
  price_yearly: string;
  limits: Record<string, number | null>;
  features: string[];
  is_active: boolean;
}

export interface Subscription {
  id: string;
  plan: EnterprisePlan | null;
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED';
  renewal_date: string | null;
  created_at: string;
}

export interface EnterpriseInvoice {
  id: string;
  amount: string;
  currency: string;
  status: 'DUE' | 'PAID' | 'FAILED';
  period_start: string;
  period_end: string;
  pdf_url: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_email: string;
  actor_name: string;
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  timestamp: string;
}

// ── Entry (org-context resolver) ─────────────────────────────────────────────
export const enterpriseEntryApi = {
  /** Returns { organizations: OrgData[] }. Empty array → redirect to create. */
  resolve: () =>
    enterpriseClient.get<{ organizations: OrgData[] }>('/entry/').then(r => r.data),
};

// ── Organization ──────────────────────────────────────────────────────────────
export const organizationApi = {
  list: () =>
    enterpriseClient
      .get<OrgData[] | { results: OrgData[] }>('/organizations/')
      .then(r => unwrap(r.data)),

  create: (data: {
    name: string;
    slug: string;
    primary_domain?: string;
    industry?: string;
    country?: string;
    contact_email?: string;
    logo_url?: string;
  }) =>
    enterpriseClient.post<OrgData>('/organizations/', data).then(r => r.data),

  get: (orgId: string) =>
    enterpriseClient.get<OrgData>(`/organizations/${orgId}/`).then(r => r.data),

  update: (orgId: string, data: Partial<OrgData>) =>
    enterpriseClient.patch<OrgData>(`/organizations/${orgId}/`, data).then(r => r.data),

  delete: (orgId: string) =>
    enterpriseClient.delete(`/organizations/${orgId}/`),

  /** Resolve by slug (searches the list, returns first match). */
  getBySlug: async (slug: string): Promise<OrgData> => {
    const list = await organizationApi.list();
    const org = list.find(o => o.slug === slug);
    if (!org) throw new Error(`Organization "${slug}" not found`);
    return org;
  },
};

// helper: unwrap DRF pagination envelope if present
function unwrap<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : data.results;
}

// ── Departments ───────────────────────────────────────────────────────────────
export const departmentsApi = {
  list: (orgId: string) =>
    enterpriseClient
      .get<Department[] | { results: Department[] }>(`/organizations/${orgId}/departments/`)
      .then(r => unwrap(r.data)),

  create: (orgId: string, payload: {
    name: string;
    category?: string;
    description?: string;
    department_lead?: string;
    parent?: string;
  }) =>
    enterpriseClient.post<Department>(`/organizations/${orgId}/departments/`, payload).then(r => r.data),

  update: (orgId: string, deptId: string, payload: {
    name?: string;
    category?: string;
    description?: string;
    department_lead?: string;
    parent?: string;
  }) =>
    enterpriseClient.patch<Department>(`/organizations/${orgId}/departments/${deptId}/`, payload).then(r => r.data),

  remove: (orgId: string, deptId: string) =>
    enterpriseClient.delete(`/organizations/${orgId}/departments/${deptId}/`),
};

// ── Department Sidebar Items ───────────────────────────────────────────────────
export const deptSidebarApi = {
  list: (orgId: string, deptId: string) =>
    enterpriseClient
      .get<DeptSidebarItem[]>(`/organizations/${orgId}/departments/${deptId}/sidebar/`)
      .then(r => r.data),

  create: (orgId: string, deptId: string, payload: DeptSidebarItemWrite) =>
    enterpriseClient
      .post<DeptSidebarItem>(`/organizations/${orgId}/departments/${deptId}/sidebar/`, payload)
      .then(r => r.data),

  update: (orgId: string, deptId: string, itemId: string, payload: Partial<DeptSidebarItemWrite>) =>
    enterpriseClient
      .patch<DeptSidebarItem>(`/organizations/${orgId}/departments/${deptId}/sidebar/${itemId}/`, payload)
      .then(r => r.data),

  bulkSet: (orgId: string, deptId: string, items: DeptSidebarItemWrite[]) =>
    enterpriseClient
      .post<DeptSidebarItem[]>(`/organizations/${orgId}/departments/${deptId}/sidebar/bulk_set/`, { items })
      .then(r => r.data),

  remove: (orgId: string, deptId: string, itemId: string) =>
    enterpriseClient.delete(`/organizations/${orgId}/departments/${deptId}/sidebar/${itemId}/`),
};

// ── Teams ─────────────────────────────────────────────────────────────────────
export const orgTeamsApi = {
  list: (orgId: string, deptId: string) =>
    enterpriseClient
      .get<OrgTeam[] | { results: OrgTeam[] }>(`/organizations/${orgId}/departments/${deptId}/teams/`)
      .then(r => unwrap(r.data)),

  create: (orgId: string, deptId: string, payload: { name: string; description?: string; team_type?: string }) =>
    enterpriseClient.post<OrgTeam>(`/organizations/${orgId}/departments/${deptId}/teams/`, payload).then(r => r.data),

  update: (orgId: string, deptId: string, teamId: string, payload: { name?: string; description?: string; team_type?: string }) =>
    enterpriseClient.patch<OrgTeam>(`/organizations/${orgId}/departments/${deptId}/teams/${teamId}/`, payload).then(r => r.data),

  remove: (orgId: string, deptId: string, teamId: string) =>
    enterpriseClient.delete(`/organizations/${orgId}/departments/${deptId}/teams/${teamId}/`),
};

// ── Groups ────────────────────────────────────────────────────────────────────
export const orgGroupsApi = {
  list: (orgId: string, deptId: string, teamId: string) =>
    enterpriseClient
      .get<OrgGroup[] | { results: OrgGroup[] }>(`/organizations/${orgId}/departments/${deptId}/teams/${teamId}/groups/`)
      .then(r => unwrap(r.data)),

  create: (orgId: string, deptId: string, teamId: string, payload: { name: string; description?: string }) =>
    enterpriseClient.post<OrgGroup>(`/organizations/${orgId}/departments/${deptId}/teams/${teamId}/groups/`, payload).then(r => r.data),

  update: (orgId: string, deptId: string, teamId: string, groupId: string, payload: { name?: string; description?: string }) =>
    enterpriseClient.patch<OrgGroup>(`/organizations/${orgId}/departments/${deptId}/teams/${teamId}/groups/${groupId}/`, payload).then(r => r.data),

  remove: (orgId: string, deptId: string, teamId: string, groupId: string) =>
    enterpriseClient.delete(`/organizations/${orgId}/departments/${deptId}/teams/${teamId}/groups/${groupId}/`),
};

// ── Members ───────────────────────────────────────────────────────────────────
export const membersApi = {
  list: (orgId: string) =>
    enterpriseClient.get<OrgMember[]>(`/organizations/${orgId}/members/`).then(r => r.data),

  invite: (orgId: string, payload: { email: string; name?: string; role: string }) =>
    enterpriseClient.post<OrgMember>(`/organizations/${orgId}/members/invite/`, payload).then(r => r.data),

  updateRole: (orgId: string, memberId: string, role: string) =>
    enterpriseClient.patch<OrgMember>(`/organizations/${orgId}/members/${memberId}/`, { role }).then(r => r.data),

  remove: (orgId: string, memberId: string) =>
    enterpriseClient.delete(`/organizations/${orgId}/members/${memberId}/`),
};

// ── Email Sending Domains ─────────────────────────────────────────────────────
export const sendDomainsApi = {
  list: (orgId: string) =>
    enterpriseClient.get<SendDomain[]>(`/organizations/${orgId}/email-domains/`).then(r => r.data),

  add: (orgId: string, payload: { domain: string; tracking_domain?: string; selector?: string }) =>
    enterpriseClient.post<SendDomain>(`/organizations/${orgId}/email-domains/`, payload).then(r => r.data),

  checkDns: (orgId: string, domainId: string) =>
    enterpriseClient.post<SendDomain>(`/organizations/${orgId}/email-domains/${domainId}/check-dns/`).then(r => r.data),

  remove: (orgId: string, domainId: string) =>
    enterpriseClient.delete(`/organizations/${orgId}/email-domains/${domainId}/`),
};

// ── Sender Identities ─────────────────────────────────────────────────────────
export const senderIdentitiesApi = {
  list: (orgId: string) =>
    enterpriseClient.get<SenderIdentity[]>(`/organizations/${orgId}/email-senders/`).then(r => r.data),

  add: (orgId: string, payload: { email: string; name: string }) =>
    enterpriseClient.post<SenderIdentity>(`/organizations/${orgId}/email-senders/`, payload).then(r => r.data),

  verify: (orgId: string, senderId: string) =>
    enterpriseClient.post<SenderIdentity>(`/organizations/${orgId}/email-senders/${senderId}/verify/`).then(r => r.data),

  remove: (orgId: string, senderId: string) =>
    enterpriseClient.delete(`/organizations/${orgId}/email-senders/${senderId}/`),
};

// ── Email Templates ───────────────────────────────────────────────────────────
export const emailTemplatesApi = {
  list: (orgId: string) =>
    enterpriseClient.get<EmailTemplate[]>(`/organizations/${orgId}/email-templates/`).then(r => r.data),

  create: (orgId: string, payload: Partial<EmailTemplate>) =>
    enterpriseClient.post<EmailTemplate>(`/organizations/${orgId}/email-templates/`, payload).then(r => r.data),

  update: (orgId: string, id: string, payload: Partial<EmailTemplate>) =>
    enterpriseClient.patch<EmailTemplate>(`/organizations/${orgId}/email-templates/${id}/`, payload).then(r => r.data),

  remove: (orgId: string, id: string) =>
    enterpriseClient.delete(`/organizations/${orgId}/email-templates/${id}/`),
};

// ── Email Logs ────────────────────────────────────────────────────────────────
export const emailLogsApi = {
  list: (orgId: string, filters?: { status?: string; campaign_id?: string }) =>
    enterpriseClient.get<EmailLogEntry[]>(`/organizations/${orgId}/email-logs/`, { params: filters }).then(r => r.data),
};

// ── Organization Domains ──────────────────────────────────────────────────────
export const orgDomainsApi = {
  list: (orgId: string) =>
    enterpriseClient.get<OrgDomain[]>(`/organizations/${orgId}/domains/`).then(r => r.data),

  add: (orgId: string, payload: { name: string; type?: string }) =>
    enterpriseClient.post<OrgDomain>(`/organizations/${orgId}/domains/`, payload).then(r => r.data),

  records: (orgId: string, domainId: string) =>
    enterpriseClient.get<DomainRecord[]>(`/organizations/${orgId}/domains/${domainId}/records/`).then(r => r.data),

  activate: (orgId: string, domainId: string) =>
    enterpriseClient.post<OrgDomain>(`/organizations/${orgId}/domains/${domainId}/activate/`).then(r => r.data),

  remove: (orgId: string, domainId: string) =>
    enterpriseClient.delete(`/organizations/${orgId}/domains/${domainId}/`),
};

// ── Branding ──────────────────────────────────────────────────────────────────
export const brandingApi = {
  get: (orgId: string) =>
    enterpriseClient.get<BrandingProfile>(`/organizations/${orgId}/branding/profile/`).then(r => r.data),

  update: (orgId: string, payload: Partial<BrandingProfile>) =>
    enterpriseClient.patch<BrandingProfile>(`/organizations/${orgId}/branding/profile/`, payload).then(r => r.data),

  listAssets: (orgId: string) =>
    enterpriseClient.get<BrandAsset[]>(`/organizations/${orgId}/branding-assets/`).then(r => r.data),

  addAsset: (orgId: string, payload: Partial<BrandAsset>) =>
    enterpriseClient.post<BrandAsset>(`/organizations/${orgId}/branding-assets/`, payload).then(r => r.data),

  removeAsset: (orgId: string, assetId: string) =>
    enterpriseClient.delete(`/organizations/${orgId}/branding-assets/${assetId}/`),
};

// ── Billing ───────────────────────────────────────────────────────────────────
export const enterpriseBillingApi = {
  plans: () =>
    enterpriseClient.get<EnterprisePlan[]>('/plans/').then(r => r.data),

  subscription: (orgId: string) =>
    enterpriseClient.get<Subscription>(`/organizations/${orgId}/billing-subscription/current/`).then(r => r.data),

  changePlan: (orgId: string, planId: string) =>
    enterpriseClient.post<Subscription>(`/organizations/${orgId}/billing-subscription/change-plan/`, { plan_id: planId }).then(r => r.data),

  invoices: (orgId: string) =>
    enterpriseClient.get<EnterpriseInvoice[]>(`/organizations/${orgId}/billing-invoices/`).then(r => r.data),
};

// ── Audit Logs ────────────────────────────────────────────────────────────────
export const auditLogsApi = {
  list: (orgId: string, filters?: {
    actor?: string;
    action?: string;
    target_type?: string;
    since?: string;
    until?: string;
  }) =>
    enterpriseClient.get<AuditLogEntry[]>(`/organizations/${orgId}/audit-logs/`, { params: filters }).then(r => r.data),
};

export default {
  entry: enterpriseEntryApi,
  organization: organizationApi,
  members: membersApi,
  departments: departmentsApi,
  teams: orgTeamsApi,
  groups: orgGroupsApi,
  sendDomains: sendDomainsApi,
  senderIdentities: senderIdentitiesApi,
  emailTemplates: emailTemplatesApi,
  emailLogs: emailLogsApi,
  orgDomains: orgDomainsApi,
  branding: brandingApi,
  billing: enterpriseBillingApi,
  auditLogs: auditLogsApi,
};
