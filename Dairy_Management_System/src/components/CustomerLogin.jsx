import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import dairyImage from "../assets/dairyproduct.png";

const CustomerLogin = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Save token (optional, for later authentication)
        localStorage.setItem("token", data.token);
        // Redirect to new page (e.g., dashboard)
        window.location.href = "/customer-dashboard";
      } else {
        // If login fails, just reload or reset fields
        setPassword("");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div
      className="bg-light d-flex flex-column align-items-center justify-content-center min-vh-100"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="bg-white rounded-4 shadow p-4 w-100" style={{ maxWidth: "400px" }}>
        <img
          src={dairyImage}
          alt="Dairy Delivery"
          className="d-block mx-auto mb-3"
          style={{ width: "7rem" }}
        />

        <h2 className="text-center fw-bold text-dark mb-1">DAIRY AUTOMATION SYSTEM</h2>
        <h5 className="text-center text-secondary mb-4">Customer Login</h5>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Email or Phone Number"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn w-100 fw-semibold text-white"
            style={{
              background: "linear-gradient(to right, #7e22ce, #3b82f6)",
              border: "none",
            }}
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerLogin;
