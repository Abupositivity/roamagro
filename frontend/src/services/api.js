import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const googleLogin = (token) => api.post('/auth/google', { token });

export const fetchFarmProjects = () => api.get('/farm-projects');
export const fetchMarketplaceListings = () => api.get('/marketplace/listings');
export const fetchPriceIndex = () => api.get('/price-index');
export const updatePriceIndex = (priceData) => api.post('/price-index', priceData);
export const updateSettings = (settings) => api.put('/user/settings', settings);

export default api;