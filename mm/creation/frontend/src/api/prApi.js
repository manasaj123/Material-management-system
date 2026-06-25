import axiosClient from "./axiosClient";

const prApi = {
  getAll() {
    return axiosClient.get("/pr");          // → /api/pr
  },

  getById(id) {
    return axiosClient.get(`/pr/${id}`);    // → /api/pr/:id
  },

  create(data) {
    return axiosClient.post("/pr", data);   // → /api/pr
  },

  update(id, data) {
    return axiosClient.put(`/pr/${id}`, data); // → /api/pr/:id
  },

  deleteById(id) {
    return axiosClient.delete(`/pr/${id}`);    // → /api/pr/:id
  }
};

export default prApi;
