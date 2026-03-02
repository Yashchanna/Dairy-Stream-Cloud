import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const DASHBOARD_VISITED_FLAG = "customerDashboardVisited";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    // We normalize the data so the role is always accessible at the top level
    const userData = {
      token: data.token,
      role: data.role || data.user?.role, 
      ...data.user,
    };
    const normalizedRole = String(userData.role || "").toUpperCase();

    if (userData.token) {
      if (normalizedRole === "ADMIN") {
        localStorage.setItem("adminToken", userData.token);
      } else if (normalizedRole === "AGENT" || normalizedRole === "STAFF") {
        localStorage.setItem("agentToken", userData.token);
      } else if (normalizedRole === "CUSTOMER") {
        localStorage.setItem("token", userData.token);
      }
    }

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userRole", userData.role);
  };

  const logout = () => {
    setUser(null);
    localStorage.clear(); // Clears all tokens and user data safely
    sessionStorage.removeItem(DASHBOARD_VISITED_FLAG);
    window.location.href = "/login"; // Force redirect to login on logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ ENSURE THIS IS EXPORTED AS A NAMED EXPORT
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
