import React, { useState, useEffect } from "react";
import { subscribeToPush } from "../../api/customer/notification";
import toast from "react-hot-toast";

const NotificationPrompt = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user already dismissed this
    const isDismissed = localStorage.getItem("notification-dismissed");
    
    if (!isDismissed && permission === "default") {
      setShowPrompt(true);
    }
  }, [permission]);

  const handleEnableNotifications = async () => {
    try {
      // Request permission
      const granted = await Notification.requestPermission();
      setPermission(granted);

      if (granted === "granted") {
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_KEY,
        });

        // Send subscription to backend
        await subscribeToPush(subscription.toJSON());

        toast.success("🔔 Notifications enabled! You'll receive delivery updates.");
        setShowPrompt(false);
      } else if (granted === "denied") {
        toast.warning("Notifications blocked. You can enable them in browser settings.");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Failed to enable notifications. Please try again.");
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("notification-dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt || permission !== "default") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border-l-4 border-blue-500 p-4 max-w-sm z-50">
      <div className="flex items-start gap-3">
        <span className="text-3xl">🔔</span>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">Enable Notifications</h3>
          <p className="text-sm text-gray-600 mt-1">
            Get real-time notifications when your delivery is on the way and when it's completed.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEnableNotifications}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-medium"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
