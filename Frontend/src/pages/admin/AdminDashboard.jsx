import { useEffect, useMemo, useState } from "react";
import { fetchAdminDashboard, getCachedAdminDashboard } from "../../api/admin.api";

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
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cachedDashboard = useMemo(() => getCachedAdminDashboard(), []);
  const [uiReady, setUiReady] = useState(Boolean(cachedDashboard));


  // ---- Admin name (SYNC, SAFE)
  let adminName = "Admin";
  try {
    const adminUserStr = localStorage.getItem("adminUser");
    if (adminUserStr) {
      const parsed = JSON.parse(adminUserStr);
      adminName = parsed?.name || "Admin";
    }
  } catch {
    adminName = "Admin";
  }

  // ---- Dashboard data (SAFE DEFAULTS)
  const [data, setData] = useState({
    ...(cachedDashboard || {
      dairyName: null,
      totalCustomers: 0,
      totalAgents: 0,
      activeAgents: 0,
      deliveriesToday: 0,
      pendingPayments: 0,
    }),
  });

  const dashboardDisplayName = data?.dairyName || adminName;

  // ---- Fetch dashboard
    useEffect(() => {
      let isMounted = true;

      const loadDashboard = async () => {
        try {
          const res = await fetchAdminDashboard({ forceRefresh: Boolean(cachedDashboard) });
          if (isMounted) {
            setData(res);
            setUiReady(true);
          }
        } catch (err) {
          if (isMounted && !cachedDashboard) {
            setError(err.message);
          }
        }
      };

      loadDashboard();

      return () => {
        isMounted = false;
      };
    }, [cachedDashboard]);


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
        adminName={dashboardDisplayName}
        onMenu={() => setSidebarOpen(true)}
      />

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:ml-64 px-4 sm:px-6 lg:px-10 py-8">
        {!uiReady ? (
          <AdminDashboardSkeleton />
        ) : (
          <>
            <AdminHeader adminName={dashboardDisplayName} />
            <AdminKpis data={data} />
          </>
        )}

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
