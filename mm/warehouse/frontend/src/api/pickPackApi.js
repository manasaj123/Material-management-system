import axiosClient from './axiosClient';

export const pickPackApi = {
  getPending: () => axiosClient.get('/pickpack/pending'),
  createPick: (data) => axiosClient.post('/pickpack', data),
  markPacked: (id) => axiosClient.put(`/pickpack/${id}/packed`)
};
