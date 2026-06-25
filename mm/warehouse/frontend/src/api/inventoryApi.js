import axiosClient from './axiosClient';

export const inventoryApi = {
  getFIFO: (itemId) => axiosClient.get(`/inventory/fifo/${itemId}`),
  getAll: () => axiosClient.get('/inventory')
};
