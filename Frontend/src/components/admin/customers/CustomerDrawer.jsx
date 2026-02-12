import { useEffect, useState } from "react";
import { fetchAdminCustomerById } from "../../../api/admin.api";

export default function CustomerDrawer({ customerId, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!customerId) return;

    fetchAdminCustomerById(customerId).then(setData);
  }, [customerId]);

  if (!customerId) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-xl animate-slide-in">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Customer Details</h2>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        {!data ? (
          <div className="p-6 text-gray-500">Loading…</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Customer */}
            <div>
              <h3 className="text-sm text-gray-500">Customer</h3>
              <p className="font-medium">{data.customer.customer_name}</p>
              <p className="text-sm text-gray-500">
                {data.customer.phone_number || "—"}
              </p>
            </div>

            {/* Membership */}
            <div>
              <h3 className="text-sm text-gray-500">Membership</h3>
              {data.membership ? (
                <p className="font-medium">
                  Active since{" "}
                  {new Date(data.membership.created_at).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-sm text-gray-400">No membership</p>
              )}
            </div>

            {/* Dairy */}
            <div>
              <h3 className="text-sm text-gray-500">Dairy</h3>
              {data.dairy ? (
                <p className="font-medium">{data.dairy.name}</p>
              ) : (
                <p className="text-sm text-gray-400">Not linked</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
