import axios from "axios";

const BASE = "http://localhost:4000/api/work-orders";

const workOrderApi = {
  async getByDate(date) {
    const res = await axios.get(BASE, { params: { date } });
    return res.data;
  },
  async create(data) {
    const res = await axios.post(BASE, data);
    return res.data;
  },
  async updateActuals(id, payload) {
    const res = await axios.put(`${BASE}/${id}/actuals`, payload);
    return res.data;
  }
};

export default workOrderApi;
