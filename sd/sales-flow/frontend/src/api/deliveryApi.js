import axios from "axios";

const API_URL = "http://localhost:5007/api/delivery";

export const getDeliveriesApi = async (token) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const createDeliveryApi = async (body, token) => {
  const res = await axios.post(API_URL, body, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const updateDeliveryApi = async (deliveryId, body, token) => {
  const res = await axios.put(`${API_URL}/${deliveryId}`, body, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Add this function to get available orders
export const getAvailableOrdersApi = async (token) => {
  const res = await axios.get(`${API_URL}/available-orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};