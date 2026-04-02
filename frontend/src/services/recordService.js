import apiClient from './apiClient';

export const recordService = {
  getAll: (params) => apiClient.get('/records', { params }),
  getMeta: () => apiClient.get('/records/meta'),
  create: (payload) => apiClient.post('/records', payload),
  update: (id, payload) => apiClient.patch(`/records/${id}`, payload),
  delete: (id) => apiClient.delete(`/records/${id}`),
};
