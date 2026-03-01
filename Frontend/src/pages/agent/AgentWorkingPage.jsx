import React, { useState, useEffect } from 'react';
import AgentLayout from '../../components/agent/AgentLayout';
import DeliveryCard from '../../components/agent/DeliveryCard';
import DeliveryDetailsModal from '../../components/agent/DeliveryDetailsModal';
import FailedReasonModal from '../../components/agent/FailedReasonModal';
import { Filter } from 'lucide-react';
import {
  fetchAssignedAgentDeliveries,
  updateAssignedAgentDeliveryStatus,
} from "../../api/agent.api";

const AgentWorkingPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [failedDelivery, setFailedDelivery] = useState(null);

  useEffect(() => {
    const loadDeliveries = async () => {
      try {
        const payload = await fetchAssignedAgentDeliveries();
        setDeliveries(payload || []);
      } catch (_err) {
        setDeliveries([]);
      }
    };
    loadDeliveries();
  }, []);

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'ALL') return true;
    return delivery.status === filter;
  });

  const handleStatusChange = async (deliveryId, newStatus) => {
    if (newStatus === 'FAILED') {
      const delivery = deliveries.find((d) => String(d.id) === String(deliveryId));
      setFailedDelivery(delivery);
    } else {
      setDeliveries((prev) =>
        prev.map((d) =>
          String(d.id) === String(deliveryId) ? { ...d, status: newStatus } : d
        )
      );
      try {
        await updateAssignedAgentDeliveryStatus({
          deliveryId,
          status: newStatus,
        });
      } catch (_err) {
        // Keep local state update for now to avoid blocking operator flow.
      }
    }
  };

  const handleFailedSubmit = async ({ reason, imagePreview }) => {
    if (!failedDelivery?.id) return;
    const deliveryId = failedDelivery.id;

    setDeliveries((prev) =>
      prev.map((d) =>
        String(d.id) === String(deliveryId)
          ? { ...d, status: 'FAILED', failedReason: reason, failedImage: imagePreview }
          : d
      )
    );
    setFailedDelivery(null);
    try {
      await updateAssignedAgentDeliveryStatus({
        deliveryId,
        status: "FAILED",
        reason,
      });
    } catch (_err) {
      // Keep local state update for now to avoid blocking operator flow.
    }
  };

  const stats = {
    all: deliveries.length,
    completed: deliveries.filter(d => d.status === 'COMPLETED').length,
    pending: deliveries.filter(d => d.status === 'PENDING').length,
    failed: deliveries.filter(d => d.status === 'FAILED').length,
  };

  return (
    <AgentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Delivery Working Page</h2>
            <p className="text-gray-600">Manage your deliveries</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-200 flex flex-wrap gap-2">
          {[
            { key: 'ALL', label: 'All', count: stats.all },
            { key: 'PENDING', label: 'Pending', count: stats.pending },
            { key: 'COMPLETED', label: 'Completed', count: stats.completed },
            { key: 'FAILED', label: 'Failed', count: stats.failed },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === tab.key
                  ? 'bg-white text-blue-500'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Deliveries List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeliveries.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-12 text-center border border-gray-200">
              <Filter className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No deliveries found</p>
            </div>
          ) : (
            filteredDeliveries.map(delivery => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onStatusChange={handleStatusChange}
                onClick={setSelectedDelivery}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedDelivery && (
        <DeliveryDetailsModal
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
        />
      )}

      {failedDelivery && (
        <FailedReasonModal
          delivery={failedDelivery}
          onSubmit={handleFailedSubmit}
          onClose={() => setFailedDelivery(null)}
        />
      )}
    </AgentLayout>
  );
};

export default AgentWorkingPage;
