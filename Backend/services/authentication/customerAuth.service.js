import { supabase } from "../../config/supabase.js";
import { generateToken } from "../../utils/jwt.js";
import bcrypt from "bcryptjs";
import cloudinary from "../../config/cloudinary.js";
import { ensureIdentityIsUnique } from "./identityUniqueness.service.js"; // Reuse existing uniqueness service

// const normalizeIdentifier = (value) => String(value ?? "").trim();
// const otpStore = new Map();

// const buildOtpKey = (identifier, dairyId) =>
//   `${normalizeIdentifier(identifier)}::${dairyId == null ? "null" : String(dairyId)}`;

// const purgeExpiredOtps = () => {
//   const now = Date.now();
//   for (const [key, value] of otpStore.entries()) {
//     if (!value?.expiresAt || value.expiresAt <= now) {
//       otpStore.delete(key);
//     }
//   }
// };

// const buildPhoneVariants = (identifier) => {
//   const raw = normalizeIdentifier(identifier);
//   const digitsOnly = raw.replace(/\D/g, "");
//   const variants = new Set([raw]);

//   if (digitsOnly) {
//     variants.add(digitsOnly);
//     if (digitsOnly.length > 10) variants.add(digitsOnly.slice(-10));
//   }

//   return [...variants].filter(Boolean);
// };

// const buildLoosePhonePattern = (identifier) => {
//   const digitsOnly = normalizeIdentifier(identifier).replace(/\D/g, "");
//   const last10 = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
//   if (last10.length < 10) return null;
//   return `%${last10.slice(0, 5)}%${last10.slice(5)}%`;
// };

// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const sendOtp = async ({ identifier, otp }) => {
//   console.log(`[OTP] Identifier: ${identifier}, OTP: ${otp}`);
  
//   // Log to file for easy access
//   try {
//     const logPath = path.join(__dirname, "../../otp.log");
//     fs.appendFileSync(logPath, `[${new Date().toISOString()}] Identifier: ${identifier}, OTP: ${otp}\n`);
//   } catch (err) {
//     console.error("Failed to write to OTP log file:", err);
//   }
// };

// // ===============================
// // DETECT USER
// // ===============================
// // export const detectUserService = async (identifier) => {
// //   const normalizedIdentifier = normalizeIdentifier(identifier);

// //   if (normalizedIdentifier.includes("@")) {
// //     return { userType: "ADMIN", nextStep: "PASSWORD" };
// //   }

// //   if (normalizedIdentifier.toUpperCase().startsWith("STF")) {
// //     return { userType: "STAFF", nextStep: "PASSWORD" };
// //   }

// //   const phoneVariants = buildPhoneVariants(normalizedIdentifier);

// //   const { data } = await supabase
// //     .from("customers")
// //     .select("id")
// //     .in("phone_number", phoneVariants);

// //   if (!data || data.length === 0) {
// //     return { userType: "CUSTOMER", nextStep: "EXPLORE" };
// //   }

// //   if (data.length === 1) {
// //     return {
// //       userType: "CUSTOMER",
// //       nextStep: "OTP",
// //     };
// //   }

// //   return {
// //     userType: "CUSTOMER",
// //     dairies: data.map((c) => ({ id: c.id })),
// //     nextStep: "SELECT_DAIRY",
// //   };
// // };

// // ===============================
// // OTP
// // ===============================
// export const generateCustomerOtp = async ({ identifier, dairyId }) => {
//   const normalizedIdentifier = normalizeIdentifier(identifier);
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   const expiresAt = Date.now() + 5 * 60 * 1000;

//   purgeExpiredOtps();
//   const key = buildOtpKey(normalizedIdentifier, dairyId);
//   otpStore.set(key, {
//     identifier: normalizedIdentifier,
//     dairy_id: dairyId ?? null,
//     otp,
//     expiresAt,
//   });

//   await sendOtp({ identifier: normalizedIdentifier, otp });
// };

// export const verifyCustomerOtp = async ({ identifier, otp, dairyId }) => {
//   const normalizedIdentifier = normalizeIdentifier(identifier);
//   const normalizedOtp = String(otp ?? "").trim();

//   if (!normalizedOtp) {
//     throw new Error("OTP is required");
//   }

//   purgeExpiredOtps();

//   const candidates = [];
//   for (const [key, value] of otpStore.entries()) {
//     if (value.identifier !== normalizedIdentifier) continue;
//     if (dairyId !== undefined) {
//       const expectedDairy = dairyId ?? null;
//       if (value.dairy_id !== expectedDairy) continue;
//     }
//     candidates.push({ key, ...value });
//   }

//   candidates.sort((a, b) => b.expiresAt - a.expiresAt);
//   const latestOtp = candidates[0];

//   if (!latestOtp) throw new Error("Invalid or expired OTP");
//   if (latestOtp.otp !== normalizedOtp) throw new Error("Invalid OTP");

//   otpStore.delete(latestOtp.key);

//   return latestOtp;
// };

// // ===============================
// // LOGIN
// // ===============================
// export const customerOtpLoginService = async ({ identifier, dairyId }) => {
//   const normalizedIdentifier = normalizeIdentifier(identifier);
//   const isEmail = normalizedIdentifier.includes("@");
//   let customer = null;

//   if (isEmail) {
//     const { data: emailCustomer } = await supabase
//       .from("customers")
//       .select("*")
//       .ilike("email", normalizedIdentifier)
//       .limit(1)
//       .maybeSingle();
//     customer = emailCustomer;
//   } else {
//     const phoneVariants = buildPhoneVariants(normalizedIdentifier);
//     const exactQuery = supabase
//       .from("customers")
//       .select("*")
//       .in("phone_number", phoneVariants);

//     const { data: exactCustomer } = await exactQuery.limit(1).maybeSingle();
//     customer = exactCustomer;

//     if (!customer) {
//       const loosePattern = buildLoosePhonePattern(normalizedIdentifier);
//       if (loosePattern) {
//         const looseQuery = supabase
//           .from("customers")
//           .select("*")
//           .ilike("phone_number", loosePattern);

//         const { data: looseCustomer } = await looseQuery.limit(1).maybeSingle();
//         customer = looseCustomer;
//       }
//     }
//   }

//   if (!customer) throw new Error("Customer not found");

//   const token = generateToken({
//     id: customer.id,
//     email: customer.email ?? null,
//     role: "CUSTOMER",
//     dairyId,
//   });

//   return {
//     token,
//     role: "CUSTOMER",
//     user: customer,
//   };
// };



// ==========================================
// INTERNAL HELPERS (Moved from Controller)
// ==========================================
const normalizeIdentifier = (value) => String(value ?? "").trim();
const normalizeEmail = (value) => (value || "").trim().toLowerCase();
const otpStore = new Map();

// Helper: Build OTP Key
const buildOtpKey = (identifier, dairyId) =>
  `${normalizeIdentifier(identifier)}::${dairyId == null ? "null" : String(dairyId)}`;

// Helper: Phone Variants
const buildPhoneVariants = (identifier) => {
  const raw = normalizeIdentifier(identifier);
  const digitsOnly = raw.replace(/\D/g, "");
  const variants = new Set([raw]);
  if (digitsOnly) {
    variants.add(digitsOnly);
    if (digitsOnly.length > 10) variants.add(digitsOnly.slice(-10));
  }
  return [...variants].filter(Boolean);
};

// ==========================================
// CORE AUTH LOGIC
// ==========================================

/**
 * Register a new customer
 */
export const registerCustomerService = async (payload, file) => {
  const {
    customerName,
    email,
    phoneNumber,
    buildingName,
    wing,
    roomNo,
    password,
    defaultMilkQuantityLiters,
    billingCycle,
  } = payload;

  // 1. Check Uniqueness
  await ensureIdentityIsUnique({ email, phone: phoneNumber });

  // 2. Hash Password
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  // 3. Upload Image (if exists)
  let profilePhotoUrl = null;
  if (file) {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: "customers/profile",
      resource_type: "image",
    });
    profilePhotoUrl = uploaded.secure_url;
  }

  // 4. Insert into DB
  const { data, error } = await supabase
    .from("customers")
    .insert([
      {
        customer_name: customerName,
        email: normalizeEmail(email),
        phone_number: phoneNumber,
        building_name: buildingName || null,
        wing: wing || null,
        room_no: roomNo,
        password: hashedPassword,
        default_milk_quantity_liters: defaultMilkQuantityLiters || 1,
        billing_cycle: billingCycle || "Monthly",
        profile_photo_url: profilePhotoUrl,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Login with Password
 */
export const loginWithPasswordService = async (emailOrPhone, password) => {
  const filter = `email.eq.${emailOrPhone},phone_number.eq.${emailOrPhone}`;
  const { data, error } = await supabase.from("customers").select("*").or(filter).maybeSingle();

  if (error) throw new Error("Database error");
  if (!data) throw new Error("Customer not found");
  if (!data.password) throw new Error("Password not set for this account");

  const isMatch = await bcrypt.compare(password, data.password);
  if (!isMatch) throw new Error("Invalid password");

  const token = generateToken({
    id: data.id,
    email: data.email,
    role: "CUSTOMER",
  });

  return { token, user: data };
};

// ==========================================
// OTP LOGIC (Existing + Refined)
// ==========================================

export const generateCustomerOtp = async ({ identifier, dairyId }) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

  // Purge old
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt <= Date.now()) otpStore.delete(key);
  }

  const key = buildOtpKey(normalizedIdentifier, dairyId);
  otpStore.set(key, { identifier: normalizedIdentifier, dairy_id: dairyId ?? null, otp, expiresAt });

  console.log(`[OTP SENT] To: ${normalizedIdentifier} | OTP: ${otp}`); // Replace with SMS Gateway later
  return otp;
};

export const verifyCustomerOtp = async ({ identifier, otp, dairyId }) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const normalizedOtp = String(otp ?? "").trim();
  
  // Find OTP in Memory
  const candidates = [];
  for (const [key, value] of otpStore.entries()) {
    if (value.identifier !== normalizedIdentifier) continue;
    if (dairyId !== undefined && value.dairy_id !== (dairyId ?? null)) continue;
    candidates.push({ key, ...value });
  }

  // Check Expiry & Match
  const latestOtp = candidates.sort((a, b) => b.expiresAt - a.expiresAt)[0];
  if (!latestOtp) throw new Error("OTP expired or not found");
  if (latestOtp.otp !== normalizedOtp) throw new Error("Invalid OTP");

  otpStore.delete(latestOtp.key); // Burn OTP
  return latestOtp;
};

/**
 * Find Customer & Generate Token (Post-OTP)
 */
export const customerOtpLoginService = async ({ identifier, dairyId }) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const phoneVariants = buildPhoneVariants(normalizedIdentifier);

  // Find user by Phone OR Email
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .or(`email.eq.${normalizedIdentifier},phone_number.in.(${phoneVariants.join(',')})`)
    .limit(1)
    .maybeSingle();

  if (!customer) throw new Error("Customer not found");

  const token = generateToken({
    id: customer.id,
    email: customer.email,
    role: "CUSTOMER",
    dairyId
  });

  return { token, user: customer };
};

/**
 * Determine Redirect (Membership Check)
 * This replaces the complex logic previously in the controller
 */
export const determineRedirectPath = async (userId, requestedDairyId) => {
  // 1. Check Memberships Table
  const { data: membership } = await supabase
    .from("memberships")
    .select("dairy_id")
    .eq("customer_id", userId) // Ensure column name matches your DB
    .limit(1)
    .maybeSingle();

  const isMemberOfRequested = requestedDairyId && membership?.dairy_id == requestedDairyId;
  const hasAnyMembership = !!membership;

  // 2. Logic
  const redirect = hasAnyMembership ? "/customer/dashboard" : "/explore";
  
  return {
    redirect,
    isRegisteredToRequestedDairy: isMemberOfRequested
  };
};