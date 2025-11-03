import apiClient from './apiClient';

export const __enterpriseApi = {
  async getEnterprise(id: string) {
    try {
      const res = await apiClient.get(`/api/enterprises/${id}`);
      return res.data;
    } catch (err) {
      // fallback to localStorage
      const raw = localStorage.getItem('enterprise_' + id);
      return raw ? JSON.parse(raw) : null;
    }
  },
  async createEnterprise(payload: any) {
    try {
      const res = await apiClient.post(`/api/enterprises/`, payload);
      return res.data;
    } catch (err) {
      const id = Date.now().toString();
      const record = { id, ...payload, createdAt: new Date().toISOString() };
      localStorage.setItem('enterprise_' + id, JSON.stringify(record));
      return record;
    }
  }
};

export default __enterpriseApi;
