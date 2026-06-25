import axios from "axios";

const BASE = "http://localhost:4000/api/metrics";

const metricApi = {
  async getDaily(date) {
    const res = await axios.get(`${BASE}/daily`, { params: { date } });
    return res.data;
  }
};

export default metricApi;
