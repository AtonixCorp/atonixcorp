import axios from 'axios';

const _api = axios.create({ baseURL: '/api' });

export const _quantumService = {
  submit: async (circuit: string, shots = 1024, backend = 'simulator') => {
    const resp = await _api.post('/quantum/submit/', { circuit, shots, backend });
    return resp.data;
  },
  status: async (jobId: string) => {
    const resp = await _api.get(`/quantum/status/${jobId}/`);
    return resp.data;
  }
};

export default _quantumService;
