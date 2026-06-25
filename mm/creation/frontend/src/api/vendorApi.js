import axiosClient from "./axiosClient";

const vendorApi = {
  getAll() {
    return axiosClient.get("/vendors");
  },
  create(data) {
    return axiosClient.post("/vendors", data);
  },
  update(id, data) {
    return axiosClient.put(`/vendors/${id}`, data);
  },
  remove(id) {
    return axiosClient.delete(`/vendors/${id}`);
  }
};

export default vendorApi;
