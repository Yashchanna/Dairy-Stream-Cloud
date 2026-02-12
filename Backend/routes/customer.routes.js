import express from "express";

import {
  requestOtp,
  verifyOtpLogin
} from "../controllers/authentication/customer/auth.controller.js";

import {
  getProfile,
  updateProfile,
} from "../controllers/customer/profile.controller.js";

import {
  forgotPassword,
  resetPassword,
} from "../controllers/authentication/customer/password.controller.js";

import { verifyEmail } from "../controllers/customer/verifyEmail.controller.js";

import { authenticate } from "../middleware/customer/auth.middleware.js";

const router = express.Router();

// ==========================================
// 🔐 PUBLIC ROUTES
// ==========================================

// OTP Login
router.post("/login/otp", requestOtp);
router.post("/login/otp/verify", verifyOtpLogin);

// Account recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Email verification
router.get("/verify-email", verifyEmail);

// ==========================================
// 🛡️ PROTECTED ROUTES
// ==========================================

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
