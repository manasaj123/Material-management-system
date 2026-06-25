import axiosClient from "./axiosClient";

const materialApi = {
  getAll() {
    return axiosClient.get("/materials");
  },
  create(data) {
    return axiosClient.post("/materials", data);
  },
  update(id, data) {
    return axiosClient.put(`/materials/${id}`, data);
  },
  remove(id) {
    return axiosClient.delete(`/materials/${id}`);
  }
};

export default materialApi;
