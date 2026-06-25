import axiosClient from "./axiosClient";

const poApi = {
  getAll() {
    return axiosClient.get("/po");
  },
  getById(id) {
    return axiosClient.get(`/po/${id}`);
  },
  create(data) {
    return axiosClient.post("/po", data);
  },
  update(id, data) {
    return axiosClient.put(`/po/${id}`, data);  // ✅ used for edit
  },
  deleteById(id) {
    return axiosClient.delete(`/po/${id}`);  // DELETE /po/:id [web:11][web:33]
  }
};

export default poApi;
