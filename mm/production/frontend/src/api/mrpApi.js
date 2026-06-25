import axios from "axios";

const BASE = "http://localhost:4000/api/mrp";

const mrpApi = {
  async run(date) {
    const res = await axios.post(`${BASE}/run`, { date });
    return res.data;
  }
};

export default mrpApi;
