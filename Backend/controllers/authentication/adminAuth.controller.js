import { adminStaffLoginService } from "../../services/authentication/adminAuth.service.js";

export const adminLogin = async (req, res) => {
  try {
    const { identifier, email, password } = req.body || {};
    const loginIdentifier = String(identifier || email || "").trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        error: "Identifier and password are required",
      });
    }

    const result = await adminStaffLoginService({
      identifier: loginIdentifier,
      password,
    });

    res.json({
      success: true,
      token: result.token,
      user: result.user,
      redirect: "/admin/AdminDashboard",
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

