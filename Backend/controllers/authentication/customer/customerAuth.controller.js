import {
  registerCustomerService,
  generateCustomerOtp,
  verifyCustomerOtp,
  customerOtpLoginService,
  determineRedirectPath
} from "../../../services/authentication/customerAuth.service.js";

// ==========================================
// 1. REGISTRATION (Public)
// ==========================================
export const addCustomerAuth = async (req, res) => {
  try {
    // 1. Extract Data
    const {
      customerName,
      email,
      phoneNumber,
      buildingName,
      wing,
      roomNo,
      // Password is optional/removed if you want OTP-only even for registration,
      // but usually kept for profile security settings.
      password, 
      defaultMilkQuantityLiters,
      billingCycle,
    } = req.body;

    // 2. Validate Required Fields
    if (!customerName || !phoneNumber || !roomNo) {
      return res.status(400).json({
        success: false,
        message: "Customer Name, Phone Number, and Room No are required",
      });
    }

    // 3. Call Service (Handles DB Insert & Image Upload)
    // We pass req.file for the profile image
    const customer = await registerCustomerService(req.body, req.file);

    // 4. Send Response
    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer,
    });

  } catch (err) {
    // Handle specific errors (like duplicate email/phone)
    const statusCode = err.message.includes("already used") ? 409 : 500;
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 409 ? err.message : "Registration failed",
      error: err.message,
    });
  }
};

// ==========================================
// 2. LOGIN: REQUEST OTP (Mobile Only)
// ==========================================
export const requestOtpAuth = async (req, res) => {
  try {
    const { identifier, dairyId } = req.body;

    // 1. Validate Mobile Format (Simple check)
    // Remove non-digits
    const mobile = String(identifier).replace(/\D/g, "");
    
    if (mobile.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Please enter a valid 10-digit mobile number" 
      });
    }

    // 2. Call Service to Generate & Send OTP
    // We pass the clean mobile number
    await generateCustomerOtp({ identifier: mobile, dairyId });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your mobile",
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Failed to send OTP",
      error: err.message,
    });
  }
};

// ==========================================
// 3. LOGIN: VERIFY OTP (Mobile Only)
// ==========================================
export const verifyOtpLoginAuth = async (req, res) => {
  try {
    const { otp, dairyId, identifier } = req.body;

    // 1. Normalize Mobile
    const mobile = String(identifier).replace(/\D/g, "");

    // 2. Verify OTP via Service
    const verifiedData = await verifyCustomerOtp({ 
      identifier: mobile, 
      otp, 
      dairyId 
    });

    // 3. Perform Login (Find User & Generate Token)
    // If dairyId was provided during request, use it. Otherwise use the one linked to OTP.
    const loginDairyId = verifiedData.dairy_id || dairyId;
    
    const { token, user } = await customerOtpLoginService({ 
      identifier: mobile, 
      dairyId: loginDairyId 
    });

    // 4. Determine where to send the user next
    // (e.g., Dashboard if they have a subscription, Explore if they don't)
    const { redirect, isRegisteredToRequestedDairy } = await determineRedirectPath(
      user.id, 
      loginDairyId
    );

    // 5. Send Success Response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.customer_name,
        mobile: user.phone_number,
        email: user.email,
        role: "CUSTOMER"
      },
      role: "CUSTOMER",
      isRegisteredToRequestedDairy,
      redirect,
    });

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid OTP or Login Failed",
      error: err.message,
    });
  }
};