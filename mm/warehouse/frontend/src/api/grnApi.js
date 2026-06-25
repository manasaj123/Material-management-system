import axiosClient from './axiosClient';

export const grnApi = {
  createGrn: (data) => axiosClient.post("/grn", data),
  getPending: () => axiosClient.get("/grn/pending")
};