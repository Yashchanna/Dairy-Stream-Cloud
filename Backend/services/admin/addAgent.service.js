import { supabase } from "../../config/supabase.js";
import bcrypt from "bcryptjs";
import verifyEmail from "../../utils/verifyEmail.js";

// Helper: Generate STF123456 (Fallback)
const generateStaffId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `STF${randomNum}`;
};

export const createAgentService = async (agentData) => {
  const { email, password, agentName, phoneNumber, building, dairyId, agentId } = agentData;

  // 1. Validate Email
  const isEmailValid = await verifyEmail(email);
  if (!isEmailValid) throw new Error("Invalid or undeliverable email address");

  // 2. Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Determine Agent ID (Use Frontend's ID if provided, else generate)
  let finalAgentId = agentId ? agentId.trim().toUpperCase() : generateStaffId();
  
  // 4. Ensure Uniqueness (Double Check)
  // If the ID coming from frontend is taken, we regenerate it to prevent crash
  let isUnique = false;
  while (!isUnique) {
    const { data } = await supabase
      .from("agents")
      .select("agent_id")
      .eq("agent_id", finalAgentId)
      .maybeSingle();

    if (!data) {
      isUnique = true;
    } else {
      // Collision found! Generate a new one automatically
      finalAgentId = generateStaffId(); 
    }
  }

  // 5. Insert into DB
  const { data, error } = await supabase
    .from("agents")
    .insert([
      {
        agent_id: finalAgentId, // ✅ Uses the ID visible on frontend
        email,
        password: hashedPassword,
        agent_name: agentName,
        phone_number: phoneNumber,
        building,
        dairy_id: dairyId || null,
        // role: 'AGENT'
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to add agent");

  return data;
};