import axios from "axios";

const BASE = "http://localhost:4000/api/forecast";

const forecastApi = {
  async getByPeriod(period) {
    const res = await axios.get(BASE, { params: { period } });
    return res.data;
  },
  async save(period, rows) {
    const res = await axios.post(BASE, { period, rows });
    return res.data;
  }
};

export default forecastApi;
