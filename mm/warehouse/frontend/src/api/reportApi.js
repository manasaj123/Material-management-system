import { reportApi } from '../api/reportApi';  

const loadMetrics = async () => {
  const response = await reportApi.getMetrics();  
  setMetrics(response.data);
};
