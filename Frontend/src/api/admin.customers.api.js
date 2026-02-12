const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").trim();

export const fetchAdminCustomers = async () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin token missing");

  const res = await fetch(`${BASE_URL}/api/admin/customers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to load customers");

  return JSON.parse(text);
};
