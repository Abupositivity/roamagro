import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (credentials) => {
  return api.post('/auth/login', credentials);
};

export const fetchFarmProjects = async () => {
  return api.get('/farm-projects');
};

export const fetchMarketplaceListings = async () => {
  return api.get('/marketplace/listings');
};

export const fetchPriceIndex = async () => {
  return api.get('/price-index');
};

export const updateSettings = async (settings) => {
  return api.put('/user/settings', settings);
};

export default api;
