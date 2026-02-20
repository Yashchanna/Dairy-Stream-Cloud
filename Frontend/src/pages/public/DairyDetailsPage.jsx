import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  Truck,
  X,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { fetchPublicDairyById } from "../../api/public.api.js";
import { fetchCustomerSubscription, saveCustomerSubscription } from "../../api/customer.api.js";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";

const DairyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [existingSubscription, setExistingSubscription] = useState(null);

  const [showSubscribe, setShowSubscribe] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [address, setAddress] = useState("");
  const [editAddress, setEditAddress] = useState(false);

  const [subscription, setSubscription] = useState({
    milkType: "Full Cream",
    quantity: "1",
    slot: "Morning",
    startDate: new Date().toISOString().slice(0, 10),
  });

  // 1. Fetch Dairy Details
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchPublicDairyById(id);
        if (active) {
          setData(res?.dairy || null);
          setError("");
        }
      } catch (err) {
        if (active) setError("Failed to load dairy details");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  // 2. Fetch Subscription Status (Corrected: No Token Argument)
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        
        // ✅ Interceptor handles the token automatically
        const res = await fetchCustomerSubscription();
        setExistingSubscription(res?.subscription || null);
      } catch {
        setExistingSubscription(null);
      }
    };
    loadSubscription();
  }, [id]);

  // 3. Load Initial User Address
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const userAddress = user?.user?.address || user?.address || "";
        setAddress(userAddress || "");
      } catch {
        setAddress("");
      }
    }
  }, []);

  // 4. Memoized Dairy Object
  const dairy = useMemo(() => {
    if (!data) return null;
    return {
      id: data.id,
      name: data.dairy_name || data.name || "Dairy",
      rating: data.rating ?? null,
      reviews: data.reviews ?? null,
      distance: data.distance || null,
      isVerified: Boolean(data.is_verified),
      image: data.image_url || "",
      address: data.address || data.dairy_address || data.city || "Address not set",
      minPrice: data.min_price ?? null,
      description: data.description || data.dairy_description || "No description provided.",
      phone: data.dairy_phone || data.phone || "-",
      email: data.dairy_email || data.email || "-",
    };
  }, [data]);

  const isSubscribed = useMemo(() => {
    if (!existingSubscription) return false;
    return String(existingSubscription.dairy_id || existingSubscription.dairyId) === String(id);
  }, [existingSubscription, id]);

  // Handlers
  const handleOpenSubscribe = () => {
    setStep(1);
    setPaymentMethod("UPI");
    setEditAddress(false);
    setShowSubscribe(true);
  };

  const handleCloseSubscribe = () => setShowSubscribe(false);

  const handleSubscriptionChange = (e) => {
    const { name, value } = e.target;
    setSubscription((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinueFromStep1 = () => {
    if (!subscription.startDate) {
      toast.error("Please select a start date");
      return;
    }
    setStep(2);
  };

  const handleContinueFromStep2 = () => {
    if (!address || address.trim().length < 5) {
      toast.error("Please provide a valid address");
      return;
    }
    setStep(3);
  };

  // 5. Submit Subscription (Corrected: Token removal prevents JSON Crash)
  const handleConfirmSubscription = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.error("Please login to subscribe");
        return;
      }

      // ✅ FIX: Removed 'token'. Passing ONLY the data object.
      await saveCustomerSubscription({
        dairyId: dairy.id,
        milkType: subscription.milkType,
        quantity: subscription.quantity,
        slot: subscription.slot,
        startDate: subscription.startDate,
        address,
        paymentMethod,
        status: "ACTIVE",
      });

      toast.success("Subscription successful!");
      setStep(4);
      setExistingSubscription({ dairy_id: dairy.id, dairyId: dairy.id });
    } catch (err) {
      toast.error(err?.message || "Failed to save subscription");
    }
  };

  if (loading) return <LoadingIndicator fullScreen message="Loading dairy details..." />;
  if (error || !dairy) return <div className="min-h-screen flex items-center justify-center text-gray-500">{error || "Dairy not found"}</div>;

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans pb-20">
      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{dairy.name}</h1>
              {dairy.isVerified && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  <ShieldCheck size={10} /> Verified Dairy
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery Mockup */}
            <div className="relative aspect-[16/9] w-full bg-gray-200 rounded-3xl overflow-hidden shadow-inner group">
              {dairy.image ? (
                <img src={dairy.image} alt={dairy.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Truck size={48} strokeWidth={1} />
                  <span className="text-sm mt-2">Image Gallery coming soon</span>
                </div>
              )}
            </div>

            {/* Content Sections */}
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About the Farm</h2>
              <p className="text-gray-600 leading-relaxed text-base">{dairy.description}</p>
            </section>

            <div className="grid md:grid-cols-2 gap-6">
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <Clock size={18} className="text-blue-500" /> Availability
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Morning Slot</span><span className="font-medium">6:00 AM - 9:00 AM</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Evening Slot</span><span className="font-medium">5:00 PM - 8:00 PM</span></div>
                </div>
              </section>

              <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-red-500" /> Delivery Area
                </h2>
                <p className="text-sm text-gray-600 mb-2">{dairy.address}</p>
                <div className="h-24 w-full bg-slate-50 rounded-xl border border-dashed flex items-center justify-center text-xs text-gray-400">
                  Map Preview Component
                </div>
              </section>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-blue-50 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500">Starting Price</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-gray-900">₹{dairy.minPrice}</span>
                    <span className="text-gray-500 text-sm">/Liter</span>
                  </div>
                </div>
                {dairy.rating && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-xl flex items-center gap-1 font-bold shadow-lg shadow-green-100">
                    {dairy.rating} <Star size={14} fill="white" />
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                    <ShieldCheck size={18} className="text-blue-600" />
                    <span>Pure & Untouched Milk</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                    <Truck size={18} className="text-blue-600" />
                    <span>Free Home Delivery</span>
                 </div>
              </div>

              {isSubscribed ? (
                <button 
                  onClick={() => navigate("/customer/subscription")}
                  className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> Already Subscribed
                </button>
              ) : (
                <button 
                  onClick={handleOpenSubscribe}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
                >
                  Subscribe Now <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <p className="text-[10px] text-center text-gray-400 mt-4 px-4 uppercase tracking-tighter">
                Cancel or pause your subscription anytime from dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal Wrapper */}
      {showSubscribe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={handleCloseSubscribe} />
          <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configure Plan</h2>
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4].map(s => (
                    <div key={s} className={`h-1.5 rounded-full transition-all ${step >= s ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'}`} />
                  ))}
                </div>
              </div>
              <button onClick={handleCloseSubscribe} className="p-2 hover:bg-white rounded-full transition-colors border shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Select Milk Type</label>
                    <select 
                      name="milkType" 
                      value={subscription.milkType} 
                      onChange={handleSubscriptionChange}
                      className="w-full border-2 border-gray-100 p-4 rounded-2xl bg-white focus:border-blue-500 outline-none transition-all appearance-none"
                    >
                      <option>Full Cream</option><option>Toned</option><option>Double Toned</option><option>Buffalo Milk</option><option>Cow Milk</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Quantity (L)</label>
                      <input 
                        type="number" step="0.5" name="quantity" 
                        value={subscription.quantity} onChange={handleSubscriptionChange}
                        className="w-full border-2 border-gray-100 p-4 rounded-2xl bg-white focus:border-blue-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Slot</label>
                      <select name="slot" value={subscription.slot} onChange={handleSubscriptionChange} className="w-full border-2 border-gray-100 p-4 rounded-2xl bg-white focus:border-blue-500 outline-none">
                        <option>Morning</option><option>Evening</option>
                      </select>
                    </div>
                  </div>

                  <button onClick={handleContinueFromStep1} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-colors">
                    Continue to Address
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Delivery Address</label>
                    <textarea 
                      value={address} onChange={(e) => setAddress(e.target.value)} 
                      className="w-full border-2 border-gray-100 p-4 rounded-2xl bg-white focus:border-blue-500 outline-none" rows={4}
                      placeholder="Flat No, Building, Area..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200">Back</button>
                    <button onClick={handleContinueFromStep2} className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black">Review & Pay</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Dairy</span><span className="font-bold">{dairy.name}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Subscription</span><span className="font-bold">{subscription.quantity}L {subscription.milkType}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Starts From</span><span className="font-bold">{subscription.startDate}</span></div>
                    <div className="pt-3 border-t flex justify-between"><span className="font-bold">Total Daily</span><span className="font-black text-blue-600">₹{dairy.minPrice * subscription.quantity}</span></div>
                  </div>
                  <button onClick={handleConfirmSubscription} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200">
                    Confirm & Start Delivery
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="text-center py-6 space-y-6">
                  <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">Subscription Active!</h3>
                  <p className="text-gray-500">Your first delivery will arrive on {subscription.startDate}</p>
                  <button onClick={() => navigate("/customer/subscription")} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold">
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DairyDetailsPage;