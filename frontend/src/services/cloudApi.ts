// AtonixCorp Cloud – API service for onboarding dashboard

import axios from 'axios';
import { config } from '../config/environment';
import type {
  ManagedDatabase, CreateDatabasePayload, ScaleDatabasePayload,
  DBEngineCatalogue, MigratePayload, DBMigrationResult,
} from '../types/database';
import type {
  ContainerRepository, CreateRepositoryPayload, CreateTokenPayload,
  ReplicatePayload, RegistryToken, ScanResult,
} from '../types/registry';
import type {
  StorageBucket, CreateBucketPayload, S3Object,
  StorageVolume, LifecycleRule,
  StorageClassInfo, StorageRegion, PresignedUrlResult, SwiftSyncResult,
} from '../types/storage';
import type {
  Domain, DnsRecord, SslCertificate, TldInfo,
  RegisterDomainPayload, TransferDomainPayload, CreateDnsRecordPayload,
  AvailabilityResult,
} from '../types/domain';
import type {
  EmailDomain, Mailbox, EmailAlias, DkimKey,
  MailClientSettings, EmailActivityLog,
  CreateMailboxPayload, UpdateMailboxPayload, CreateAliasPayload,
} from '../types/email';
import type {
  Campaign, ContactList, Contact, EmailTemplate, Automation,
  AccountStats, CreateCampaignPayload, CreateContactListPayload,
  CreateContactPayload, CreateTemplatePayload, CreateAutomationPayload,
} from '../types/marketing';
import type {
  MonitoringOverview, MetricSeries, MetricName,
  AlertRule, CreateAlertRulePayload,
  Alert, Incident, CreateIncidentPayload, LogStream,
} from '../types/monitoring';
import type {
  BillingOverview, BillingAccount, UpdateBillingAccountPayload,
  PaymentMethod, AddPaymentMethodPayload,
  Invoice, CurrentUsage, CreditNote,
} from '../types/billing';
import {
  OnboardingProgress,
  DashboardStats,
  WizardOptions,
  CreateServerPayload,
  VMInstance,
  CreateVMPayload,
} from '../types/cloud';

// Cloud API client – routes under /api/services/*
const cloudClient = axios.create({
  baseURL: config.API_BASE_URL + '/services',
  timeout: config.API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token on every request
cloudClient.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('authToken');
  if (token) cfg.headers.Authorization = `Token ${token}`;
  return cfg;
});

// On 401 redirect to home
cloudClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ---- Onboarding checklist ----
export const onboardingApi = {
  getChecklist: () =>
    cloudClient.get<OnboardingProgress>('/onboarding/checklist/'),

  updateChecklist: (updates: Partial<OnboardingProgress>) =>
    cloudClient.patch<OnboardingProgress>('/onboarding/checklist/update/', updates),
};

// ---- Dashboard stats ----
export const dashboardApi = {
  getStats: () =>
    cloudClient.get<DashboardStats>('/onboarding/stats/'),

  getWizardOptions: () =>
    cloudClient.get<WizardOptions>('/onboarding/wizard-options/'),
};

// ---- Server management ----
export const serversApi = {
  list: () => cloudClient.get('/instances/'),
  create: (payload: CreateServerPayload) => cloudClient.post('/instances/', payload),
  get: (id: string) => cloudClient.get(`/instances/${id}/`),
  delete: (id: string) => cloudClient.delete(`/instances/${id}/`),
};

// ---- Block Volumes ----
export const volumesApi = {
  list:   ()           => cloudClient.get<StorageVolume[]>('/volumes/'),
  create: (p: object) => cloudClient.post<StorageVolume>('/volumes/', p),
  delete: (id: string)=> cloudClient.delete(`/volumes/${id}/`),
};

// ---- Cloud Object Storage (Swift / S3-compatible) ----
export const storageApi = {
  // Buckets
  list:     ()                              => cloudClient.get<StorageBucket[]>('/buckets/'),
  get:      (id: string)                    => cloudClient.get<StorageBucket>(`/buckets/${id}/`),
  create:   (p: CreateBucketPayload)        => cloudClient.post<StorageBucket>('/buckets/', p),
  update:   (id: string, p: Partial<CreateBucketPayload>) =>
                                               cloudClient.patch<StorageBucket>(`/buckets/${id}/`, p),
  delete:   (id: string)                    => cloudClient.delete(`/buckets/${id}/`),
  // Objects
  objects:  (id: string)                    => cloudClient.get<S3Object[]>(`/buckets/${id}/objects/`),
  statistics:(id: string)                   => cloudClient.get(`/buckets/${id}/statistics/`),
  // Versioning / logging
  enableVersioning: (id: string)            => cloudClient.post(`/buckets/${id}/enable_versioning/`),
  enableLogging: (id: string, target: string) =>
                                               cloudClient.post(`/buckets/${id}/enable_logging/`, { log_target_bucket: target }),
  // Lifecycle
  getLifecycle:  (id: string)               => cloudClient.get<{ rules: LifecycleRule[] }>(`/buckets/${id}/lifecycle/`),
  setLifecycle:  (id: string, rules: LifecycleRule[]) =>
                                               cloudClient.post(`/buckets/${id}/lifecycle/`, { rules }),
  // Swift
  swiftSync:     (id: string)               => cloudClient.post<SwiftSyncResult>(`/buckets/${id}/swift_sync/`),
  presignedUrl:  (id: string, key: string, expires = 3600, method = 'GET') =>
                                               cloudClient.post<PresignedUrlResult>(`/buckets/${id}/generate_presigned_url/`, {
                                                 object_key: key, expires_in: expires, method,
                                               }),
  replicate:     (id: string, target_region: string) =>
                                               cloudClient.post(`/buckets/${id}/replicate/`, { target_region }),
  // Object upload
  uploadObject:  (id: string, form: FormData) =>
                                               cloudClient.post(`/buckets/${id}/upload_object/`, form, {
                                                 headers: { 'Content-Type': 'multipart/form-data' },
                                               }),
  // Catalogues
  storageClasses: ()                        => cloudClient.get<StorageClassInfo[]>('/buckets/storage_classes/'),
  regions:       ()                         => cloudClient.get<StorageRegion[]>('/buckets/regions/'),
};

// ---- Networking ----
export const networksApi = {
  list: () => cloudClient.get('/vpcs/'),
};

// ---- Managed Databases ----
export const databaseApi = {
  // CRUD
  list:    ()                         => cloudClient.get<ManagedDatabase[]>('/databases/'),
  get:     (id: string)               => cloudClient.get<ManagedDatabase>(`/databases/${id}/`),
  create:  (p: CreateDatabasePayload) => cloudClient.post<ManagedDatabase>('/databases/', p),
  delete:  (id: string)               => cloudClient.delete(`/databases/${id}/`),
  // Lifecycle actions
  scale:   (id: string, p: ScaleDatabasePayload) => cloudClient.post<ManagedDatabase>(`/databases/${id}/scale/`, p),
  restart: (id: string)               => cloudClient.post(`/databases/${id}/restart/`),
  // Credentials
  credentials: (id: string)           => cloudClient.get(`/databases/${id}/credentials/`),
  rotate:  (id: string, username?: string) => cloudClient.post(`/databases/${id}/rotate/`, { username }),
  // Backups
  backups: (id: string)               => cloudClient.get(`/databases/${id}/backups/`),
  backup:  (id: string, type = 'manual') => cloudClient.post(`/databases/${id}/backup/`, { backup_type: type }),
  restore: (id: string, backup_id: string) => cloudClient.post(`/databases/${id}/restore/`, { backup_id }),
  // Metrics
  metrics: (id: string)               => cloudClient.get(`/databases/${id}/metrics/`),
  // Migration
  migrate: (id: string, p: MigratePayload) => cloudClient.post<DBMigrationResult>(`/databases/${id}/migrate/`, p),
  // Catalogue
  engines: ()                         => cloudClient.get<DBEngineCatalogue[]>('/databases/engines/'),
  regions: ()                         => cloudClient.get('/databases/regions/'),
};

// ---- OpenStack VM management (/cloud/*) ----
export const vmApi = {
  list:         ()              => cloudClient.get<VMInstance[]>('/cloud/servers/'),
  create:       (p: CreateVMPayload) => cloudClient.post<VMInstance>('/cloud/servers/', p),
  get:          (id: string)   => cloudClient.get<VMInstance>(`/cloud/servers/${id}/`),
  delete:       (id: string)   => cloudClient.delete(`/cloud/servers/${id}/`),
  start:        (id: string)   => cloudClient.post(`/cloud/servers/${id}/start/`),
  stop:         (id: string)   => cloudClient.post(`/cloud/servers/${id}/stop/`),
  reboot:       (id: string)   => cloudClient.post(`/cloud/servers/${id}/reboot/`),
  listFlavors:  ()             => cloudClient.get('/cloud/flavors/'),
  listImages:   ()             => cloudClient.get('/cloud/images/'),
  listNetworks: ()             => cloudClient.get('/cloud/networks/'),
  cloudStatus:  ()             => cloudClient.get('/cloud/status/'),
};

// ---- Container Registry ----
export const registryApi = {
  // Repositories
  list:         ()                              => cloudClient.get<ContainerRepository[]>('/registries/'),
  get:          (id: string)                    => cloudClient.get<ContainerRepository>(`/registries/${id}/`),
  create:       (p: CreateRepositoryPayload)    => cloudClient.post<ContainerRepository>('/registries/', p),
  delete:       (id: string)                    => cloudClient.delete(`/registries/${id}/`),
  // Images
  images:       (id: string)                    => cloudClient.get(`/registries/${id}/images/`),
  deleteTag:    (id: string, tag: string)       => cloudClient.post(`/registries/${id}/delete_tag/`, { tag }),
  // Tokens (repo-scoped)
  tokens:       (id: string)                    => cloudClient.get<RegistryToken[]>(`/registries/${id}/tokens/`),
  createToken:  (id: string, p: CreateTokenPayload) => cloudClient.post<RegistryToken>(`/registries/${id}/create_token/`, p),
  revokeToken:  (id: string, token_id: string)  => cloudClient.post(`/registries/${id}/revoke_token/`, { token_id }),
  // Global tokens
  myTokens:           ()                        => cloudClient.get<RegistryToken[]>('/registries/my_tokens/'),
  createGlobalToken:  (p: CreateTokenPayload)   => cloudClient.post<RegistryToken>('/registries/create_global_token/', p),
  revokeGlobalToken:  (token_id: string)        => cloudClient.post('/registries/revoke_global_token/', { token_id }),
  // Replication
  replication:  (id: string)                    => cloudClient.get(`/registries/${id}/replication/`),
  replicate:    (id: string, p: ReplicatePayload) => cloudClient.post(`/registries/${id}/replicate/`, p),
  // Usage & scan
  usage:        (id: string)                    => cloudClient.get(`/registries/${id}/usage/`),
  scan:         (id: string, tag: string)       => cloudClient.post<ScanResult>(`/registries/${id}/scan/`, { tag }),
  // Catalogue
  regions:      ()                              => cloudClient.get('/registries/regions/'),
};

// ---- Domains ----
export const domainApi = {
  // CRUD
  list:              ()                                           => cloudClient.get<Domain[]>('/domains/'),
  get:               (id: string)                                 => cloudClient.get<Domain>(`/domains/${id}/`),
  delete:            (id: string)                                 => cloudClient.delete(`/domains/${id}/`),
  // Search & catalogue
  checkAvailability: (name: string, tlds?: string[])              => cloudClient.post<AvailabilityResult>('/domains/check_availability/', { domain_name: name, tlds }),
  tldCatalogue:      ()                                           => cloudClient.get<TldInfo[]>('/domains/tld_catalogue/'),
  // Registration & transfer
  register:          (p: RegisterDomainPayload)                   => cloudClient.post<Domain>('/domains/register/', p),
  transfer:          (p: TransferDomainPayload)                   => cloudClient.post<Domain>('/domains/transfer/', p),
  // Renewal
  renew:             (id: string, years: number)                  => cloudClient.post(`/domains/${id}/renew/`, { years }),
  // DNS
  dnsZone:           (id: string)                                 => cloudClient.get(`/domains/${id}/dns_zone/`),
  dnsRecords:        (id: string)                                 => cloudClient.get<DnsRecord[]>(`/domains/${id}/dns_records/`),
  addDnsRecord:      (id: string, p: CreateDnsRecordPayload)      => cloudClient.post<DnsRecord>(`/domains/${id}/add_dns_record/`, p),
  deleteDnsRecord:   (id: string, recordset_id: string)           => cloudClient.post(`/domains/${id}/delete_dns_record/`, { recordset_id }),
  // SSL
  sslCerts:          (id: string)                                 => cloudClient.get<SslCertificate[]>(`/domains/${id}/ssl_certs/`),
  requestSsl:        (id: string)                                 => cloudClient.post(`/domains/${id}/request_ssl/`),
  // Settings
  updateNameservers: (id: string, nameservers: string[])          => cloudClient.post(`/domains/${id}/update_nameservers/`, { nameservers }),
  setPrivacy:        (id: string, enable: boolean)                => cloudClient.post(`/domains/${id}/set_privacy/`, { enable }),
  enableDnssec:      (id: string)                                 => cloudClient.post(`/domains/${id}/enable_dnssec/`),
};

// ---- Email Marketing ----
export const marketingApi = {
  // Campaigns
  listCampaigns:      ()                                          => cloudClient.get<Campaign[]>('/campaigns/'),
  getCampaign:        (id: string)                               => cloudClient.get<Campaign>(`/campaigns/${id}/`),
  createCampaign:     (p: CreateCampaignPayload)                 => cloudClient.post<Campaign>('/campaigns/', p),
  updateCampaign:     (id: string, p: Partial<CreateCampaignPayload>) => cloudClient.patch<Campaign>(`/campaigns/${id}/`, p),
  deleteCampaign:     (id: string)                               => cloudClient.delete(`/campaigns/${id}/`),
  sendCampaign:       (id: string)                               => cloudClient.post(`/campaigns/${id}/send/`),
  sendTest:           (id: string, email: string)                => cloudClient.post(`/campaigns/${id}/send_test/`, { email }),
  scheduleCampaign:   (id: string, at: string)                   => cloudClient.post(`/campaigns/${id}/schedule/`, { scheduled_at: at }),
  cancelCampaign:     (id: string)                               => cloudClient.post(`/campaigns/${id}/cancel/`),
  duplicateCampaign:  (id: string)                               => cloudClient.post<Campaign>(`/campaigns/${id}/duplicate/`),
  campaignAnalytics:  (id: string)                               => cloudClient.get(`/campaigns/${id}/analytics/`),
  accountStats:       ()                                          => cloudClient.get<AccountStats>('/campaigns/account_stats/'),

  // Contact Lists
  listContactLists:   ()                                          => cloudClient.get<ContactList[]>('/contact-lists/'),
  createContactList:  (p: CreateContactListPayload)               => cloudClient.post<ContactList>('/contact-lists/', p),
  deleteContactList:  (id: string)                               => cloudClient.delete(`/contact-lists/${id}/`),
  importContacts:     (id: string, csv: string)                  => cloudClient.post(`/contact-lists/${id}/import_csv/`, { csv }),
  exportContactsUrl:  (id: string)                               => `/contact-lists/${id}/export_csv/`,

  // Contacts
  listContacts:       (listId: string)                           => cloudClient.get<Contact[]>(`/contacts/?list=${listId}`),
  createContact:      (p: CreateContactPayload)                  => cloudClient.post<Contact>('/contacts/', p),
  deleteContact:      (id: number)                               => cloudClient.delete(`/contacts/${id}/`),
  unsubscribeContact: (id: number)                               => cloudClient.post(`/contacts/${id}/unsubscribe/`),

  // Templates
  listTemplates:      ()                                          => cloudClient.get<EmailTemplate[]>('/email-templates/'),
  createTemplate:     (p: CreateTemplatePayload)                 => cloudClient.post<EmailTemplate>('/email-templates/', p),
  updateTemplate:     (id: string, p: Partial<CreateTemplatePayload>) => cloudClient.patch<EmailTemplate>(`/email-templates/${id}/`, p),
  deleteTemplate:     (id: string)                               => cloudClient.delete(`/email-templates/${id}/`),
  duplicateTemplate:  (id: string)                               => cloudClient.post<EmailTemplate>(`/email-templates/${id}/duplicate/`),

  // Automations
  listAutomations:    ()                                          => cloudClient.get<Automation[]>('/automations/'),
  createAutomation:   (p: CreateAutomationPayload)               => cloudClient.post<Automation>('/automations/', p),
  deleteAutomation:   (id: string)                               => cloudClient.delete(`/automations/${id}/`),
  activateAutomation: (id: string)                               => cloudClient.post(`/automations/${id}/activate/`),
  deactivateAutomation: (id: string)                             => cloudClient.post(`/automations/${id}/deactivate/`),
};

// ---- Email Service ----
export const emailApi = {
  // Email domains
  emailDomains:     ()                                           => cloudClient.get<EmailDomain[]>('/email-domains/'),
  getEmailDomain:   (id: number)                                 => cloudClient.get<EmailDomain>(`/email-domains/${id}/`),
  enableEmail:      (domain_resource_id: string)                 => cloudClient.post<EmailDomain>('/email-domains/', { domain_resource_id }),
  provisionDns:     (id: number)                                 => cloudClient.post<EmailDomain>(`/email-domains/${id}/provision_dns/`),
  generateDkim:     (id: number, selector?: string)              => cloudClient.post<DkimKey>(`/email-domains/${id}/generate_dkim/`, { selector }),
  clientSettings:   (id: number)                                 => cloudClient.get<MailClientSettings>(`/email-domains/${id}/client_settings/`),
  emailActivity:    (id: number)                                 => cloudClient.get<EmailActivityLog[]>(`/email-domains/${id}/activity/`),
  // Mailboxes
  listMailboxes:    ()                                           => cloudClient.get<Mailbox[]>('/mailboxes/'),
  getMailbox:       (id: string)                                 => cloudClient.get<Mailbox>(`/mailboxes/${id}/`),
  createMailbox:    (p: CreateMailboxPayload)                    => cloudClient.post<Mailbox>('/mailboxes/', p),
  updateMailbox:    (id: string, p: UpdateMailboxPayload)        => cloudClient.patch<Mailbox>(`/mailboxes/${id}/`, p),
  deleteMailbox:    (id: string)                                 => cloudClient.delete(`/mailboxes/${id}/`),
  changePassword:   (id: string, new_password: string)          => cloudClient.post(`/mailboxes/${id}/change_password/`, { new_password }),
  suspendMailbox:   (id: string)                                 => cloudClient.post(`/mailboxes/${id}/suspend/`),
  activateMailbox:  (id: string)                                 => cloudClient.post(`/mailboxes/${id}/activate/`),
  mailboxUsage:     (id: string)                                 => cloudClient.get(`/mailboxes/${id}/usage/`),
  generatePassword: (length?: number)                            => cloudClient.post<{ password: string }>('/mailboxes/generate_password/', { length }),
  // Aliases
  listAliases:      ()                                           => cloudClient.get<EmailAlias[]>('/email-aliases/'),
  createAlias:      (p: CreateAliasPayload)                      => cloudClient.post<EmailAlias>('/email-aliases/', p),
  deleteAlias:      (id: number)                                 => cloudClient.delete(`/email-aliases/${id}/`),
};

// ---- Monitoring & Incidents ----
export const monitoringApi = {
  // Overview
  overview:          ()                                          => cloudClient.get<MonitoringOverview>('/monitoring/overview/'),

  // Metrics
  metricSeries:      (resource: string, metric: MetricName, hours?: number) =>
    cloudClient.get<MetricSeries>(`/metrics/?resource=${resource}&metric=${metric}&hours=${hours ?? 24}`),
  availableMetrics:  ()                                          => cloudClient.get('/metrics/available/'),
  ingestMetric:      (p: { resource_id: string; service: string; metric: string; value: number; unit?: string }) =>
    cloudClient.post('/metrics/ingest/', p),

  // Alert Rules
  listAlertRules:    ()                                          => cloudClient.get<AlertRule[]>('/alert-rules/'),
  createAlertRule:   (p: CreateAlertRulePayload)                 => cloudClient.post<AlertRule>('/alert-rules/', p),
  updateAlertRule:   (id: string, p: Partial<CreateAlertRulePayload>) => cloudClient.patch<AlertRule>(`/alert-rules/${id}/`, p),
  deleteAlertRule:   (id: string)                               => cloudClient.delete(`/alert-rules/${id}/`),
  enableAlertRule:   (id: string)                               => cloudClient.post(`/alert-rules/${id}/enable/`),
  disableAlertRule:  (id: string)                               => cloudClient.post(`/alert-rules/${id}/disable/`),

  // Fired Alerts
  listAlerts:        (state?: string)                           => cloudClient.get<Alert[]>(`/alerts/${state ? `?state=${state}` : ''}`),
  resolveAlert:      (id: number)                               => cloudClient.post(`/alerts/${id}/resolve/`),
  silenceAlert:      (id: number)                               => cloudClient.post(`/alerts/${id}/silence/`),

  // Incidents
  listIncidents:     (filters?: { service?: string; status?: string }) =>
    cloudClient.get<Incident[]>(`/incidents/${filters?.service ? `?service=${filters.service}` : filters?.status ? `?status=${filters.status}` : ''}`),
  getIncident:       (id: string)                               => cloudClient.get<Incident>(`/incidents/${id}/`),
  createIncident:    (p: CreateIncidentPayload)                  => cloudClient.post<Incident>('/incidents/', p),
  updateIncidentStatus: (id: string, status: string, message: string) =>
    cloudClient.post(`/incidents/${id}/update_status/`, { status, message }),
  assignIncident:    (id: string, user_id: number)              => cloudClient.post(`/incidents/${id}/assign/`, { user_id }),

  // Logs
  logs:              (filters?: { service?: string; search?: string; hours?: number; limit?: number }) => {
    const p = new URLSearchParams();
    if (filters?.service) p.set('service', filters.service);
    if (filters?.search)  p.set('search',  filters.search);
    if (filters?.hours)   p.set('hours',   String(filters.hours));
    if (filters?.limit)   p.set('limit',   String(filters.limit));
    return cloudClient.get<LogStream>(`/logs/?${p.toString()}`);
  },
};

// ---- Billing ----
export const billingApi = {
  // Overview
  overview:             ()                              => cloudClient.get<BillingOverview>('/billing/overview/'),

  // Account
  getAccount:           ()                              => cloudClient.get<BillingAccount>('/billing/account/'),
  updateAccount:        (p: UpdateBillingAccountPayload) => cloudClient.patch<BillingAccount>('/billing/account/', p),
  changePlan:           (plan: string)                  => cloudClient.post<{ old_plan: string; new_plan: string; new_price: number; message: string }>('/billing/account/change-plan/', { plan }),

  // Payment Methods
  listPaymentMethods:   ()                              => cloudClient.get<PaymentMethod[]>('/billing/payment-methods/'),
  addPaymentMethod:     (p: AddPaymentMethodPayload)    => cloudClient.post<PaymentMethod>('/billing/payment-methods/', p),
  deletePaymentMethod:  (id: number)                   => cloudClient.delete(`/billing/payment-methods/${id}/`),
  setDefaultPaymentMethod: (id: number)                => cloudClient.post(`/billing/payment-methods/${id}/set-default/`),

  // Invoices
  listInvoices:         ()                              => cloudClient.get<Invoice[]>('/billing/invoices/'),
  getInvoice:           (id: number)                   => cloudClient.get<Invoice>(`/billing/invoices/${id}/`),
  payInvoice:           (id: number)                   => cloudClient.post<Invoice>(`/billing/invoices/${id}/pay/`),

  // Usage
  currentUsage:         ()                              => cloudClient.get<CurrentUsage>('/billing/usage/'),

  // Credits
  listCredits:          ()                              => cloudClient.get<CreditNote[]>('/billing/credits/'),
};
