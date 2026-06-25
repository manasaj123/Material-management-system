import axios from "axios";

const BASE = "http://localhost:4000/api/capacity";

const capacityApi = {
  async getByDate(date) {
    const res = await axios.get(BASE, { params: { date } });
    return res.data;
  },
  async save(date, rows) {
    const res = await axios.post(BASE, { date, rows });
    return res.data;
  },
  async suggest(date) {
    const res = await axios.post(`${BASE}/suggest`, { date });
    return res.data;
  }
};

export default capacityApi;
