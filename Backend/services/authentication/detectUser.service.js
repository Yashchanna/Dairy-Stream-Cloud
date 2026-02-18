import { supabase } from "../../config/supabase.js";

const normalizeIdentifier = (value) => String(value ?? "").trim();

export const detectUserService = async (identifier) => {
  const rawId = normalizeIdentifier(identifier);
  console.log(`🔍 [DetectUser] Checking: "${rawId}"`);

  // 1. ADMIN CHECK (Email)
  if (rawId.includes("@")) {
    const { data: admin } = await supabase
      .from("admins")
      .select("email, name")
      .eq("email", rawId)
      .maybeSingle();

    if (admin) {
      return { exists: true, userType: "ADMIN", nextStep: "PASSWORD", name: admin.name };
    }
  }

  // 2. AGENT CHECK (STF...)
  if (rawId.toUpperCase().startsWith("STF")) {
    const agentIdUpper = rawId.toUpperCase();
    const { data: agent } = await supabase
      .from("agents")
      .select("agent_id, agent_name")
      .ilike("agent_id", agentIdUpper)
      .maybeSingle();

    if (agent) {
      return { exists: true, userType: "AGENT", nextStep: "PASSWORD", name: agent.agent_name };
    }
  }

  // 3. CUSTOMER CHECK (Mobile Number)
  // ✅ FIX: Clean the number and check the 'customers' table
  const mobile = rawId.replace(/\D/g, ""); // Removes any non-digits
  
  if (mobile.length >= 10) {
    console.log(`📱 Checking 'customers' table for phone_number: ${mobile}`);
    
    const { data: customer } = await supabase
      .from("customers") // 👈 Must match your Supabase table name
      .select("customer_name")
      .eq("phone_number", mobile) // 👈 Ensure this matches your DB column name
      .maybeSingle();

    if (customer) {
      console.log("✅ Found Customer:", customer.customer_name);
      return { 
        exists: true, 
        userType: "CUSTOMER", 
        nextStep: "OTP", 
        name: customer.customer_name 
      };
    }
    
    // If not found, suggest registration
    return { exists: false, userType: "NEW_USER", nextStep: "REGISTER" };
  }

  return { exists: false, error: "User not found" };
};



