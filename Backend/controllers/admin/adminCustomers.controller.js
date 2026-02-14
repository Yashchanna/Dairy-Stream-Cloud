import { getAdminCustomers } from "../../services/admin/adminCustomers.service.js";

export const fetchAdminCustomers = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search || "";

    const result = await getAdminCustomers({ page, limit, search });

    res.json(result);
  } catch (err) {
    console.error("ADMIN CUSTOMERS ERROR:", err.message);
    res.status(500).json({
      message: "Failed to fetch customers",
    });
  }
};

import { getCustomerDetails } from "../../services/admin/adminCustomers.service.js";

export const fetchAdminCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getCustomerDetails(id);

    res.json(data);
  } catch (err) {
    console.error("ADMIN CUSTOMER DETAIL ERROR:", err.message);
    res.status(500).json({
      message: "Failed to load customer details",
    });
  }
};