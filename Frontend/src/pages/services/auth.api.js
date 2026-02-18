import axios from "axios";

const rawBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api").trim();
const API_BASE = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

const API = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// 1. DETECT USER
// ===============================
export const detectUserApi = async (identifier) => {
  const { data } = await API.post("/auth/detect", { identifier });
  return data;
};

// ===============================
// 2. CUSTOMER OTP FLOW
// ===============================
export const requestOtpApi = async (payload) => {
  const { data } = await API.post("/auth/login/otp", payload);
  return data;
};

export const verifyOtpApi = async (payload) => {
  const { data } = await API.post("/auth/login/otp/verify", payload);
  return data;
};

// ===============================
// 3. ADMIN LOGIN (Updated)
// ===============================
export const adminLoginApi = async (payload) => {
  // ✅ FIX: Point to the new specific Admin route
  // OLD: /auth/login/password 
  // NEW: /auth/admin/login
  const { data } = await API.post("/auth/admin/login", payload);
  return data;
};

// ===============================
// 4. AGENT LOGIN (Added)
// ===============================
export const agentLoginApi = async (payload) => {
  // ✅ NEW: Specific route for Agents
  const { data } = await API.post("/auth/agent/login", payload);
  return data;
};