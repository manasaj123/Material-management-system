import axios from "axios";

const BASE = "http://localhost:4000/api/grade-packs";

const gradePackApi = {
  async list() {
    const res = await axios.get(BASE);
    return res.data;
  }
};

export default gradePackApi;