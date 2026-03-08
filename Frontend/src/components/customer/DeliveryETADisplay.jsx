import React, { useState, useEffect } from "react";
import { getDeliveryETA } from "../../api/customer/notification";

const DeliveryETADisplay = ({ deliveryId }) => {
  const [etaData, setEtaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchETA = async () => {
      try {
        setLoading(true);
        const data = await getDeliveryETA(deliveryId);
        setEtaData(data);
        setError(null);
      } catch (err) {
        setError("Unable to fetch delivery ETA");
        console.error("ETA Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchETA();

    // Refresh ETA every 2 minutes
    const interval = setInterval(fetchETA, 120000);

    return () => clearInterval(interval);
  }, [deliveryId]);

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <p className="text-center text-gray-600">Loading ETA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
        <p className="text-center text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!etaData) return null;

  // COMPLETED status
  if (etaData.status === "COMPLETED") {
    return (
      <div className="bg-green-50 border border-green-300 rounded-lg p-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="font-bold text-green-700">Delivery Completed</h3>
            <p className="text-sm text-green-600">Your order has been delivered</p>
          </div>
        </div>
      </div>
    );
  }

  // FAILED status
  if (etaData.status === "FAILED") {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">❌</span>
          <div>
            <h3 className="font-bold text-red-700">Delivery Failed</h3>
            <p className="text-sm text-red-600">{etaData.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // No ETA available yet
  if (!etaData.eta) {
    return (
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏳</span>
          <div>
            <h3 className="font-bold text-yellow-700">ETA Not Available</h3>
            <p className="text-sm text-yellow-600">{etaData.message || "Agent will start soon"}</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate remaining minutes
  const remainingMinutes = etaData.remainingMinutes || 0;
  const etaTime = new Date(etaData.eta).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-300 rounded-lg p-4 mt-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-3xl">🚚</span>
          <div className="flex-1">
            <h3 className="font-bold text-blue-800 text-lg">Delivery On The Way</h3>
            
            {/* ETA Minutes */}
            <div className="mt-2">
              <p className="text-gray-600 text-sm">Estimated Arrival Time</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-bold text-blue-700">{remainingMinutes}</span>
                <span className="text-gray-600">minutes away</span>
              </div>
              <p className="text-xs text-gray-500">Around {etaTime}</p>
            </div>

            {/* Distance */}
            {etaData.remainingDistance !== null && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-gray-600 text-sm">Distance</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">📍</span>
                  <p className="font-semibold text-blue-700">{etaData.remainingDistance} km away</p>
                </div>
              </div>
            )}

            {/* Last Updated */}
            {etaData.lastUpdated && (
              <p className="text-xs text-gray-500 mt-2">
                Updated {new Date(etaData.lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="ml-4">
          <span className="inline-block bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded">
            Live
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeliveryETADisplay;
