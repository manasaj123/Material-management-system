import axiosClient from './axiosClient';

export const itemApi = {
  getAll: () => axiosClient.get('/item'),
  create: (data) => axiosClient.post('/item', data)
};
