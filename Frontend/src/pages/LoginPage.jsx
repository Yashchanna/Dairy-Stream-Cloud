import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "./hooks/useAuth.jsx";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
} from "lucide-react";

/* ================= MOCK DETECT API (UNCHANGED) ================= */
const mockDetectAPI = async (identifier) =>
  new Promise((resolve) => {
    setTimeout(() => {
      if (identifier === "9999999999") resolve({ exists: false });
      else if (identifier === "8888888888")
        resolve({
          exists: true,
          membership: "MULTIPLE",
          dairies: [
            { id: "D01", name: "Nandanvan Farms" },
            { id: "D02", name: "Pune Fresh Dairy" },
          ],
        });
      else if (identifier.includes("@"))
        resolve({ exists: true, role: "ADMIN" });
      else if (identifier.toUpperCase().startsWith("STF"))
        resolve({ exists: true, role: "STAFF" });
      else resolve({ exists: true, role: "CUSTOMER" });
    }, 900);
  });

const STEP = {
  IDENTIFIER: "IDENTIFIER",
  PASSWORD: "PASSWORD",
  OTP: "OTP",
  SELECT_DAIRY: "SELECT_DAIRY",
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [step, setStep] = useState(STEP.IDENTIFIER);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dairies, setDairies] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);


  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const resetFlow = () => {
    setStep(STEP.IDENTIFIER);
    setPassword("");
    setOtp("");
    setRole(null);
    setDairies([]);
  };
  useEffect(() => {
  if (step === STEP.OTP && otpTimer > 0) {
    const interval = setInterval(() => {
      setOtpTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }
}, [step, otpTimer]);

  const handleContinue = async () => {
    if (!identifier.trim()) {
      toast.error("Enter a valid mobile, email, or staff ID");
      setOtpTimer(30);
      setStep(STEP.OTP);
      return;
    }

    setLoading(true);
    const res = await mockDetectAPI(identifier);

    if (!res.exists) {
      toast.error("You are not registered. Redirecting…");
      setTimeout(() => navigate("/register"), 1500);
      setLoading(false);
      return;
    }

    if (res.membership === "MULTIPLE") {
      setDairies(res.dairies);
      setStep(STEP.SELECT_DAIRY);
    } else {
      setRole(res.role);
      setStep(res.role === "CUSTOMER" ? STEP.OTP : STEP.PASSWORD);
    }

    setLoading(false);
  };

  const handleLoginSuccess = () => {
  const userData = {
    role: role,        // "CUSTOMER" | "STAFF" | "ADMIN"
    identifier,
  };

  // Update auth context
  login(userData);

  // Persist role for route guards
  localStorage.setItem("userRole", role);

  toast.success("Login successful");

  // 🔁 ROLE-BASED REDIRECT
  if (role === "CUSTOMER") {
    navigate("/customer-dashboard", { replace: true });
  } 
  else if (role === "STAFF") {
    navigate("/agent-dashboard", { replace: true });
  } 
  else if (role === "ADMIN") {
    navigate("/admin/AdminDashboard", { replace: true });
  }
};

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      {/* ================= LEFT BRAND ================= */}
      <div className="hidden lg:flex flex-col justify-center px-20 bg-surface border-r border-border">
        <h1 className="text-4xl font-bold text-text-primary tracking-tight">
          DairyStream
        </h1>

        <div className="w-12 h-1 bg-brand rounded-full mt-4 mb-6" />

        <p className="text-lg text-text-secondary max-w-md">
          Manage milk deliveries, subscriptions, billing, and customer access
          from one calm, reliable platform.
        </p>

        <ul className="mt-8 space-y-3 text-text-secondary">
          <li>✓ Automated daily deliveries</li>
          <li>✓ Subscription & billing management</li>
          <li>✓ Staff & customer access</li>
        </ul>
      </div>

      {/* ================= LOGIN CARD ================= */}
      <div className="flex items-center justify-center px-4">
        <div className="relative w-full max-w-md bg-surface border border-border rounded-card shadow-card p-8">
          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-brand rounded-t-card" />

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            {step !== STEP.IDENTIFIER ? (
              <button
                onClick={resetFlow}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            <span className="text-xs text-text-muted">Step 1 of 2</span>
          </div>

          <h2 className="text-2xl font-semibold text-text-primary">
            Sign in to DairyStream
          </h2>
          <p className="mt-1 mb-6 text-sm text-text-secondary">
            Use your registered details to continue
          </p>

          {/* ================= IDENTIFIER ================= */}
          {step === STEP.IDENTIFIER && (
            <div className="space-y-5">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  ref={inputRef}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Mobile, email, or staff ID"
                  className="
                    w-full pl-10 py-3
                    bg-surface border border-border rounded-xl
                    text-text-primary placeholder:text-text-muted
                    focus:ring-2 focus:ring-brand-soft
                    focus:border-brand outline-none
                  "
                />
              </div>

              {/* 🔥 CONTINUE BUTTON (RESTORED) */}
              <button
                onClick={handleContinue}
                disabled={loading}
                className="
                  w-full bg-brand hover:bg-brand-hover
                  text-white py-3 rounded-xl font-semibold
                  flex items-center justify-center gap-2
                  transition
                "
              >
                {loading ? <Loader2 className="animate-spin" /> : "Continue"}
                {!loading && <ArrowRight size={18} />}
              </button>

              <p className="text-sm text-center text-text-secondary">
                New here?{" "}
                <Link
                  to="/register"
                  className="text-brand font-medium hover:underline"
                >
                  Create an account
                </Link>
              </p>

              <div className="pt-4 border-t border-border text-center text-sm text-text-muted">
                <Link to="/register-dairy" className="hover:underline">
                  Register your dairy
                </Link>{" "}
                ·{" "}
                <Link to="/explore" className="hover:underline">
                  Find nearby dairies
                </Link>
              </div>
            </div>
          )}

          {/* ================= PASSWORD ================= */}
          {step === STEP.PASSWORD && (
            <div className="space-y-5">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  ref={inputRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="
                    w-full pl-10 pr-10 py-3
                    bg-surface border border-border rounded-xl
                    focus:ring-2 focus:ring-brand-soft
                    focus:border-brand outline-none
                  "
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <button
                onClick={handleLoginSuccess}
                className="
                  w-full bg-brand hover:bg-brand-hover
                  text-white py-3 rounded-xl font-semibold
                "
              >
                Login
              </button>
            </div>
          )}


          {/* ================= OTP ================= */}
          {step === STEP.OTP && (
            <div className="space-y-5">
              {/* Instruction */}
              <div className="text-center">
                <p className="text-sm text-text-secondary">
                  Enter the 6-digit OTP sent to your registered contact
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Please check your messages
                </p>
              </div>

              {/* OTP Input */}
              <input
                ref={inputRef}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                inputMode="numeric"
                placeholder="••••••"
                className="
                    w-full text-center text-2xl tracking-widest py-3
                    bg-surface border border-border rounded-xl
                    text-text-primary
                    placeholder:text-text-muted
                    focus:ring-2 focus:ring-brand-soft
                    focus:border-brand
                    outline-none
                  "
              />

              {/* Timer / Resend */}
              <div className="text-center">
                {otpTimer > 0 ? (
                  <p className="text-xs text-text-muted">
                    Resend OTP in <span className="font-medium">00:{otpTimer.toString().padStart(2, "0")}</span>
                  </p>
                ) : (
                  <button
                    onClick={() => {
                      setOtp("");
                      setOtpTimer(30);
                      toast.success("OTP resent");
                    }}
                    className="text-sm text-brand font-medium hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleLoginSuccess}
                className="
                    w-full bg-success hover:bg-success
                    text-white py-3 rounded-xl font-semibold
                  "
              >
                Verify & Login
              </button>
            </div>
          )}


          {/* ================= SELECT DAIRY ================= */}
          {step === STEP.SELECT_DAIRY && (
            <div className="space-y-3">
              {dairies.map((d) => (
                <button
                  key={d.id}
                  onClick={handleLoginSuccess}
                  className="
                    w-full p-4 bg-surface
                    border border-border rounded-xl
                    hover:bg-brand-soft text-left
                  "
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
