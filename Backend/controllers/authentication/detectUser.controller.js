import { detectUserService } from "../../services/authentication/detectUser.service.js";

export const detectUser = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ 
        success: false, 
        message: "Identifier (Email, Phone, or Staff ID) is required" 
      });
    }

    // Call the service logic
    const result = await detectUserService(identifier);

    // Send the roadmap back to Frontend
    return res.status(200).json({
      success: true,
      ...result 
      // Returns: { exists, userType, nextStep, name }
    });

  } catch (err) {
    console.error("Detect User Error:", err.message);
    return res.status(500).json({ 
      success: false, 
      message: "Unable to detect user. Please try again." 
    });
  }
};