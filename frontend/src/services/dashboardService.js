import apiClient from './apiClient';

export const dashboardService = {
  getSummary: (params) => apiClient.get('/dashboard/summary', { params }),
  getCategory: (params) => apiClient.get('/dashboard/category', { params }),
  getMonthly: (params) => apiClient.get('/dashboard/monthly', { params }),
  getRecent: (params) => apiClient.get('/dashboard/recent', { params }),
};
