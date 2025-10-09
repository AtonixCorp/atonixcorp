import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const quantumService = {
  submit: async (circuit: string, shots = 1024, backend = 'simulator') => {
    const resp = await api.post('/quantum/submit/', { circuit, shots, backend });
    return resp.data;
  },
  status: async (jobId: string) => {
    const resp = await api.get(`/quantum/status/${jobId}/`);
    return resp.data;
  }
};

export default quantumService;
