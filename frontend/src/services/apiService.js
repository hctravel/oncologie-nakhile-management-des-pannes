import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/current-user'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

export const userService = {
  getAll: (page, limit) => api.get(`/users?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const machineService = {
  getAll: (page, limit) => api.get(`/machines?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/machines/${id}`),
  create: (data) => api.post('/machines', data),
  update: (id, data) => api.put(`/machines/${id}`, data),
  delete: (id) => api.delete(`/machines/${id}`),
};

export const panneService = {
  getAll: (page, limit, filters) => {
    let url = `/pannes?page=${page}&limit=${limit}`;
    if (filters?.serialNumber) url += `&serialNumber=${filters.serialNumber}`;
    if (filters?.panneId) url += `&panneId=${filters.panneId}`;
    if (filters?.startDate) url += `&startDate=${filters.startDate}`;
    if (filters?.endDate) url += `&endDate=${filters.endDate}`;
    return api.get(url);
  },
  getById: (id) => api.get(`/pannes/${id}`),
  create: (data) => api.post('/pannes', data),
  update: (id, data) => api.put(`/pannes/${id}`, data),
  delete: (id) => api.delete(`/pannes/${id}`),
  resolve: (id, data) => api.post(`/pannes/${id}/resolve`, data),
  getTechnicians: () => api.get('/pannes/technicians/list'),
};

export const maintenanceService = {
  getAll: (page, limit) => api.get(`/maintenance?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
  getTechnicians: () => api.get('/maintenance/technicians/list'),
};

export const machineUsageService = {
  getAll: (page, limit, filters) => {
    let url = `/machine-usage?page=${page}&limit=${limit}`;
    if (filters?.machineId) url += `&machineId=${filters.machineId}`;
    if (filters?.startDate) url += `&startDate=${filters.startDate}`;
    if (filters?.endDate) url += `&endDate=${filters.endDate}`;
    return api.get(url);
  },
  getById: (id) => api.get(`/machine-usage/${id}`),
  create: (data) => api.post('/machine-usage', data),
  update: (id, data) => api.put(`/machine-usage/${id}`, data),
  delete: (id) => api.delete(`/machine-usage/${id}`),
  getTotalAmount: (filters) => api.get('/machine-usage/total-amount', { params: filters }),
};

export const reportService = {
  getSummary: () => api.get('/reports/summary'),
  getMachineReport: (filters) => api.get('/reports/machines', { params: filters }),
  getPanneReport: (filters) => api.get('/reports/pannes', { params: filters }),
  getMaintenanceReport: (filters) => api.get('/reports/maintenance', { params: filters }),
  getUsageReport: (filters) => api.get('/reports/usage', { params: filters }),
};
