import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || '/api';
const API  = axios.create({ baseURL: BASE });

export const sendChatMessage = (messages, top_k = 6) =>
  API.post('/chat/message', { messages, top_k }).then((r) => r.data);

export const searchProducts = (query, top_k = 6) =>
  API.post('/recommendations/search', { query, top_k }).then((r) => r.data);

export const getAnalyticsSummary = () =>
  API.get('/analytics/summary').then((r) => r.data);

export const getProducts = (page = 1, page_size = 20, search = '') =>
  API.get('/analytics/products', { params: { page, page_size, search } }).then((r) => r.data);
