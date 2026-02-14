import axios from "axios";

const rawBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api").trim();
const API_BASE = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

const API = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const detectUserApi = async (identifier) => {
  const { data } = await API.post("/auth/detect", { identifier });
  return data;
};

export const requestOtpApi = async (payload) => {
  const { data } = await API.post("/auth/login/otp", payload);
  return data;
};

export const verifyOtpApi = async (payload) => {
  const { data } = await API.post("/auth/login/otp/verify", payload);
  return data;
};

export const adminLoginApi = async (payload) => {
  const { data } = await API.post("/auth/login/password", payload);
  return data;
};
