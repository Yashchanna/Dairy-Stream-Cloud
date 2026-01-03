import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import dairyImage from "../assets/dairyproduct.png";
import '../styles/auth.css';

const CustomerRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    customerName: "",
    phoneNumber: "",
    buildingName: "",
    wing: "",
    roomNo: "",
    defaultMilkQuantityLiters: 1.0,
    defaultExtraProduct: "None",
    defaultExtraProductQuantity: 0,
    billingCycle: "Monthly",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  // Validate Step 1
  const validateStep1 = () => {
    if (!formData.customerName.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email");
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  // Validate Step 2
  const validateStep2 = () => {
    if (!formData.phoneNumber.trim()) {
      setError("Please enter your phone number");
      return false;
    }
    if (!formData.buildingName.trim()) {
      setError("Please enter building name");
      return false;
    }
    if (!formData.roomNo.trim()) {
      setError("Please enter room number");
      return false;
    }
    return true;
  };

  // Handle Next Step
  const handleNextStep = (e) => {
    e.preventDefault();
    setError("");

    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  // Handle Previous Step
  const handlePrevStep = () => {
    setError("");
    setCurrentStep(1);
  };

  // ✅ Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/customer/addCustomer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - Redirect to login
        window.location.href = "/";
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error registering:", error);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "transparent";
    if (passwordStrength === 1) return "#dc3545";
    if (passwordStrength === 2) return "#ffc107";
    if (passwordStrength === 3) return "#17a2b8";
    return "#28a745";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Logo and Header */}
        <div className="text-center mb-5">
          <img
            src={dairyImage}
            alt="Dairy Delivery"
            className="login-logo"
          />
          <h2 className="fw-bold text-dark mt-3">JOIN DAIRY AUTOMATION</h2>
          <p className="text-muted">Create your account in 2 simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="text-center flex-grow-1">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{
                width: "40px",
                height: "40px",
                background: currentStep >= 1 ? "var(--primary-gradient)" : "#e0e0e0",
                color: "white",
                fontWeight: "bold",
              }}
            >
              1
            </div>
            <div style={{ fontSize: "12px", marginTop: "8px", color: currentStep >= 1 ? "#667eea" : "#b0b0b0" }}>
              Account
            </div>
          </div>

          <div
            style={{
              flex: 1,
              height: "2px",
              background: currentStep >= 2 ? "var(--primary-gradient)" : "#e0e0e0",
              margin: "0 10px 20px",
            }}
          ></div>

          <div className="text-center flex-grow-1">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{
                width: "40px",
                height: "40px",
                background: currentStep >= 2 ? "var(--primary-gradient)" : "#e0e0e0",
                color: "white",
                fontWeight: "bold",
              }}
            >
              2
            </div>
            <div style={{ fontSize: "12px", marginTop: "8px", color: currentStep >= 2 ? "#667eea" : "#b0b0b0" }}>
              Address
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>⚠️</strong> {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError("")}
              aria-label="Close"
            ></button>
          </div>
        )}

        <form onSubmit={currentStep === 1 ? handleNextStep : handleSubmit}>
          {/* STEP 1: Account Information */}
          {currentStep === 1 && (
            <>
              {/* Full Name */}
              <div className="mb-3">
                <label htmlFor="customerName" className="form-label fw-semibold">
                  Full Name
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    id="customerName"
                    type="text"
                    className="form-control border-0 py-2"
                    name="customerName"
                    placeholder="Enter your full name"
                    value={formData.customerName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    id="email"
                    type="email"
                    className="form-control border-0 py-2"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <small className="form-text">We'll never share your email with anyone else.</small>
              </div>

              {/* Phone Number */}
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label fw-semibold">
                  Phone Number
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    id="phoneNumber"
                    type="tel"
                    className="form-control border-0 py-2"
                    name="phoneNumber"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="form-control border-0 py-2"
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn btn-light border-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <>
                    <div
                      style={{
                        height: "4px",
                        background: "#e0e0e0",
                        borderRadius: "10px",
                        marginTop: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(passwordStrength / 4) * 100}%`,
                          background: getPasswordStrengthColor(),
                          transition: "width 0.3s ease",
                        }}
                      ></div>
                    </div>
                    <small className="form-text" style={{ color: getPasswordStrengthColor() }}>
                      Password Strength: {getPasswordStrengthText()}
                    </small>
                  </>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label fw-semibold">
                  Confirm Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-lock-check"></i>
                  </span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control border-0 py-2"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn btn-light border-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                {formData.password && formData.confirmPassword && (
                  <small className="form-text" style={{ color: formData.password === formData.confirmPassword ? "#28a745" : "#dc3545" }}>
                    {formData.password === formData.confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                  </small>
                )}
              </div>

              {/* Next Button */}
              <button
                type="submit"
                className="btn btn-login w-100 fw-semibold py-2"
              >
                Next Step
              </button>
            </>
          )}

          {/* STEP 2: Address Information */}
          {currentStep === 2 && (
            <>
              {/* Building Name */}
              <div className="mb-3">
                <label htmlFor="buildingName" className="form-label fw-semibold">
                  Building Name
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-building"></i>
                  </span>
                  <input
                    id="buildingName"
                    type="text"
                    className="form-control border-0 py-2"
                    name="buildingName"
                    placeholder="Enter building name"
                    value={formData.buildingName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Wing */}
              <div className="mb-3">
                <label htmlFor="wing" className="form-label fw-semibold">
                  Wing/Block (optional)
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-signpost-2"></i>
                  </span>
                  <input
                    id="wing"
                    type="text"
                    className="form-control border-0 py-2"
                    name="wing"
                    placeholder="Enter wing/block"
                    value={formData.wing}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Room Number */}
              <div className="mb-3">
                <label htmlFor="roomNo" className="form-label fw-semibold">
                  Room/Apartment Number
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-door-closed"></i>
                  </span>
                  <input
                    id="roomNo"
                    type="text"
                    className="form-control border-0 py-2"
                    name="roomNo"
                    placeholder="Enter room number"
                    value={formData.roomNo}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Milk Quantity */}
              <div className="mb-3">
                <label htmlFor="milk" className="form-label fw-semibold">
                  Default Milk Quantity (Liters)
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-droplet-fill"></i>
                  </span>
                  <input
                    id="milk"
                    type="number"
                    step="0.5"
                    min="0"
                    className="form-control border-0 py-2"
                    name="defaultMilkQuantityLiters"
                    placeholder="e.g., 1.0"
                    value={formData.defaultMilkQuantityLiters}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Billing Cycle */}
              <div className="mb-4">
                <label htmlFor="billingCycle" className="form-label fw-semibold">
                  Billing Cycle
                </label>
                <select
                  id="billingCycle"
                  className="form-select py-2 border-2"
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleChange}
                  style={{
                    borderColor: "#e0e0e0",
                    borderRadius: "12px",
                  }}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              {/* Terms Checkbox */}
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="terms"
                  defaultChecked
                />
                <label className="form-check-label text-muted" htmlFor="terms">
                  I agree to the <a href="#terms" className="text-primary">Terms of Service</a> and <a href="#privacy" className="text-primary">Privacy Policy</a>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-register flex-grow-1 fw-semibold py-2"
                  onClick={handlePrevStep}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-login flex-grow-1 fw-semibold py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        {/* Login Link */}
        <p className="text-center text-muted mt-4 small">
          Already have an account?{" "}
          <a href="/" className="text-primary fw-semibold text-decoration-none">
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
};

export default CustomerRegister;
