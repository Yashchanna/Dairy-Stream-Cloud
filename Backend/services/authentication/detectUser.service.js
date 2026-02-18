import { supabase } from "../../config/supabase.js";

const normalizeIdentifier = (value) => String(value ?? "").trim();

export const detectUserService = async (identifier) => {
  const id = normalizeIdentifier(identifier);

  // ============================================
  // 1. ADMIN CHECK (Strictly Email)
  // ============================================
  if (id.includes("@")) {
    const { data: admin } = await supabase
      .from("admins")
      .select("id, email, name")
      .eq("email", id)
      .single();

    if (admin) {
      return {
        exists: true,
        userType: "ADMIN",
        nextStep: "PASSWORD",
        name: admin.name
      };
    }
    // If email format but not in Admin table, we block it (Admins are internal)
    return { exists: false, error: "Admin email not found" };
  }

  // ============================================
  // 2. AGENT CHECK (Strictly Staff ID starting with 'STF')
  // ============================================
  if (id.toUpperCase().startsWith("STF")) {
    const { data: agent } = await supabase
      .from("agents")
      .select("id, full_name, role")
      .eq("role", "AGENT")
      .eq("id", id) // Strict ID match
      .single();

    if (agent) {
      return {
        exists: true,
        userType: "AGENT",
        nextStep: "PASSWORD",
        name: agent.full_name
      };
    }
    return { exists: false, error: "Staff ID not found" };
  }

  // ============================================
  // 3. CUSTOMER CHECK (Strictly Mobile Number)
  // ============================================
  // Remove non-digits to ensure it's a phone number
  const mobile = id.replace(/\D/g, "");
  
  if (mobile.length >= 10) { // Basic validation
    const { data: customer } = await supabase
      .from("customers")
      .select("id, customer_name")
      .eq("phone_number", mobile) // Strict Mobile match
      .maybeSingle();

    if (customer) {
      return {
        exists: true,
        userType: "CUSTOMER",
        nextStep: "OTP", // Strictly OTP for existing customers
        name: customer.customer_name
      };
    }
    
    // Valid mobile format but not in DB -> Send to Register
    return {
      exists: false,
      userType: "NEW_USER",
      nextStep: "REGISTER"
    };
  }

  return { exists: false, error: "Invalid identifier format" };
};