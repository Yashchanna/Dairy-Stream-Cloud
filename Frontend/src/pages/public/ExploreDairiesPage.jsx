import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import {
  Search,
  MapPin,
  Star,
  Clock,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { fetchPublicDairies } from "../../api/public.api.js";
import { fetchCustomerSubscription } from "../../api/customer.api.js";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";
import LocationSelector from "../../components/dairy/LocationSelector.jsx";

const CITY_OPTIONS = [
  "Kolkata",
  "Bardhaman",
  "Durgapur",
  "Asansol",
  "Siliguri",
];

const ExploreDairiesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [dairies, setDairies] = useState([]);
  const [globalResults, setGlobalResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showLocation,setShowLocation] = useState(false);

  const [activeSubData, setActiveSubData] = useState(null);

  // ---------- LOCATION ----------
  const getLiveLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          () => reject("Location denied"),
        );
      }
    });
  };

  // ---------- LOAD NEARBY DAIRIES ----------
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);

        let coords = null;

        try {
          coords = await getLiveLocation();
        } catch {
          console.warn("Location unavailable, loading general list");
        }

        const res = await fetchPublicDairies(coords);

        if (active) {
          setDairies(res?.dairies || []);
          setLoadError("");
        }
      } catch {
        if (active) setLoadError("Failed to load dairies");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  // ---------- GLOBAL SEARCH ----------
  useEffect(() => {
    if (!searchTerm.trim()) {
      setGlobalResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetchPublicDairies({
          search: searchTerm,
        });

        setGlobalResults(res?.dairies || []);
      } catch {
        setGlobalResults([]);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  // ---------- CITY FILTER ----------
  useEffect(() => {
    if (!selectedCity) return;

    const loadCity = async () => {
      try {
        setLoading(true);

        const res = await fetchPublicDairies({
          city: selectedCity,
        });

        setGlobalResults(res?.dairies || []);
      } catch {
        setGlobalResults([]);
      } finally {
        setLoading(false);
      }
    };

    loadCity();
  }, [selectedCity]);

  // ---------- AUTH ----------
  const isLoggedIn = Boolean(user?.token || localStorage.getItem("user"));
  const roleFromStorage = localStorage.getItem("userRole");
  const currentUserRole = String(
    user?.role || roleFromStorage || "",
  ).toUpperCase();
  const isCustomerLoggedIn = isLoggedIn && currentUserRole === "CUSTOMER";

  // ---------- SUBSCRIPTION ----------
  useEffect(() => {
    let active = true;

    const loadSubscription = async () => {
      if (!isCustomerLoggedIn) return;

      try {
        const data = await fetchCustomerSubscription();

        const sub = data?.subscription;

        const status = String(sub?.status || "").toUpperCase();

        if (active && sub && status !== "CLOSED") {
          setActiveSubData(sub);
        }
      } catch {
        if (active) setActiveSubData(null);
      }
    };

    loadSubscription();

    return () => {
      active = false;
    };
  }, [isCustomerLoggedIn]);

  // ---------- MAP DAIRIES ----------
  const mappedDairies = useMemo(() => {
    const source = searchTerm || selectedCity ? globalResults : dairies;

    const list = source.map((d) => ({
      id: d.id,
      name: d.dairy_name || "Dairy",
      rating: d.rating ?? null,
      reviews: d.reviews ?? null,
      distance: d.distance || "—",
      image: d.image_url || "",
      address: d.address || d.city || "",
      minPrice: d.min_price ?? 50,
      isSubscribed: activeSubData?.dairy_id === d.id,
    }));

    return list.sort((a, b) =>
      a.isSubscribed === b.isSubscribed ? 0 : a.isSubscribed ? -1 : 1,
    );
  }, [dairies, globalResults, searchTerm, selectedCity, activeSubData]);

  // ---------- LOCATION TEXT ----------
  const deliveryLocation = useMemo(() => {
    const stored = localStorage.getItem("user");

    if (!stored) return "Your area";

    try {
      const parsed = JSON.parse(stored);

      const rawAddress = parsed?.user?.address || parsed?.address || "";

      return String(rawAddress).split(",")[0] || "Your area";
    } catch {
      return "Your area";
    }
  }, []);

  const handleAuthAction = () => {
    if (isCustomerLoggedIn) {
      navigate("/customer/dashboard");
      return;
    }

    isLoggedIn ? (logout(), navigate("/", { replace: true })) : navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ---------- HEADER ---------- */}

      <header className="bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="font-bold text-2xl text-blue-600">
                DairyStream
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowLocation((s) => !s)}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full"
                >
                  <MapPin size={18} className="text-red-500" />

                  <span className="text-sm">
                    Delivering to <b>{deliveryLocation}</b>
                  </span>
                </button>

                {showLocation && (
                  <LocationSelector
                    onApply={(data) => {
                      setShowLocation(false);
                      setSelectedCity(data.city);

                      fetchPublicDairies({
                        city: data.city,
                        pincode: data.pincode,
                        radius: data.radius,
                      });
                    }}
                  />
                )}
              </div>
            </div>

            {/* SEARCH */}

            <div className="flex-1 max-w-2xl relative">
              <Search
                className="absolute left-4 top-3.5 text-gray-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Search dairies anywhere..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedCity(null);
                }}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              {isCustomerLoggedIn ? (
                <button
                  onClick={handleAuthAction}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={handleAuthAction}
                  className="flex items-center gap-2 font-semibold text-gray-700"
                >
                  {isLoggedIn ? <LogOut size={20} /> : <User size={20} />}

                  {isLoggedIn ? "Logout" : "Login"}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ---------- CONTENT ---------- */}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* CITY EXPLORER */}

        <div className="flex gap-3 mb-6 flex-wrap">
          {CITY_OPTIONS.map((city) => (
            <button
              key={city}
              onClick={() => {
                setSelectedCity(city);
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                selectedCity === city ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* SEARCH STATUS */}

        {searchTerm && (
          <p className="text-xs text-gray-500 mb-4 italic">
            Searching dairies across all locations
          </p>
        )}

        {selectedCity && (
          <p className="text-xs text-gray-500 mb-4 italic">
            Showing dairies in {selectedCity}
          </p>
        )}

        {/* GRID */}

        {loading ? (
          <LoadingIndicator className="py-20" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mappedDairies.map((dairy) => (
              <div
                key={dairy.id}
                onClick={() => navigate(`/join/${dairy.id}`)}
                className={`bg-white rounded-2xl shadow-sm border ${
                  dairy.isSubscribed
                    ? "border-blue-500 ring-2 ring-blue-50"
                    : "border-gray-100"
                } hover:shadow-xl transition-all overflow-hidden`}
              >
                <div className="relative h-48 bg-gray-100">
                  {dairy.image && (
                    <img
                      src={dairy.image}
                      alt={dairy.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {dairy.isSubscribed && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black">
                      Your Plan
                    </div>
                  )}

                  <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold">
                    <Clock size={12} className="inline mr-1" />

                    {dairy.distance}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{dairy.name}</h3>

                    {dairy.rating && (
                      <div className="bg-green-100 px-1.5 py-0.5 rounded text-xs font-bold text-green-700">
                        {dairy.rating} ★
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-4">{dairy.address}</p>

                  <div className="pt-3 border-t flex justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase">
                        Starts at
                      </span>

                      <p className="font-bold text-gray-900">
                        ₹{dairy.minPrice}/L
                      </p>
                    </div>

                    <button className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreDairiesPage;
