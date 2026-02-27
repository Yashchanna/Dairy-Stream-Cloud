import { supabase } from "../../config/supabase.js";
import { getSubscriptionByCustomerId } from "./subscription.service.js";

const VALID_ONE_TIME_SLOTS = new Set(["MORNING", "EVENING"]);
const SLOT_WINDOWS = {
  MORNING: "6:00 AM - 9:00 AM",
  EVENING: "5:00 PM - 8:00 PM",
};

const isValidDateString = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const toFiniteNumber = (value, fallback = NaN) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeOneTimeSlot = (value) => {
  const slot = String(value || "").trim().toUpperCase();
  if (slot.startsWith("MOR")) return "MORNING";
  if (slot.startsWith("EVE")) return "EVENING";
  return slot;
};

const toSlotLabel = (slotKey) => {
  if (slotKey === "MORNING") return "Morning";
  if (slotKey === "EVENING") return "Evening";
  return String(slotKey || "").trim() || "-";
};

const getSlotWindow = (slotKey) => SLOT_WINDOWS[String(slotKey || "").toUpperCase()] || null;

const parseOneTimeNotes = (notesValue) => {
  const notes = String(notesValue || "");
  const isOneTimeOrder = notes.includes("[ONE_TIME_ORDER]");
  if (!isOneTimeOrder) {
    return {
      isOneTimeOrder: false,
      slotKey: null,
      paymentMethod: null,
      address: null,
    };
  }

  const slotMatch = notes.match(/slot=([^;]+)/i);
  const paymentMatch = notes.match(/payment=([^;]+)/i);
  const addressMatch = notes.match(/address=(.*)$/i);
  const parsedSlot = normalizeOneTimeSlot(slotMatch?.[1] || "");
  const slotKey = VALID_ONE_TIME_SLOTS.has(parsedSlot) ? parsedSlot : null;

  return {
    isOneTimeOrder: true,
    slotKey,
    paymentMethod: paymentMatch?.[1]?.trim()?.toUpperCase() || null,
    address: addressMatch?.[1]?.trim() || null,
  };
};

const toTitleStatus = (status) => {
  const value = String(status || "").toUpperCase();
  if (value === "DELIVERED" || value === "COMPLETED") return "DELIVERED";
  if (value === "SKIPPED" || value === "CANCELLED") return "SKIPPED";
  if (value === "PENDING") return "PENDING";
  return "PENDING";
};

const formatDateLabel = (value) => {
  if (!value) return "-";
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return "-";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yday = new Date(today);
  yday.setDate(today.getDate() - 1);
  const d = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yday.getTime()) return "Yesterday";
  return target.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const formatTimeLabel = (value) => {
  if (!value) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const getDairyNamesMap = async (rows = []) => {
  const dairyIds = [
    ...new Set(
      (rows || [])
        .map((row) => row?.dairy_id)
        .filter((value) => value !== null && value !== undefined && value !== "")
    ),
  ];

  if (dairyIds.length === 0) return {};

  const { data, error } = await supabase
    .from("dairies")
    .select("id, dairy_name")
    .in("id", dairyIds);

  if (error) {
    const message = String(error?.message || "").toLowerCase();
    const isMissingRelation = message.includes("relation") && message.includes("does not exist");
    const isMissingColumn = message.includes("column") && message.includes("does not exist");
    if (isMissingRelation || isMissingColumn) return {};
    throw error;
  }

  return (data || []).reduce((acc, row) => {
    const key = row?.id;
    if (key != null) acc[String(key)] = row?.dairy_name || `Dairy #${key}`;
    return acc;
  }, {});
};

const mapDeliveryRow = (row, index, fallbackProduct, fallbackQty, dairyNamesMap = {}) => {
  const dateSource = row.delivery_date || row.date || row.created_at || row.updated_at;
  const timeSource = row.delivered_at || row.time || row.updated_at || row.created_at;
  const parsedNotes = parseOneTimeNotes(row?.notes);
  const rowSlot = normalizeOneTimeSlot(row?.delivery_slot || row?.slot || parsedNotes.slotKey || "");
  const slotKey = VALID_ONE_TIME_SLOTS.has(rowSlot) ? rowSlot : null;
  const slotLabel = slotKey ? toSlotLabel(slotKey) : String(row?.delivery_slot || row?.slot || "-");
  const slotWindow = getSlotWindow(slotKey);
  const qty =
    row.quantity_liters ??
    row.qty ??
    row.quantity ??
    fallbackQty ??
    null;
  const product =
    row.milk_type ||
    row.product ||
    fallbackProduct ||
    "Milk";
  const dairyId = row?.dairy_id ?? row?.dairyId ?? null;
  const paymentMethod =
    parsedNotes.paymentMethod || row?.payment_method || row?.method || null;
  const normalizedStatus = toTitleStatus(row.status);

  return {
    id: String(row.id ?? `delivery-${index}`),
    date: formatDateLabel(dateSource),
    deliveryDate: row?.delivery_date || row?.date || null,
    product,
    qty: qty != null ? `${qty} L` : "-",
    status: normalizedStatus,
    time: normalizedStatus === "DELIVERED" ? formatTimeLabel(timeSource) : null,
    dairyId,
    dairyName:
      dairyId == null ? null : dairyNamesMap[String(dairyId)] || `Dairy #${dairyId}`,
    slot: slotLabel || "-",
    slotWindow,
    paymentMethod: paymentMethod || "-",
    address: parsedNotes.address || null,
    isOneTimeOrder: parsedNotes.isOneTimeOrder,
  };
};

const isSameCalendarDay = (dateValue, refDate) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === refDate.getFullYear() &&
    date.getMonth() === refDate.getMonth() &&
    date.getDate() === refDate.getDate()
  );
};

const getTodayDeliveryFromRows = (rows, dairyNamesMap = {}) => {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const now = new Date();

  const todayRow = rows.find((row) =>
    isSameCalendarDay(
      row.delivery_date || row.date || row.created_at || row.updated_at,
      now
    )
  );

  if (!todayRow) return null;

  const normalized = mapDeliveryRow(todayRow, 0, null, null, dairyNamesMap);
  const expectedWindow =
    normalized?.slotWindow && normalized?.slot && normalized.slot !== "-"
      ? `${normalized.slot} (${normalized.slotWindow})`
      : null;

  return {
    status: normalized.status || "PENDING",
    product: normalized.product || "Milk",
    quantity: normalized.qty || "-",
    time: normalized.time || null,
    slot: normalized.slot || "-",
    slotWindow: normalized.slotWindow || null,
    expectedWindow,
    dairyName: normalized.dairyName || null,
    paymentMethod: normalized.paymentMethod || null,
    address: normalized.address || null,
    isOneTimeOrder: Boolean(normalized.isOneTimeOrder),
    agent: null,
    canTrackAgent: false,
  };
};

const getTodayDeliveryFallback = (subscription) => {
  const isActiveSubscription =
    subscription && String(subscription.status || "ACTIVE").toUpperCase() !== "CLOSED";
  const normalizedSlot = normalizeOneTimeSlot(subscription?.delivery_slot);
  const slotKey = VALID_ONE_TIME_SLOTS.has(normalizedSlot) ? normalizedSlot : null;
  const slotLabel = slotKey ? toSlotLabel(slotKey) : String(subscription?.delivery_slot || "-");
  const slotWindow = getSlotWindow(slotKey);
  const expectedWindow =
    slotWindow && slotLabel && slotLabel !== "-" ? `${slotLabel} (${slotWindow})` : null;

  const quantityLabel = isActiveSubscription && subscription?.quantity_liters
    ? `${subscription.quantity_liters} L`
    : "-";

  return {
    status: isActiveSubscription ? "NOT_SCHEDULED" : "NOT_SUBSCRIBED",
    time: null,
    product: isActiveSubscription ? (subscription?.milk_type || "Milk") : "Milk",
    quantity: quantityLabel,
    slot: slotLabel,
    slotWindow,
    expectedWindow,
    dairyName: null,
    paymentMethod: null,
    address: null,
    isOneTimeOrder: false,
    agent: null,
    canTrackAgent: false,
  };
};

const tryFetchFromTable = async (table, customerId) => {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    const message = String(error.message || "").toLowerCase();
    const isMissingRelation = message.includes("relation") && message.includes("does not exist");
    const isMissingColumn = message.includes("column") && message.includes("does not exist");
    if (isMissingRelation || isMissingColumn) return null;
    throw error;
  }

  return data || [];
};

export const getTodayDeliverySnapshot = async (customerId, { subscription } = {}) => {
  const rows =
    (await tryFetchFromTable("deliveries", customerId)) ??
    (await tryFetchFromTable("milk_deliveries", customerId)) ??
    [];
  const dairyNamesMap = await getDairyNamesMap(rows);

  const todayFromRows = getTodayDeliveryFromRows(rows, dairyNamesMap);
  const resolvedSubscription =
    subscription === undefined
      ? await getSubscriptionByCustomerId(customerId)
      : subscription;

  return {
    todayDelivery: todayFromRows || getTodayDeliveryFallback(resolvedSubscription),
    rows,
    dairyNamesMap,
  };
};

export const getCustomerDeliveries = async (customerId) => {
  const subscription = await getSubscriptionByCustomerId(customerId);
  const { rows, todayDelivery, dairyNamesMap } = await getTodayDeliverySnapshot(customerId, {
    subscription,
  });
  const mappedRows = rows.map((row, index) =>
    mapDeliveryRow(row, index, null, null, dairyNamesMap || {})
  );
  return {
    deliveries: mappedRows,
    todayDelivery,
  };
};

export const createOneTimeDeliveryOrder = async (customerId, payload = {}) => {
  const dairyId = Number(payload?.dairyId);
  const milkType = String(payload?.milkType || "").trim();
  const quantity = toFiniteNumber(payload?.quantity);
  const deliveryDate = String(payload?.deliveryDate || "").trim();
  const paymentMethod = String(payload?.paymentMethod || "UPI").trim().toUpperCase();
  const address = String(payload?.address || "").trim();
  const slot = normalizeOneTimeSlot(payload?.slot);
  const pricePerLiter = toFiniteNumber(payload?.pricePerLiter ?? payload?.unitPrice);

  if (!Number.isFinite(dairyId) || dairyId <= 0) {
    throw new Error("Valid dairyId is required");
  }
  if (!milkType) {
    throw new Error("milkType is required");
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("quantity must be greater than zero");
  }
  if (!isValidDateString(deliveryDate)) {
    throw new Error("deliveryDate must be in YYYY-MM-DD format");
  }
  if (!VALID_ONE_TIME_SLOTS.has(slot)) {
    throw new Error("slot must be Morning or Evening");
  }
  if (!address || address.length < 10) {
    throw new Error("Detailed delivery address is required");
  }
  if (!Number.isFinite(pricePerLiter) || pricePerLiter <= 0) {
    throw new Error("pricePerLiter must be greater than zero");
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  if (deliveryDate < todayIso) {
    throw new Error("Cannot place one-time order for a past date");
  }

  const { data: dairy, error: dairyError } = await supabase
    .from("dairies")
    .select("id, dairy_name")
    .eq("id", dairyId)
    .limit(1)
    .maybeSingle();

  if (dairyError) throw dairyError;
  if (!dairy) throw new Error("Selected dairy not found");

  const { data: duplicate, error: duplicateError } = await supabase
    .from("deliveries")
    .select("id")
    .eq("customer_id", customerId)
    .eq("dairy_id", dairyId)
    .eq("delivery_date", deliveryDate)
    .eq("milk_type", milkType)
    .in("status", ["PENDING", "DELIVERED"])
    .limit(1)
    .maybeSingle();

  if (duplicateError) throw duplicateError;
  if (duplicate) {
    throw new Error("A one-time order for this product/date already exists");
  }

  const deliveryNotes = `[ONE_TIME_ORDER] slot=${slot}; payment=${paymentMethod}; address=${address}`.slice(
    0,
    500
  );

  const { data: createdDelivery, error: createDeliveryError } = await supabase
    .from("deliveries")
    .insert({
      customer_id: customerId,
      dairy_id: dairyId,
      delivery_date: deliveryDate,
      milk_type: milkType,
      quantity_liters: quantity,
      status: "PENDING",
      notes: deliveryNotes,
    })
    .select("id, customer_id, dairy_id, delivery_date, milk_type, quantity_liters, status, created_at")
    .single();

  if (createDeliveryError) throw createDeliveryError;

  const amount = Number((quantity * pricePerLiter).toFixed(2));
  const paymentDescription = `One-time order: ${milkType} ${quantity}L (${slot}) for ${deliveryDate}`.slice(
    0,
    300
  );

  const { data: createdPayment, error: createPaymentError } = await supabase
    .from("payments")
    .insert({
      customer_id: customerId,
      dairy_id: dairyId,
      amount,
      status: "PENDING",
      method: paymentMethod,
      description: paymentDescription,
      due_date: deliveryDate,
    })
    .select("id, amount, status, due_date")
    .single();

  if (createPaymentError) throw createPaymentError;

  return {
    order: {
      id: createdDelivery.id,
      dairyId,
      dairyName: dairy.dairy_name || "Dairy",
      deliveryDate,
      milkType,
      quantity,
      slot,
      status: createdDelivery.status || "PENDING",
    },
    payment: createdPayment,
  };
};
