// import { supabase } from "../../config/supabase.js"; // Adjust path to config.js
// import bcrypt from "bcryptjs";
// import verifyEmail from "../../utils/verifyEmail.js"; // Adjust path to utils

// export const createAgentService = async (agentData) => {
//   const { email, password, agentName, phoneNumber, building } = agentData;

//   // 1. Validate Email
//   const isEmailValid = await verifyEmail(email);
//   if (!isEmailValid) {
//     throw new Error("Invalid or undeliverable email address");
//   }

//   // 2. Hash Password
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // 3. Map to Database Columns (snake_case)
//   const agentRecord = {
//     email,
//     password: hashedPassword,
//     agent_name: agentName,
//     phone_number: phoneNumber,
//     building
//   };

//   // 4. Insert into Supabase
//   const { data, error } = await supabase
//     .from('agents')
//     .insert([agentRecord])
//     .select()
//     .single(); // .single() returns one object instead of an array

//   if (error) {
//     throw new Error(error.message || "Failed to add agent");
//   }

//   return data;
// };


import { supabase } from "../../config/supabase.js";
import bcrypt from "bcryptjs";
import verifyEmail from "../../utils/verifyEmail.js";

// Helper: Generate STF123456
const generateStaffId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `STF${randomNum}`;
};

export const createAgentService = async (agentData) => {
  const { email, password, agentName, phoneNumber, building, dairyId } = agentData;

  // 1. Validate Email
  const isEmailValid = await verifyEmail(email);
  if (!isEmailValid) throw new Error("Invalid or undeliverable email address");

  // 2. Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Generate Unique agent_id
  let newAgentId = generateStaffId();
  let isUnique = false;

  while (!isUnique) {
    const { data } = await supabase
      .from("agents") // ✅ Query 'agents' table
      .select("agent_id")
      .eq("agent_id", newAgentId)
      .maybeSingle();

    if (!data) isUnique = true;
    else newAgentId = generateStaffId();
  }

  // 4. Insert into 'agents' table
  const { data, error } = await supabase
    .from("agents") // ✅ Correct Table
    .insert([
      {
        agent_id: newAgentId, // ✅ Saves to the column in your screenshot
        email,
        password: hashedPassword,
        agent_name: agentName,
        phone_number: phoneNumber,
        building,
        dairy_id: dairyId || null, // Ensure they are linked to a dairy
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to add agent");

  return data;
};