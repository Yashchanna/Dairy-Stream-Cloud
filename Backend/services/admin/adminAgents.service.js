import { supabase } from "../../config/supabase.js"; // Adjust path to match your customer service import

export const getAdminAgents = async ({
  page = 1,
  limit = 10,
  search = "",
  dairyId = null,
}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Agents are stored in the 'agents' table
  let query = supabase
    .from("agents")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (dairyId) {
    query = query.eq("dairy_id", dairyId);
  }

  // 2. Apply Search
  if (search) {
    query = query.or(
      `agent_name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%,building.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    // Normalize fields to match frontend expectations
    agents: (data || []).map((agent) => ({
      ...agent,
      full_name: agent.agent_name,
      mobile: agent.phone_number,
    })),
    total: count,
    page,
    limit,
  };
};

export const getAgentDetails = async (agentId, { dairyId = null } = {}) => {
  // 1. Fetch Basic Agent Info from Agents table
  let query = supabase
    .from("agents")
    .select("*")
    .eq("id", agentId);

  if (dairyId) {
    query = query.eq("dairy_id", dairyId);
  }

  const { data: agent, error: agentError } = await query.single();

  if (agentError) throw agentError;

  // 2. (Optional) Fetch related delivery stats or assignments if you have them
  // For now, we return the agent profile to match the structure
  
  return {
    agent: {
      ...agent,
      full_name: agent.agent_name,
      mobile: agent.phone_number,
    },
    // You can add more related data here later, like:
    // deliveries: [], 
    // assignments: null
  };
};

export const updateAgentById = async (agentId, updates) => {
  const allowed = ["agent_name", "phone_number", "email", "building"];

  const payload = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) payload[key] = updates[key];
  }

  const { data, error } = await supabase
    .from("agents")
    .update(payload)
    .eq("id", agentId)
    .select("*")
    .single();

  if (error) throw error;

  return {
    ...data,
    full_name: data.agent_name,
    mobile: data.phone_number,
  };
};

export const deleteAgentById = async (agentId) => {
  const { error } = await supabase.from("agents").delete().eq("id", agentId);
  if (error) throw error;
  return { success: true };
};
