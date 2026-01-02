import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import dairyImage from "../assets/dairyproduct.png";

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/customer/addCustomer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // ✅ Registration Success → Go to Login
        window.location.href = "/";
      } else {
        const data = await response.json();
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error registering:", error);
      alert("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-light d-flex flex-column align-items-center justify-content-center min-vh-100"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div
        className="bg-white rounded-4 shadow p-4 w-100"
        style={{ maxWidth: "500px" }}
      >
        <img
          src={dairyImage}
          alt="Dairy Delivery"
          className="d-block mx-auto mb-3"
          style={{ width: "7rem" }}
        />

        <h2 className="text-center fw-bold text-dark mb-1">
          DAIRY AUTOMATION SYSTEM
        </h2>
        <h5 className="text-center text-secondary mb-4">
          Customer Registration
        </h5>

        <form onSubmit={handleSubmit}>
          {/* Customer Name */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="customerName"
              placeholder="Full Name"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* Building Name */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="buildingName"
              placeholder="Building Name"
              value={formData.buildingName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Wing */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="wing"
              placeholder="Wing (optional)"
              value={formData.wing}
              onChange={handleChange}
            />
          </div>

          {/* Room Number */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="roomNo"
              placeholder="Room Number"
              value={formData.roomNo}
              onChange={handleChange}
              required
            />
          </div>

          {/* Milk Quantity
          <div className="mb-3">
            <input
              type="number"
              className="form-control"
              name="defaultMilkQuantityLiters"
              placeholder="Milk Quantity (Liters)"
              step="0.1"
              min="0"
              value={formData.defaultMilkQuantityLiters}
              onChange={handleChange}
              required
            />
          </div> */}

          {/* Extra Product */}
          {/* <div className="mb-3">
            <select
              className="form-select"
              name="defaultExtraProduct"
              value={formData.defaultExtraProduct}
              onChange={handleChange}
              required
            >
              <option value="None">No Extra Product</option>
              <option value="Curd">Curd</option>
              <option value="Butter">Butter</option>
              <option value="Paneer">Paneer</option>
              <option value="Chaas">Chaas</option>
            </select>
          </div> */}

          {/* Extra Product Quantity */}
          {/* <div className="mb-3">
            <input
              type="number"
              className="form-control"
              name="defaultExtraProductQuantity"
              placeholder="Extra Product Quantity"
              min="0"
              value={formData.defaultExtraProductQuantity}
              onChange={handleChange}
              required
            />
          </div> */}

          {/* Billing Cycle */}
          {/* <div className="mb-4">
            <select
              className="form-select"
              name="billingCycle"
              value={formData.billingCycle}
              onChange={handleChange}
              required
            >
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Daily">Daily</option>
            </select>
          </div> */}

          {/* Register Button */}
          <button
            type="submit"
            className="btn w-100 fw-semibold text-white"
            style={{
              background: "linear-gradient(to right, #16a34a, #22c55e)",
              border: "none",
            }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-secondary mt-3 small">
          Already registered?{" "}
          <a
            href="/"
            className="text-primary fw-semibold text-decoration-none"
          >
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
};

export default CustomerRegister;
