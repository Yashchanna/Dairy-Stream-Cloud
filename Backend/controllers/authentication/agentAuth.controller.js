import { supabase } from "../../config/supabase.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const agentLogin = async (req, res) => {
  try {
    const { agentId, password } = req.body;
    const normalizedAgentId = agentId.trim().toUpperCase(); // ✅ Standardize input

    // 1. Find Agent in 'agents' table
    const { data: agent } = await supabase
      .from("agents")
      .select("*")
      .eq("agent_id", normalizedAgentId) // ✅ Query using standardized ID
      .maybeSingle();

    if (!agent) return res.status(404).json({ success: false, error: "Agent not found" });

    // 2. Verify Password
    const isValid = await bcrypt.compare(password, agent.password);
    if (!isValid) return res.status(401).json({ success: false, error: "Invalid password" });

    // ... rest of the code for token generation

    // 3. Generate Token
    const token = jwt.sign(
      { 
        id: agent.id, // Primary Key (UUID)
        agentId: agent.agent_id, // "STF..." ID
        role: "AGENT", 
        dairyId: agent.dairy_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      role: "AGENT",
      user: {
        id: agent.id,
        agentId: agent.agent_id,
        name: agent.agent_name,
        role: "AGENT",
        dairyId: agent.dairy_id
      },
      redirect: "/agent/dashboard"
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: "Login failed" });
  }
};