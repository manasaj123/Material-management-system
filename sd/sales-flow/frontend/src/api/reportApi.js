import axios from "axios";
const API_URL = "http://localhost:5007/api/reports";

export const getCustomerReportApi = async (token) => {
  const res = await axios.get(`${API_URL}/customer`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getRegionReportApi = async (token) => {
  const res = await axios.get(`${API_URL}/region`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getSummaryReportApi = async (token) => {
  const res = await axios.get(`${API_URL}/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};