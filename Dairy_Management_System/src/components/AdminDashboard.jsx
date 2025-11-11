import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    todayDeliveries: 0,
    pendingBills: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Dairy Admin</h1>
        <ul className="space-y-4 text-gray-700">
          <li>Dashboard</li>
          <li>Customers</li>
          <li>Deliveries</li>
          <li>Billing</li>
          <li>Reports</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h2 className="text-xl font-semibold mb-6">Dashboard Overview</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard title="Total Customers" value={stats.totalCustomers} />
          <StatCard title="Today’s Deliveries" value={stats.todayDeliveries} />
          <StatCard title="Pending Bills" value={stats.pendingBills} />
          <StatCard
            title="Monthly Revenue"
            value={`₹${stats.monthlyRevenue.toLocaleString()}`}
          />
        </div>
      </main>
    </div>
  );
}

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
    <h3 className="text-gray-500 text-sm mb-2">{title}</h3>
    <p className="text-2xl font-semibold text-green-700">{value}</p>
  </div>
);

