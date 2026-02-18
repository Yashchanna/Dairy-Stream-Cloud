import client from "./client";

const CUSTOMER_DASHBOARD_CACHE_TTL_MS = 10 * 1000;
const customerDashboardCache = new Map();

// Helper to manage cache keys based on stored token
const getCacheKey = () => String(localStorage.getItem("token") || "guest");

/* =========================
   CACHE HELPERS
========================= */
const syncDashboardTodayDeliveryCache = (todayDelivery) => {
  if (!todayDelivery) return;
  const cacheKey = getCacheKey();
  const cached = customerDashboardCache.get(cacheKey);
  if (!cached?.payload) return;

  customerDashboardCache.set(cacheKey, {
    ...cached,
    at: Date.now(),
    payload: { ...cached.payload, todayDelivery },
  });
};

export const invalidateCustomerDashboardCache = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    customerDashboardCache.clear();
    return;
  }
  customerDashboardCache.delete(getCacheKey());
};

/* =========================
   CORE API FUNCTIONS
========================= */

// 1. DASHBOARD
export const fetchCustomerDashboard = async ({ force = false } = {}) => {
  const cacheKey = getCacheKey();
  const cached = customerDashboardCache.get(cacheKey);

  if (!force && cached && Date.now() - cached.at < CUSTOMER_DASHBOARD_CACHE_TTL_MS) {
    return cached.payload;
  }

  const { data } = await client.get("/customer/dashboard");
  customerDashboardCache.set(cacheKey, { payload: data, at: Date.now() });
  return data;
};

// 2. PROFILE
export const fetchCustomerProfile = async () => {
  const { data } = await client.get("/customer/profile");
  return data;
};

export const updateCustomerProfile = async (payload) => {
  const hasPhoto = Boolean(payload?.photoFile);
  let body = payload;
  let config = {};

  if (hasPhoto) {
    const formData = new FormData();
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || key === "photoFile") return;
      formData.append(key, String(value));
    });
    formData.append("image", payload.photoFile);
    body = formData;
    config = { headers: { "Content-Type": "multipart/form-data" } };
  }

  const { data } = await client.put("/customer/profile", body, config);
  invalidateCustomerDashboardCache();
  return data;
};

// 3. DELIVERIES & PAYMENTS
export const fetchCustomerDeliveries = async () => {
  const { data } = await client.get("/customer/deliveries");
  syncDashboardTodayDeliveryCache(data?.todayDelivery);
  return data;
};

export const fetchCustomerPayments = async () => {
  const { data } = await client.get("/customer/payments");
  return data;
};

// 4. SUBSCRIPTION MANAGEMENT
export const fetchCustomerSubscription = async () => {
  const { data } = await client.get("/customer/subscription");
  return data;
};

export const saveCustomerSubscription = async (payload) => {
  const { data } = await client.post("/customer/subscription", payload);
  invalidateCustomerDashboardCache();
  return data;
};

export const clearCustomerSubscription = async () => {
  const { data } = await client.delete("/customer/subscription");
  invalidateCustomerDashboardCache();
  return data;
};

/* =========================
   REGISTRATION
========================= */
export const registerCustomer = (data) => 
  client.post("/customer/addCustomer", data);