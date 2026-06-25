import axios from "axios";

const BASE = "http://localhost:4000/api/batch";

const batchApi = {
  async getByDate(date) {
    const res = await axios.get(BASE, { params: { date } });
    return res.data;
  },
  async createMany(date, rows) {
    const res = await axios.post(BASE, { date, rows });
    return res.data;
  }
};

export default batchApi;
