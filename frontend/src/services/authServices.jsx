import axios from 'axios';
import API_URL from '../config';

export const register = (formData) => {
  return axios.post(`${API_URL}/api/auth/register`, formData)
    .then(res => res.data); 
};

export const login = (data) => {
  return axios.post(`${API_URL}/api/auth/login`, data)
  .then(res => res.data);
};