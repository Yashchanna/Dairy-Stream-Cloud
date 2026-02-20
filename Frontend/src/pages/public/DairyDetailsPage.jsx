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
  ChevronRight,
  CreditCard,
  Wallet,
  Banknote,
  Calendar,
  Layers
} from "lucide-react";
import toast from "react-hot-toast";
import { fetchPublicDairyById } from "../../api/public.api.js";
import { fetchCustomerSubscription, saveCustomerSubscription } from "../../api/customer.api.js";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";

const DairyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [existingSubscription, setExistingSubscription] = useState(null);

  // UI States
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form States
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [subscription, setSubscription] = useState({
    milkType: "Full Cream",
    quantity: 1,
    slot: "Morning",
    startDate: new Date().toISOString().slice(0, 10),
  });

  // 1. Load Data on Mount
  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        // Fetch Dairy Info
        const res = await fetchPublicDairyById(id);
        setData(res?.dairy || null);

        // Fetch User's current sub (to prevent double subscription)
        const subRes = await fetchCustomerSubscription(); // ✅ Corrected: No token arg
        setExistingSubscription(subRes?.subscription || null);
        
        // Load User Address from local storage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setAddress(user?.user?.address || user?.address || "");
        }
      } catch (err) {
        toast.error("Error loading dairy details");
      } finally {
        setLoading(false);
      }
    };
    loadPageData();
  }, [id]);

  // 2. Data Mappers
  const dairy = useMemo(() => {
    if (!data) return null;
    return {
      id: data.id,
      name: data.dairy_name || data.name || "Dairy Farm",
      image: data.image_url || "",
      description: data.description || "Fresh milk delivered to your doorstep.",
      address: data.address || data.city || "Address not available",
      rating: data.rating || 4.5,
      // ✅ Dynamic Product List with Prices
      products: data.products || { 
        "Full Cream": 64, 
        "Toned": 54, 
        "Cow Milk": 60,
        "Buffalo Milk": 72 
      },
    };
  }, [data]);

  const currentPrice = useMemo(() => {
    return dairy?.products[subscription.milkType] || 0;
  }, [dairy, subscription.milkType]);

  const isSubscribedToThis = useMemo(() => {
    if (!existingSubscription) return false;
    return String(existingSubscription.dairy_id) === String(id);
  }, [existingSubscription, id]);

  // 3. Handlers
  const handleConfirmSubscription = async () => {
    setSaving(true);
    try {
      await saveCustomerSubscription({ // ✅ Corrected: No token arg
        dairyId: dairy.id,
        milkType: subscription.milkType,
        quantity: Number(subscription.quantity),
        slot: subscription.slot,
        startDate: subscription.startDate,
        address: address,
        paymentMethod: paymentMethod,
        pricePerLiter: currentPrice,
        status: "ACTIVE",
      });

      toast.success("Subscription successful!");
      setStep(4);
    } catch (err) {
      toast.error(err.message || "Failed to subscribe");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingIndicator fullScreen message="Fetching farm details..." />;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">{dairy.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video w-full rounded-[40px] overflow-hidden shadow-2xl bg-slate-200">
            {dairy.image ? (
              <img src={dairy.image} alt={dairy.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No Image Available</div>
            )}
          </div>

          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold mb-4">About this Farm</h2>
            <p className="text-slate-600 leading-relaxed">{dairy.description}</p>
          </section>
        </div>

        {/* Sticky Action Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200 border border-white sticky top-28">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Starting from</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹{currentPrice}</span>
                  <span className="text-slate-400 font-medium">/L</span>
                </div>
              </div>
              <div className="bg-green-500 text-white px-3 py-1 rounded-xl flex items-center gap-1 font-bold">
                {dairy.rating} <Star size={14} fill="white" />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-2xl">
                <ShieldCheck className="text-blue-600" size={20} />
                <span className="text-sm font-semibold">100% Organic & Verified</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-2xl">
                <Truck className="text-blue-600" size={20} />
                <span className="text-sm font-semibold">Free Delivery (6 AM - 9 AM)</span>
              </div>
            </div>

            {isSubscribedToThis ? (
              <button 
                onClick={() => navigate("/customer/subscription")}
                className="w-full bg-green-600 text-white py-5 rounded-[24px] font-bold shadow-xl shadow-green-100 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} /> Active Subscription
              </button>
            ) : (
              <button 
                onClick={() => setShowSubscribe(true)}
                className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
              >
                Subscribe Now <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Stepper Modal */}
      {showSubscribe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold">Setup Subscription</h2>
                <div className="flex gap-1.5 mt-2">
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`} />
                  ))}
                </div>
              </div>
              <button onClick={() => setShowSubscribe(false)} className="p-2 hover:bg-white rounded-full border shadow-sm"><X size={20}/></button>
            </div>

            <div className="p-8">
              {/* Step 1: Product Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Layers size={16}/> Select Variant</label>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.keys(dairy.products).map(variant => (
                        <button 
                          key={variant}
                          onClick={() => setSubscription({...subscription, milkType: variant})}
                          className={`flex justify-between items-center p-4 border-2 rounded-2xl transition-all ${subscription.milkType === variant ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                          <span className="font-bold">{variant}</span>
                          <span className="text-blue-600 font-black">₹{dairy.products[variant]}/L</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Daily Qty (L)</label>
                      <input type="number" step="0.5" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500" value={subscription.quantity} onChange={e => setSubscription({...subscription, quantity: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Time Slot</label>
                      <select className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none" value={subscription.slot} onChange={e => setSubscription({...subscription, slot: e.target.value})}>
                        <option>Morning</option><option>Evening</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={() => setStep(2)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">Continue to Address</button>
                </div>
              )}

              {/* Step 2: Address */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2"><MapPin size={16}/> Delivery Address</label>
                    <textarea value={address} onChange={e => setAddress(e.target.value)} rows={4} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="Flat No, Wing, Society Name..." />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-slate-500">Back</button>
                    <button onClick={() => setStep(3)} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold">Next: Payment</button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method Selection */}
              {step === 3 && (
                <div className="space-y-6">
                  <label className="text-sm font-bold">Preferred Payment Method</label>
                  <div className="space-y-3">
                    {[
                      { id: 'UPI', icon: <Wallet size={20}/>, label: 'UPI (GPay, PhonePe)', sub: 'Instant & Secure' },
                      { id: 'Card', icon: <CreditCard size={20}/>, label: 'Debit / Credit Card', sub: 'Visa, Master, Rupay' },
                      { id: 'COD', icon: <Banknote size={20}/>, label: 'Cash on Delivery', sub: 'Pay monthly at doorstep' }
                    ].map(m => (
                      <button 
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`w-full flex items-center gap-4 p-5 border-2 rounded-2xl transition-all ${paymentMethod === m.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                        <div className={paymentMethod === m.id ? 'text-blue-600' : 'text-slate-400'}>{m.icon}</div>
                        <div className="text-left">
                          <p className="font-bold text-slate-900">{m.label}</p>
                          <p className="text-xs text-slate-500">{m.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-3xl space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal (Daily)</span><span className="font-bold">₹{currentPrice * subscription.quantity}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Delivery Fee</span><span className="text-green-600 font-bold font-xs">FREE</span></div>
                    <div className="pt-2 border-t border-blue-100 flex justify-between"><span className="font-black">Total Payable</span><span className="text-blue-600 font-black">₹{currentPrice * subscription.quantity}</span></div>
                  </div>

                  <button 
                    disabled={saving}
                    onClick={handleConfirmSubscription} 
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:bg-slate-300"
                  >
                    {saving ? "Processing..." : "Confirm & Subscribe"}
                  </button>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <div className="py-10 text-center space-y-6">
                  <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Subscription Started!</h3>
                    <p className="text-slate-500 mt-2">Your first delivery from {dairy.name} arrives tomorrow morning.</p>
                  </div>
                  <button onClick={() => navigate("/customer/subscription")} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Go to Dashboard</button>
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