// inspection/frontend/src/api/vendorFarmerMasterApi.js
import axios from "axios";

const CREATION_BASE_URL = "http://localhost:5002/api";

const vendorFarmerMasterApi = {
  async getAllMin() {
    const res = await axios.get(`${CREATION_BASE_URL}/vendors`);
    // map full vendors -> minimal for dropdown
    return {
      data: res.data.map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,       // VENDOR / FARMER
        status: v.status,
        rating: v.rating
      }))
    };
  }
};

export default vendorFarmerMasterApi;
