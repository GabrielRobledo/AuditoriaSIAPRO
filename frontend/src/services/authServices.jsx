import axios from 'axios';

export const register = (formData) => {
  return axios.post('http://localhost:3000/api/auth/register', formData)
    .then(res => res.data); 
};

export const login = (data) => {
  return axios.post('http://localhost:3000/api/auth/login', data)
  .then(res => res.data);
};