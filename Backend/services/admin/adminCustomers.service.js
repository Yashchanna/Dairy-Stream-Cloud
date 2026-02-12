import { supabase } from "../../config/supabase.js";

export const getAdminCustomers = async ({
  page = 1,
  limit = 10,
  search = "",
}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,phone_number.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    customers: data,
    total: count,
    page,
    limit,
  };
};

export const getCustomerDetails = async (customerId) => {
  // Customer
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  if (customerError) throw customerError;

  // Membership (supports multiple possible customer id column names)
  let membership = null;
  const membershipCustomerColumns = ["customer_id", "customerid", "customerId", "user_id"];
  for (const column of membershipCustomerColumns) {
    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .eq(column, customerId)
      .limit(1)
      .maybeSingle();

    if (!error) {
      membership = data ?? null;
      break;
    }

    const message = String(error.message || "").toLowerCase();
    const isMissingColumn = message.includes("column") && message.includes("does not exist");
    const isUuidTypeMismatch = message.includes("invalid input syntax for type uuid");
    if (!isMissingColumn && !isUuidTypeMismatch) throw error;
  }

  // Dairy
  let dairy = null;
  if (membership?.dairy_id) {
    const { data } = await supabase
      .from("dairies")
      .select("*")
      .eq("id", membership.dairy_id)
      .single();
    dairy = data;
  }

  return {
    customer,
    membership,
    dairy,
  };
};
