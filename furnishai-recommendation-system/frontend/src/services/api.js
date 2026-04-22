import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL;

const API = axios.create({
  baseURL: BASE,
});

export const sendChatMessage = (messages, top_k = 6) =>
  API.post('/api/chat/message', { messages, top_k }).then((r) => r.data);

export const searchProducts = (query, top_k = 6) =>
  API.post('/api/recommendations/search', { query, top_k }).then((r) => r.data);

export const getAnalyticsSummary = () =>
  API.get('/api/analytics/summary').then((r) => r.data);

export const getProducts = (page = 1, page_size = 20, search = '') =>
  API.get('/api/analytics/products', {
    params: { page, page_size, search },
  }).then((r) => r.data);