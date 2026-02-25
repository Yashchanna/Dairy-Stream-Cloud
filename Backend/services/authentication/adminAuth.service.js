import bcrypt from "bcryptjs";
import { supabase } from "../../config/supabase.js";
import { generateToken } from "../../utils/jwt.js";

// ===============================
// ADMIN / STAFF LOGIN SERVICE
// ===============================
export const adminStaffLoginService = async ({ identifier, password }) => {
  const normalizedIdentifier = String(identifier || "").trim();
  const isAdminEmail = normalizedIdentifier.includes("@");
  const isAgentId = normalizedIdentifier.toUpperCase().startsWith("STF");
  const mobile = normalizedIdentifier.replace(/\D/g, "");

  let user = null;
  let role = null;

  if (isAgentId) {
    const { data: agentUser, error } = await supabase
      .from("agents")
      .select("*")
      .ilike("agent_id", normalizedIdentifier.toUpperCase())
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    user = agentUser;
    role = "STAFF";
  } else {
    // Admin login via email
    if (isAdminEmail) {
      const { data: adminByEmail, error } = await supabase
        .from("admins")
        .select("*")
        .ilike("email", normalizedIdentifier)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      user = adminByEmail;
    }

    // Admin login via mobile
    if (!user && mobile.length >= 10) {
      const candidateColumns = ["phone", "phone_number"];
      for (const column of candidateColumns) {
        const { data: adminByPhone, error } = await supabase
          .from("admins")
          .select("*")
          .eq(column, mobile)
          .limit(1)
          .maybeSingle();

        if (!error && adminByPhone) {
          user = adminByPhone;
          break;
        }

        if (error) {
          const msg = String(error.message || "").toLowerCase();
          const missingColumn = msg.includes("column") && msg.includes("does not exist");
          if (!missingColumn) throw error;
        }
      }
    }

    role = "ADMIN";
  }

  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Incorrect Password");
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role,
    dairyId: user.dairy_id,
  });

  return {
    token,
    role,
    user: {
      id: user.id,
      name: user.name || user.email,
      email: user.email,
    },
  };
};
