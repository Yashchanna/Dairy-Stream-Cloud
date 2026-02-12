import { useEffect, useState } from "react";
import { useAuth } from "./useAuth.jsx";

export const useCustomerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // 🔧 TEMP DATA (until backend API exists)
        const mockResponse = {
          customer: {
            id: user?.user?.id ?? null,
            name:
              user?.user?.customer_name ||
              user?.user?.name ||
              "Customer",
            email: user?.user?.email || "-",
            phone: user?.user?.phone_number || user?.user?.phone || "-",
            dairy: user?.user?.dairy || "Not assigned",
          },
          todayDelivery: {
            status: "DELIVERED",
            time: "07:15 AM",
            product: "Buffalo Milk",
            quantity: "1.5 L",
          },
          tomorrowDelivery: {
            quantity: "1.5 Liters",
            slot: "Morning (6:00 - 8:00 AM)",
          },
          billing: {
            monthlyDue: 1200,
            walletBalance: 450,
            dueInDays: 5,
          },
        };

        // simulate API delay
        setTimeout(() => {
          setData(mockResponse);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError("Failed to load dashboard");
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  return { data, loading, error };
};
