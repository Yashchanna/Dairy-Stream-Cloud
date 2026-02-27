import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock3, MapPin, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { fetchPublicDairyById } from "../../api/public.api.js";
import { createCustomerOneTimeOrder } from "../../api/customer.api.js";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";

const toDateInput = (dateValue = new Date()) => {
  const date = new Date(dateValue);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getDefaultBuyOnceDate = () => {
  const now = new Date();
  const eveningCutoff = new Date(now);
  eveningCutoff.setHours(16, 0, 0, 0);
  if (now <= eveningCutoff) return toDateInput(now);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateInput(tomorrow);
};

const getDeliverySlotOptions = (deliveryDate) => {
  const now = new Date();
  const todayIso = toDateInput(now);

  const baseSlots = [
    {
      id: "Morning",
      label: "Morning (6:00 AM - 9:00 AM)",
      cutoffHour: 5,
      cutoffMinute: 30,
    },
    {
      id: "Evening",
      label: "Evening (5:00 PM - 8:00 PM)",
      cutoffHour: 16,
      cutoffMinute: 0,
    },
  ];

  if (!deliveryDate) return baseSlots.map((slot) => ({ ...slot, available: false }));

  if (deliveryDate > todayIso) {
    return baseSlots.map((slot) => ({ ...slot, available: true, reason: "Available" }));
  }

  if (deliveryDate < todayIso) {
    return baseSlots.map((slot) => ({
      ...slot,
      available: false,
      reason: "Past date not allowed",
    }));
  }

  return baseSlots.map((slot) => {
    const cutoff = new Date(now);
    cutoff.setHours(slot.cutoffHour, slot.cutoffMinute, 0, 0);
    const available = now <= cutoff;
    return {
      ...slot,
      available,
      reason: available ? "Available today" : "Cut-off passed for today",
    };
  });
};

const BuyOncePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dairyRaw, setDairyRaw] = useState(null);
  const [form, setForm] = useState({
    milkType: "Full Cream",
    quantity: 1,
    deliveryDate: getDefaultBuyOnceDate(),
    slot: "Morning",
    paymentMethod: "UPI",
    address: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchPublicDairyById(id);
        const dairy = res?.dairy || null;
        setDairyRaw(dairy);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const nextAddress = parsed?.user?.address || parsed?.address || "";
          if (nextAddress) {
            setForm((prev) => ({ ...prev, address: nextAddress }));
          }
        }
      } catch {
        toast.error("Failed to load dairy details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const dairy = useMemo(() => {
    if (!dairyRaw) return null;
    return {
      id: dairyRaw.id,
      name: dairyRaw.dairy_name || dairyRaw.name || "Dairy",
      products: dairyRaw.products || {
        "Full Cream": 64,
        Toned: 54,
        "Cow Milk": 60,
        "Buffalo Milk": 72,
      },
    };
  }, [dairyRaw]);

  useEffect(() => {
    if (!dairy) return;
    if (dairy.products[form.milkType]) return;
    const firstProduct = Object.keys(dairy.products)[0];
    if (firstProduct) {
      setForm((prev) => ({ ...prev, milkType: firstProduct }));
    }
  }, [dairy, form.milkType]);

  const pricePerLiter = useMemo(() => {
    if (!dairy) return 0;
    return dairy.products?.[form.milkType] || 0;
  }, [dairy, form.milkType]);

  const slotOptions = useMemo(() => getDeliverySlotOptions(form.deliveryDate), [form.deliveryDate]);
  const hasAvailableSlot = useMemo(() => slotOptions.some((slot) => slot.available), [slotOptions]);

  useEffect(() => {
    const selected = slotOptions.find((slot) => slot.id === form.slot);
    if (selected?.available) return;
    const firstAvailable = slotOptions.find((slot) => slot.available);
    if (!firstAvailable) return;
    setForm((prev) => ({ ...prev, slot: firstAvailable.id }));
  }, [slotOptions, form.slot]);

  const nextAvailableDate = useMemo(() => {
    if (hasAvailableSlot) return null;
    const base = new Date(`${form.deliveryDate}T00:00:00`);
    if (Number.isNaN(base.getTime())) return null;
    base.setDate(base.getDate() + 1);
    return toDateInput(base);
  }, [hasAvailableSlot, form.deliveryDate]);

  const redirectToLogin = () => {
    navigate("/", { state: { postLoginRedirect: `/buy-once/${id}` } });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to place one-time order");
      redirectToLogin();
      return;
    }

    const selectedSlot = slotOptions.find((slot) => slot.id === form.slot);
    if (!selectedSlot?.available) {
      toast.error("Selected slot is not available. Choose another date/slot.");
      return;
    }

    if (!form.address || form.address.trim().length < 10) {
      toast.error("Please enter a detailed delivery address");
      return;
    }

    const quantity = Number(form.quantity || 0);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    try {
      setSubmitting(true);
      const response = await createCustomerOneTimeOrder({
        dairyId: dairy.id,
        milkType: form.milkType,
        quantity,
        deliveryDate: form.deliveryDate,
        slot: form.slot,
        paymentMethod: form.paymentMethod,
        address: form.address.trim(),
        pricePerLiter,
      });

      localStorage.setItem("guest_dairy_id", String(dairy.id));
      localStorage.setItem("guest_dairy_name", dairy.name);

      toast.success("One-time order placed. Track status in Deliveries.");
      navigate("/customer/dashboard/deliveries", {
        state: {
          from: "buy-once-created",
          orderId: response?.order?.id || null,
        },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to place one-time order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !dairy) {
    return <LoadingIndicator fullScreen message="Loading buy once options..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Buy Once</h1>
            <p className="text-xs text-slate-500">{dairy.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag size={18} /> Choose Product
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {Object.keys(dairy.products).map((variant) => (
              <button
                key={variant}
                onClick={() => setForm((prev) => ({ ...prev, milkType: variant }))}
                className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                  form.milkType === variant ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="font-semibold text-slate-900">{variant}</span>
                <span className="text-blue-700 font-bold">₹{dairy.products[variant]}/L</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={18} /> Delivery Availability
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Quantity (L)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={form.quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                className="mt-1 w-full p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Delivery Date</label>
              <input
                type="date"
                min={toDateInput(new Date())}
                value={form.deliveryDate}
                onChange={(e) => setForm((prev) => ({ ...prev, deliveryDate: e.target.value }))}
                className="mt-1 w-full p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {slotOptions.map((slot) => (
              <button
                key={slot.id}
                onClick={() => slot.available && setForm((prev) => ({ ...prev, slot: slot.id }))}
                disabled={!slot.available}
                className={`p-3 rounded-xl border text-left transition-all ${
                  form.slot === slot.id && slot.available
                    ? "border-blue-600 bg-blue-50"
                    : slot.available
                    ? "border-slate-200 hover:border-blue-200"
                    : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <p className="font-semibold text-sm flex items-center gap-2">
                  <Clock3 size={14} /> {slot.label}
                </p>
                <p className="text-xs mt-1">{slot.reason}</p>
              </button>
            ))}
          </div>

          {!hasAvailableSlot && nextAvailableDate && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              No slots left for this date. Next available delivery starts on {nextAvailableDate}.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                className="mt-1 w-full p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Estimated Total</label>
              <div className="mt-1 w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-blue-700 font-bold">
                ₹{(Number(form.quantity || 0) * pricePerLiter).toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1">
              <MapPin size={12} /> Delivery Address
            </label>
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Enter full delivery address"
              className="mt-1 w-full p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !hasAvailableSlot}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {submitting ? "Placing Order..." : "Place One-Time Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyOncePage;

