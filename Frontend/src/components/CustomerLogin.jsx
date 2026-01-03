import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import dairyImage from "../assets/dairyproduct.png";
import '../styles/auth.css';

const CustomerLogin = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!emailOrPhone.trim() || !password.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/customer-dashboard";
      } else {
        setError(data.error || "Invalid email/phone or password");
        setPassword("");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo and Header */}
        <div className="text-center mb-4">
          <img
            src={dairyImage}
            alt="Dairy Delivery"
            className="login-logo"
          />
          <h2 className="fw-bold text-dark mt-3">DAIRY AUTOMATION</h2>
          <p className="text-muted">Fresh Milk Delivery System</p>
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

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Email or Phone Input */}
          <div className="mb-3">
            <label htmlFor="emailOrPhone" className="form-label fw-semibold">
              Email or Phone Number
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                id="emailOrPhone"
                type="text"
                className="form-control border-0 py-2"
                placeholder="Enter email or phone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
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
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="btn btn-light border-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="rememberMe" />
              <label className="form-check-label text-muted" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <a href="#forgot" className="text-primary text-decoration-none fw-semibold">
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn btn-login w-100 fw-semibold py-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider my-4">
          <span>Don't have an account?</span>
        </div>

        {/* Register Link */}
        <p className="text-center mb-0">
          <a href="/register" className="btn btn-register w-100 fw-semibold py-2">
            Create New Account
          </a>
        </p>

        {/* Footer Links */}
        <div className="text-center mt-4">
          <small className="text-muted">
            <a href="#help" className="text-decoration-none me-3">Help</a>
            <a href="#privacy" className="text-decoration-none me-3">Privacy</a>
            <a href="#terms" className="text-decoration-none">Terms</a>
          </small>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
