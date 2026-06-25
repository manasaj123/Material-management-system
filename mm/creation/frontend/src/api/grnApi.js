import axiosClient from "./axiosClient";

const grnApi = {
  getAll() {
    return axiosClient.get("/grn");            // GET /api/grn
  },
  getById(id) {
    return axiosClient.get(`/grn/${id}`);      // GET /api/grn/:id
  },
  create(data) {
    return axiosClient.post("/grn", data);     // POST /api/grn
  },
  update(id, data) {
    return axiosClient.put(`/grn/${id}`, data);
  },
  deleteById(id) {
    return axiosClient.delete(`/grn/${id}`);
  }
};

export default grnApi;
