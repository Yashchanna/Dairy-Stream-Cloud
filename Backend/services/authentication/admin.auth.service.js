import bcrypt from "bcryptjs";
import { supabase } from "../../config/supabase.js";
import { generateToken } from "../../utils/jwt.js";

// ===============================
// ADMIN / STAFF LOGIN SERVICE
// ===============================
export const adminStaffLoginService = async ({ identifier, password }) => {
  const isAdmin = identifier.includes("@");
  const table = isAdmin ? "admins" : "agents";
  const column = isAdmin ? "email" : "agent_id";

  const { data: user } = await supabase
    .from(table)
    .select("*")
    .eq(column, identifier)
    .single();

  if (!user) {
    throw new Error("User not found");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Incorrect Password");
  }

  const role = isAdmin ? "ADMIN" : "STAFF";

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
