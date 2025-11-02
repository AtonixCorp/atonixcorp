import apiClient from './apiClient';

export const groupsApi = {
  async list(enterpriseId: string) {
    try {
      const res = await apiClient.get(`/api/enterprises/${enterpriseId}/groups`);
      return res.data;
    } catch (err) {
      const raw = localStorage.getItem(`groups_${enterpriseId}`) || '[]';
      return JSON.parse(raw);
    }
  },
  async create(enterpriseId: string, payload: any) {
    try {
      const res = await apiClient.post(`/api/enterprises/${enterpriseId}/groups`, payload);
      return res.data;
    } catch (err) {
      const raw = localStorage.getItem(`groups_${enterpriseId}`) || '[]';
      const arr = JSON.parse(raw);
      const item = { id: Date.now(), ...payload };
      arr.push(item);
      localStorage.setItem(`groups_${enterpriseId}`, JSON.stringify(arr));
      return item;
    }
  }
};

export default groupsApi;
