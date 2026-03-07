import React, { useState, useEffect } from "react";
import { updateAgentLocation, startDelivery } from "../../api/agent/location";
import toast from "react-hot-toast";

const AgentLocationTracker = ({ deliveryId, onETAUpdate }) => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [eta, setEta] = useState(null);
  const [error, setError] = useState(null);

  // Start location tracking
  const startTracking = async () => {
    try {
      setTracking(true);
      setError(null);

      // Get initial location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setLocation({ lat, lng });

      // Start delivery
      const response = await startDelivery(deliveryId, lat, lng);
      setEta(response);

      if (onETAUpdate) {
        onETAUpdate(response);
      }

      // Set up continuous location updates
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setLocation({ lat, lng });

          try {
            const etaResponse = await updateAgentLocation(deliveryId, lat, lng);
            setEta(etaResponse);

            if (onETAUpdate) {
              onETAUpdate(etaResponse);
            }
          } catch (err) {
            console.error("Error updating location:", err);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("Unable to get location. Please enable location services.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } catch (err) {
      console.error("Error starting delivery:", err);
      setError(err.message || "Failed to start delivery");
      toast.error("Failed to start delivery. Please try again.");
      setTracking(false);
    }
  };

  const stopTracking = () => {
    setTracking(false);
    setLocation(null);
    toast.success("Delivery tracking stopped");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold text-lg text-gray-800 mb-4">📍 Location Tracking</h3>

      {/* Tracking Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              tracking ? "bg-green-500 animate-pulse" : "bg-gray-300"
            }`}
          />
          <span className="text-sm text-gray-600">
            {tracking ? "Tracking active" : "Not tracking"}
          </span>
        </div>
      </div>

      {/* Current Location */}
      {location && (
        <div className="bg-blue-50 rounded p-3 mb-4">
          <p className="text-sm text-gray-600">Current Location</p>
          <p className="font-mono text-xs text-blue-700">
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* ETA Display */}
      {eta && (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
          <p className="text-sm text-gray-600">Estimated Time to Customer</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-bold text-green-600">{eta.estimatedMinutes}</span>
            <div>
              <span className="text-gray-600">minutes</span>
              {eta.distance && (
                <div className="text-xs text-gray-500">Distance: {eta.distance} km</div>
              )}
              {eta.confidence && (
                <div className="text-xs text-gray-500">Confidence: {eta.confidence}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!tracking ? (
          <button
            onClick={startTracking}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            🚀 Start Delivery
          </button>
        ) : (
          <button
            onClick={stopTracking}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            ⏹️ Stop Tracking
          </button>
        )}
      </div>

      {/* Tracking Info */}
      {tracking && (
        <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
          <p>📡 Location updates sent every 10 seconds</p>
          <p>Your delivery ETA will be automatically updated</p>
        </div>
      )}
    </div>
  );
};

export default AgentLocationTracker;
