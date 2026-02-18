import axios from "axios";

// Cleanly fetch and trim the base URL
export const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").trim();

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor: Automatically attaches adminToken or customer token to every request
client.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const customerToken = localStorage.getItem("token");
  const token = adminToken || customerToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;