
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3004/api', 
});

export default axiosClient;
