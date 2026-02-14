import { memo } from "react";

const AdminOperations = memo(function AdminOperations({ data }) {

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
      <div className="bg-white rounded-xl border p-6">
        <h4 className="text-sm font-medium mb-2">Delivery Overview</h4>
        <div className="flex justify-between text-sm">
          <span>Total Deliveries</span>
          <span className="font-medium">{data.deliveriesToday}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h4 className="text-sm font-medium mb-2">Agent Availability</h4>
        <div className="flex justify-between text-sm">
          <span>Active</span>
          <span className="font-medium">{data.activeAgents}</span>
        </div>
      </div>
    </section>
  );
}
)
export default AdminOperations;
