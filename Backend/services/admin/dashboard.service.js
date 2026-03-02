import { supabase } from "../../config/supabase.js";

const dashboardCache = new Map();
const CACHE_TTL = 60_000;

const countTable = async (table, filter = {}) => {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  Object.entries(filter).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
};

export const getAdminDashboardStats = async ({ dairyId } = {}) => {
  const now = Date.now();
  const cacheKey = String(dairyId ?? "global");
  const cached = dashboardCache.get(cacheKey);
  if (cached && now - cached.at < CACHE_TTL) {
    return cached.payload;
  }

  let totalCustomers = 0;
  let dairyName = null;

  // Try to scope customers by dairy via memberships if available
  if (dairyId) {
    try {
      totalCustomers = await countTable("memberships", { dairy_id: dairyId });
    } catch (err) {
      totalCustomers = await countTable("customers");
    }
  } else {
    totalCustomers = await countTable("customers");
  }

  const totalAgents = await countTable("agents");
  const totalDairies = await countTable("dairies");

  if (dairyId) {
    const { data: dairyRow } = await supabase
      .from("dairies")
      .select("dairy_name")
      .eq("id", dairyId)
      .limit(1)
      .maybeSingle();
    dairyName = dairyRow?.dairy_name || null;
  }

  const stats = {
    dairyName,
    totalCustomers,
    totalAgents,
    totalDairies,
    activeAgents: totalAgents,
    deliveriesToday: 0,
    pendingPayments: 0,
  };

  dashboardCache.set(cacheKey, { payload: stats, at: now });

  return stats;
};
