import apiClient from './apiClient';

/* ───────── Types ───────── */

export type CloudType = 'public' | 'private' | 'hybrid';
export type RegionStatus = 'active' | 'degraded' | 'maintenance' | 'unavailable';
export type ConnectivityType = 'internet' | 'vpn' | 'direct_connect' | 'peering';

export interface AvailabilityZone {
  id: string;
  region: string;
  code: string;
  name: string;
  status: 'available' | 'impaired' | 'unavailable';
  created_at?: string;
  updated_at?: string;
}

export interface CloudRegion {
  id: string;
  code: string;
  name: string;
  country: string;
  city: string;
  continent: string;
  latitude: number | null;
  longitude: number | null;
  status: RegionStatus;
  cloud_type: CloudType;
  cloud_type_display: string;
  connectivity_type: ConnectivityType;
  connectivity_type_display?: string;
  vpn_gateway_ip: string | null;
  tenant_isolation: boolean;
  is_default: boolean;
  uptime_30d_pct: number;
  latency_ms: number | null;
  enabled_services: string[];
  zone_count?: number;
  zones?: AvailabilityZone[];
  available_services?: ServiceCatalogEntry[];
  api_endpoint: string;
  created_at?: string;
}

export interface RegionPeer {
  id: string;
  primary: string;
  secondary: string;
  primary_code: string;
  secondary_code: string;
  mode: 'active-active' | 'active-passive' | 'cold-standby';
  rto_minutes: number;
  rpo_minutes: number;
  is_active: boolean;
  last_tested_at: string | null;
}

export interface ServiceCatalogEntry {
  slug: string;
  name: string;
  description: string;
}

export interface ServiceCatalog {
  public?: ServiceCatalogEntry[];
  private?: ServiceCatalogEntry[];
  hybrid?: ServiceCatalogEntry[];
}

export interface RegionAvailabilitySnapshot {
  code: string;
  name: string;
  status: RegionStatus;
  cloud_type: CloudType;
  connectivity_type: ConnectivityType;
  uptime_30d_pct: number;
  latency_ms: number | null;
  zones_total: number;
  zones_available: number;
  fully_available: boolean;
}

export interface RegionAvailabilityResponse {
  checked_at: string;
  regions: RegionAvailabilitySnapshot[];
}

export interface RegionsByTypeEntry {
  total: number;
  active: number;
  degraded: number;
  unavailable: number;
  regions: Array<{
    code: string;
    name: string;
    status: RegionStatus;
    uptime_30d_pct: number;
    latency_ms: number | null;
    connectivity_type: ConnectivityType;
    enabled_services: string[];
    tenant_isolation: boolean;
  }>;
  catalog: ServiceCatalogEntry[];
}

export interface RegionsByTypeResponse {
  generated_at: string;
  public: RegionsByTypeEntry;
  private: RegionsByTypeEntry;
  hybrid: RegionsByTypeEntry;
}

/* ───────── Regions CRUD ───────── */

export async function listRegions(params?: {
  cloud_type?: CloudType;
  status?: RegionStatus;
  continent?: string;
}): Promise<CloudRegion[]> {
  const res = await apiClient.get<CloudRegion[]>('/api/services/regions/', { params });
  return Array.isArray(res.data) ? res.data : [];
}

export async function getRegion(regionId: string): Promise<CloudRegion> {
  const res = await apiClient.get<CloudRegion>(`/api/services/regions/${regionId}/`);
  return res.data;
}

export async function updateRegionStatus(regionId: string, newStatus: RegionStatus): Promise<CloudRegion> {
  const res = await apiClient.post<CloudRegion>(`/api/services/regions/${regionId}/set_status/`, { status: newStatus });
  return res.data;
}

/* ───────── Availability / Overview ───────── */

export async function getRegionAvailability(): Promise<RegionAvailabilityResponse> {
  const res = await apiClient.get<RegionAvailabilityResponse>('/api/services/regions/availability/');
  return res.data;
}

export async function getRegionsByType(): Promise<RegionsByTypeResponse> {
  const res = await apiClient.get<RegionsByTypeResponse>('/api/services/regions/by_type/');
  return res.data;
}

/* ───────── Service Catalog ───────── */

export async function getServiceCatalog(cloudType?: CloudType): Promise<ServiceCatalog> {
  const params = cloudType ? { type: cloudType } : undefined;
  const res = await apiClient.get<ServiceCatalog>('/api/services/regions/service_catalog/', { params });
  return res.data;
}

export async function getRegionServices(regionId: string): Promise<{
  region: string;
  cloud_type: CloudType;
  enabled_services: string[];
  catalog: ServiceCatalogEntry[];
}> {
  const res = await apiClient.get(`/api/services/regions/${regionId}/services/`);
  return res.data;
}

/* ───────── Region Peers (Failover) ───────── */

export async function listRegionPeers(): Promise<RegionPeer[]> {
  const res = await apiClient.get<RegionPeer[]>('/api/services/regions/peers/');
  return Array.isArray(res.data) ? res.data : [];
}

export async function testFailover(peerId: string): Promise<{ detail: string; last_tested_at: string }> {
  const res = await apiClient.post(`/api/services/regions/peers/${peerId}/test_failover/`);
  return res.data;
}

/* ───────── Availability Zones ───────── */

export async function listZones(regionCode?: string): Promise<AvailabilityZone[]> {
  const params = regionCode ? { region: regionCode } : undefined;
  const res = await apiClient.get<AvailabilityZone[]>('/api/services/regions/zones/', { params });
  return Array.isArray(res.data) ? res.data : [];
}
