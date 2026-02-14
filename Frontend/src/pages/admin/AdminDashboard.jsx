import { useEffect, useState } from "react";
import { fetchAdminDashboard } from "../../api/admin.api";

import AdminSidebar from "../../components/admin/layout/AdminSidebar";
import AdminMobileTopbar from "../../components/admin/layout/AdminMobileTopbar";

import AdminHeader from "../../components/admin/sections/AdminHeader";
import AdminKpis from "../../components/admin/sections/AdminKpis";
import AdminOperations from "../../components/admin/sections/AdminOperations";
import AdminFinancialAlert from "../../components/admin/sections/AdminFinancialAlert";
import AdminActivity from "../../components/admin/sections/AdminActivity";
import AdminDashboardSkeleton from "../../components/admin/skeletons/AdminDashboardSkeleton";

export default function AdminDashboard() {
  // ---- UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [uiReady, setUiReady] = useState(false);


  // ---- Admin name (SYNC, SAFE)
  const adminUserStr = localStorage.getItem("adminUser");
  const adminName = adminUserStr
    ? JSON.parse(adminUserStr).name
    : "Admin";

  // ---- Dashboard data (SAFE DEFAULTS)
  const [data, setData] = useState({
    totalCustomers: 0,
    totalAgents: 0,
    activeAgents: 0,
    deliveriesToday: 0,
    pendingPayments: 0,
  });

  // ---- Fetch dashboard
    useEffect(() => {
      let isMounted = true;

      const loadDashboard = async () => {
        try {
          const res = await fetchAdminDashboard();
          if (isMounted) {
            setData(res);
            requestAnimationFrame(() => {
              setUiReady(true);
            });
          }
        } catch (err) {
          if (isMounted) setError(err.message);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      loadDashboard();

      return () => {
        isMounted = false;
      };
    }, []);


  // ---- Error UI
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 p-5 rounded-xl text-red-700">
          {error}
        </div>
      </div>
    );
  }

  // ---- Main UI
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminMobileTopbar
        adminName={adminName}
        onMenu={() => setSidebarOpen(true)}
      />

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:ml-64 px-4 sm:px-6 lg:px-10 py-8">
      <AdminHeader adminName={adminName} />

{/* Phase 1: Skeleton / KPIs */}
        {!uiReady ? (
          <AdminDashboardSkeleton />
        ) : (
          <AdminKpis data={data} />
        )}

        {/* Phase 2: Heavy sections */}
        {uiReady && (
          <>
            <AdminOperations data={data} />
            <AdminFinancialAlert amount={data.pendingPayments} />
            <AdminActivity />
          </>
        )}


      </main>
    </div>
  );
}
