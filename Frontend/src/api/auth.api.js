import axios from "axios";

// Create Axios Instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. http://localhost:4000/api
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// 1. DETECT USER (The Gatekeeper)
// ===============================
export const detectUserApi = async (identifier) => {
  const { data } = await API.post("/auth/detect", {
    identifier,
  });
  return data;
};

// ===============================
// 2. ADMIN LOGIN (Email + Password)
// ===============================
export const adminLoginApi = async ({ email, password }) => {
  // ✅ FIX: Point to the new specific Admin route
  const { data } = await API.post("/auth/admin/login", {
    email,     // Backend expects 'email'
    password,
  });
  return data;
};

// ===============================
// 3. AGENT LOGIN (Staff ID + Password)
// ===============================
export const agentLoginApi = async ({ agentId, password }) => {
  // ✅ FIX: Point to the new specific Agent route
  const { data } = await API.post("/auth/agent/login", {
    agentId,   // Backend expects 'agentId'
    password,
  });
  return data;
};

// ===============================
// 4. REQUEST OTP (CUSTOMER)
// ===============================
export const requestOtpApi = async ({ identifier, dairyId }) => {
  const { data } = await API.post("/auth/login/otp", {
    identifier,
    dairyId,
  });
  return data;
};

// ===============================
// 5. VERIFY OTP (CUSTOMER LOGIN)
// ===============================
export const verifyOtpApi = async ({ identifier, otp, dairyId }) => {
  const { data } = await API.post("/auth/login/otp/verify", {
    identifier,
    otp,
    dairyId,
  });
  return data;
};

// ❌ REMOVED: passwordLoginApi (This generic one is no longer used)