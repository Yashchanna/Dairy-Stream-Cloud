import { supabase } from "../../config/supabase.js";


let dashboardCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60_000;

export const getAdminDashboardStats = async () => {
  const now = Date.now();

  if (dashboardCache && now - lastFetchTime < CACHE_TTL) {
    return dashboardCache;
  }

  const { data, error } = await supabase.rpc("admin_dashboard_stats");

  if (error) {
    console.error("Dashboard RPC error:", error);
    throw error;
  }

  const stats = {
    totalCustomers: data.total_customers,
    totalAgents: data.total_agents,
    totalUsers: data.total_users,
    totalDairies: data.total_dairies,

    // Not available yet
    activeAgents: 0,
    deliveriesToday: 0,
    pendingPayments: 0,
  };

  dashboardCache = stats;
  lastFetchTime = now;

  return stats;
};
