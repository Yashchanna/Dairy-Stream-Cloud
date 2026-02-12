import StatCard from "../StatCard";
import StatusBanner from "../StatusBanner";

import { memo } from "react";

const AdminKpis = memo(function AdminKpis({ data }) {
  return (
    <section className="mb-14">
      <StatusBanner
        activeAgents={data.activeAgents}
        totalAgents={data.totalAgents}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
        <StatCard label="Customers" value={data.totalCustomers} />
        <StatCard label="Active Agents" value={`${data.activeAgents}/${data.totalAgents}`} />
        <StatCard label="Deliveries Today" value={data.deliveriesToday} />
        <StatCard label="Pending Payments" value={`₹${data.pendingPayments}`} />
      </div>
    </section>
  );
  
}
)
export default AdminKpis;
