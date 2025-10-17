import apiClient from './apiClient';

function generateMockMetrics(days = 30) {
  const now = new Date();
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push({ date: d.toISOString().slice(0,10), score: Math.round(50 + 30 * Math.sin(i / 4) + (Math.random()*20 - 10)) });
  }
  return out;
}

export const analyticsApi = {
  async fetchModelScores(enterpriseId: string, params: any = {}) {
    try {
      const res = await apiClient.get(`/api/enterprises/${enterpriseId}/analytics/scores`, { params });
      return res.data;
    } catch (err) {
      // fallback mock
      return generateMockMetrics(60);
    }
  }
};

export default analyticsApi;
