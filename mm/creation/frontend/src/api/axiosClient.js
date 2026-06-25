import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/api"
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

export default axiosClient;
