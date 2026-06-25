import axiosClient from "./axiosClient";

const stockApi = {
  getSummary() {
    return axiosClient.get("/stock/summary");
  }
};

export default stockApi;
