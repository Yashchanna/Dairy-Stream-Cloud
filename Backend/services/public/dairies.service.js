import { supabase } from "../../config/supabase.js";

/* ---------------- PRODUCTS ---------------- */

const mapProductForPublic = (row = {}) => ({
  id: row.id,
  name: row.name,
  type: row.product_type || "MILK",
  unit: row.unit || "LITER",
  ratePerUnit: Number(row.rate_per_unit || 0),
  stockQuantity: Number(row.stock_quantity || 0),
});

const buildLegacyProductsMap = (items = []) =>
  items.reduce((acc, item) => {
    if (!item?.name) return acc;
    acc[item.name] = Number(item.ratePerUnit || 0);
    return acc;
  }, {});

const getPublicProductsByDairyId = async (dairyId) => {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, product_type, unit, rate_per_unit, stock_quantity, is_active",
    )
    .eq("dairy_id", dairyId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    const message = String(error?.message || "").toLowerCase();
    const isMissingRelation =
      message.includes("relation") && message.includes("does not exist");
    const isMissingColumn =
      message.includes("column") && message.includes("does not exist");

    if (isMissingRelation || isMissingColumn) {
      return {
        productItems: [],
        products: {},
      };
    }

    throw error;
  }

  const productItems = (data || []).map(mapProductForPublic);

  return {
    productItems,
    products: buildLegacyProductsMap(productItems),
  };
};

/* ---------------- DISTANCE HELPER ---------------- */

const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat2 || !lon2) return Infinity;

  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/* ---------------- PUBLIC DAIRIES ---------------- */

export const listPublicDairies = async ({
  search = "",
  lat = null,
  lng = null,
  radius = 10,
  city = null,
  pincode = null,
}) => {
  const PUBLIC_DAIRY_FIELDS =
    "id, dairy_name, category, address, city, state, pincode, image_url, latitude, longitude, service_type, service_pincodes, service_radius, selected_plan, status, created_at";

  let query = supabase
    .from("dairies")
    .select(PUBLIC_DAIRY_FIELDS)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false });

  /* -------- SEARCH -------- */

  if (search) {
    query = query.or(
      `dairy_name.ilike.%${search}%,city.ilike.%${search}%,address.ilike.%${search}%`,
    );
  }

  /* -------- CITY FILTER -------- */

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  /* -------- PINCODE FILTER -------- */

  if (pincode) {
    query = query.eq("pincode", pincode);
  }

  const { data, error } = await query;

  if (error) throw error;

  let dairies = data || [];

  /* -------- GPS RADIUS FILTER -------- */

  if (lat && lng) {
    dairies = dairies
      .map((d) => {
        const distance = getDistance(lat, lng, d.latitude, d.longitude);

        return {
          ...d,
          distance: `${distance.toFixed(1)} km`,
          _distanceValue: distance,
        };
      })
      .filter((d) => d._distanceValue <= radius)
      .sort((a, b) => a._distanceValue - b._distanceValue);
  }

  return dairies;
};

/* ---------------- SINGLE DAIRY ---------------- */

export const getPublicDairyById = async (id) => {
  const PUBLIC_DAIRY_FIELDS =
    "id, dairy_name, category, address, city, state, pincode, image_url, latitude, longitude, service_type, service_pincodes, service_radius, selected_plan, status, created_at";

  const { data, error } = await supabase
    .from("dairies")
    .select(PUBLIC_DAIRY_FIELDS)
    .eq("id", id)
    .single();

  if (error) throw error;

  const productsPayload = await getPublicProductsByDairyId(data.id);

  return {
    ...data,
    ...productsPayload,
  };
};
