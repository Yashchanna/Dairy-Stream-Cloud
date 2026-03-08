import { useState, useEffect, useCallback } from "react";
import { getDeliveryETA } from "../api/customer/notification";

/**
 * Custom hook for fetching and auto-refreshing delivery ETA
 * @param {string} deliveryId - Delivery ID
 * @param {number} refreshInterval - Refresh interval in milliseconds (default: 120000 = 2 minutes)
 * @returns {Object} - { eta, loading, error, refresh }
 */
export const useDeliveryETA = (deliveryId, refreshInterval = 120000) => {
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchETA = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDeliveryETA(deliveryId);
      setEta(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch ETA");
      console.error("Error fetching ETA:", err);
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    fetchETA();

    const interval = setInterval(fetchETA, refreshInterval);

    return () => clearInterval(interval);
  }, [deliveryId, refreshInterval, fetchETA]);

  return {
    eta,
    loading,
    error,
    refresh: fetchETA,
  };
};
