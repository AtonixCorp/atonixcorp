export interface EnterpriseRecord {
  id: string;
  companyName: string;
  companyUrl?: string;
  country?: string;
  companyEmail?: string;
  directorName?: string;
  createdAt: string;
}

const _STORAGE_KEY = 'atonix_enterprises_v1';

function readAll(): EnterpriseRecord[] {
  try {
    const raw = localStorage.getItem(_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EnterpriseRecord[];
  } catch {
    return [];
  }
}

function writeAll(records: EnterpriseRecord[]) {
  localStorage.setItem(_STORAGE_KEY, JSON.stringify(records));
}

export function createEnterprise(payload: Omit<EnterpriseRecord, 'id' | 'createdAt'>) {
  const records = readAll();
  const id = `ent_${Date.now()}`;
  const record: EnterpriseRecord = { ...payload, id, createdAt: new Date().toISOString() } as EnterpriseRecord;
  records.push(record);
  writeAll(records);
  return record;
}

export function getEnterprise(id: string): EnterpriseRecord | undefined {
  return readAll().find(r => r.id === id);
}

export function listEnterprises(): EnterpriseRecord[] {
  return readAll();
}

const enterpriseAPI = { createEnterprise, getEnterprise, listEnterprises };

export default enterpriseAPI;
