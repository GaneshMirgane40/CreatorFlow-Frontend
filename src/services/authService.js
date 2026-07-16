import instance from '@/api/axios';

export const login = (credentials) => instance.post('/auth/login', credentials).then(response => response.data);

export const register = (userData) => instance.post('/auth/register', userData).then(response => response.data);
