const express = require("express");
const {
  adminLogin,
} = require("../controllers/authentication/admin/auth.controller");
const { verifyAdmin } = require("../middleware/admin.middleware");
const {
  getDashboard,
} = require("../controllers/admin/dashboard.controller");
const {
  fetchAdminCustomers,
  fetchAdminCustomerById,
} = require("../controllers/admin/adminCustomers.controller");

const router = express.Router();

router.post("/login", adminLogin);
router.get("/customers", verifyAdmin, fetchAdminCustomers);
router.get("/customers/:id", verifyAdmin, fetchAdminCustomerById);
router.get("/dashboard", verifyAdmin, getDashboard);

router.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

module.exports = router;
