import client from './client.js';

export const chatApi = {
  send: (data) => client.post('/api/chat', data).then((r) => r.data),
  streamUrl: (params) => `/api/chat/stream?${new URLSearchParams(params)}`,
};

export const conversationApi = {
  list: (params) => client.get('/api/conversations', { params }).then((r) => r.data),
  get: (id) => client.get(`/api/conversations/${id}`).then((r) => r.data),
  update: (id, data) => client.patch(`/api/conversations/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/api/conversations/${id}`).then((r) => r.data),
};

export const metricsApi = {
  summary: (range) => client.get('/api/metrics/summary', { params: { range } }).then((r) => r.data),
  latency: (range) => client.get('/api/metrics/latency', { params: { range } }).then((r) => r.data),
  throughput: (range) => client.get('/api/metrics/throughput', { params: { range } }).then((r) => r.data),
  errors: (range) => client.get('/api/metrics/errors', { params: { range } }).then((r) => r.data),
  providers: () => client.get('/api/metrics/providers').then((r) => r.data),
};
