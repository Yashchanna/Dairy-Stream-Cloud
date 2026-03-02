import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import {
  Search, MapPin, Filter, Star, ShieldCheck,
  Clock, Truck, ChevronDown, User, LogOut, ArrowLeft, LayoutDashboard
} from 'lucide-react';
import { fetchPublicDairies } from '../../api/public.api.js';
import { fetchCustomerSubscription } from '../../api/customer.api.js';
import LoadingIndicator from '../../components/common/LoadingIndicator.jsx';

const DASHBOARD_VISITED_FLAG = "customerDashboardVisited";

const ExploreDairiesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [dairies, setDairies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeSubData, setActiveSubData] = useState(null); // Stores the actual sub object

  // 1. Load Dairies
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchPublicDairies();
        if (active) {
          setDairies(res?.dairies || []);
          setLoadError('');
        }
      } catch (err) {
        if (active) setLoadError('Failed to load dairies');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const isLoggedIn = Boolean(user?.token || user?.role || localStorage.getItem("user"));
  const roleFromStorage = localStorage.getItem("userRole");
  const currentUserRole = String(user?.role || roleFromStorage || "").toUpperCase();
  const isCustomerLoggedIn = isLoggedIn && currentUserRole === "CUSTOMER";

  // 2. Load Subscription State (to find which dairy is subscribed)
  useEffect(() => {
    let active = true;
    const loadSubscriptionState = async () => {
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
    loadSubscriptionState();
    return () => { active = false; };
  }, [isCustomerLoggedIn]);

  // 3. Logic to show subscribed dairy on top
  const mappedDairies = useMemo(() => {
    const list = dairies.map((d) => ({
      id: d.id,
      name: d.dairy_name || d.name || 'Dairy',
      rating: d.rating ?? null,
      reviews: d.reviews ?? null,
      distance: d.distance || '—',
      isVerified: Boolean(d.is_verified),
      isTrusted: Boolean(d.is_trusted),
      slots: Array.isArray(d.slots) && d.slots.length ? d.slots : ['Morning'],
      image: d.image_url || '',
      address: d.address || d.dairy_address || d.city || 'Address not set',
      minPrice: d.min_price ?? 50,
      isSubscribed: activeSubData?.dairy_id === d.id // Check if this is the one
    }));

    // Sort: Subscribed dairy comes first
    return list.sort((a, b) => (a.isSubscribed === b.isSubscribed ? 0 : a.isSubscribed ? -1 : 1));
  }, [dairies, activeSubData]);

  const filteredDairies = mappedDairies.filter(dairy =>
    dairy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dairy.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deliveryLocation = useMemo(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return "Your area";
    try {
      const parsed = JSON.parse(stored);
      const rawAddress = parsed?.user?.address || parsed?.address || "";
      return String(rawAddress).split(",")[0].trim() || "Your area";
    } catch { return "Your area"; }
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
      <header className="bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between md:justify-start gap-6">
              <div className="font-bold text-2xl text-blue-600 tracking-tight">DairyStream</div>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
                <MapPin size={18} className="text-red-500" />
                <div className="text-sm">Delivering to <span className="font-bold">{deliveryLocation}</span></div>
              </div>
            </div>

            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search dairies..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* ENHANCED DASHBOARD BUTTON */}
            <div className="hidden md:block">
              {isCustomerLoggedIn ? (
                <button 
                  onClick={handleAuthAction} 
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                >
                  <LayoutDashboard size={18} />
                  Go to Dashboard
                </button>
              ) : (
                <button onClick={handleAuthAction} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600">
                  {isLoggedIn ? <LogOut size={20} /> : <User size={20} />}
                  {isLoggedIn ? "Logout" : "Login"}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Nearby Dairies</h2>
        {loading ? (
          <LoadingIndicator className="py-20" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDairies.map((dairy) => (
              <div
                key={dairy.id}
                className={`bg-white rounded-2xl shadow-sm border ${dairy.isSubscribed ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-100'} hover:shadow-xl transition-all overflow-hidden group`}
                onClick={() => navigate(`/join/${dairy.id}`)}
              >
                <div className="relative h-48 bg-gray-100">
                  {dairy.image && <img src={dairy.image} alt={dairy.name} className="w-full h-full object-cover" />}
                  
                  {/* SUBSCRIBED BADGE */}
                  {dairy.isSubscribed && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                      Your Active Plan
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold text-gray-800">
                    <Clock size={12} className="inline mr-1"/> {dairy.distance}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{dairy.name}</h3>
                    {dairy.rating && <div className="bg-green-100 px-1.5 py-0.5 rounded text-xs font-bold text-green-700">{dairy.rating} ★</div>}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{dairy.address}</p>
                  <div className="pt-3 border-t flex items-center justify-between">
                    <p className="font-bold text-gray-900">₹{dairy.minPrice}/L</p>
                    <button className={`${dairy.isSubscribed ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'} px-4 py-1.5 rounded-lg text-xs font-bold`}>
                      {dairy.isSubscribed ? 'View Plan' : 'View Details'}
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