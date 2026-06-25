import axios from "axios";

const BASE = "http://localhost:4000/api/plan";

const planApi = {
  async getByDate(date) {
    const res = await axios.get(BASE, { params: { date } });
    return res.data;
  },
  async save(date, rows) {
    const res = await axios.post(BASE, { date, rows });
    return res.data;
  },
  async generateFromForecast(period, date) {
    const res = await axios.post(`${BASE}/generate`, { period, date });
    return res.data;
  }
};

export default planApi;
