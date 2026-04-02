import apiClient from './apiClient';

export const userService = {
  getAll: (params) => apiClient.get('/users', { params }),
  getSummary: () => apiClient.get('/users/summary'),
  create: (payload) => apiClient.post('/users', payload),
  update: (id, payload) => apiClient.patch(`/users/${id}`, payload),
};
