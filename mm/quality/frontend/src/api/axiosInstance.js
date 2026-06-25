import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5004", // your QC backend port
  headers: {
    "Content-Type": "application/json"
  }
});

export default axiosInstance;
