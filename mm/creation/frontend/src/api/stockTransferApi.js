import axiosClient from "./axiosClient";

const stockTransferApi = {
  create(data) {
    return axiosClient.post("/stock-transfer", data);
  }
};

export default stockTransferApi;
