import client from "./client"; // ✅ Use the centralized client

/**
 * Fetch all public dairies with optional search filtering.
 */
export const fetchPublicDairies = async ({ search = "" } = {}) => {
  const { data } = await client.get("/dairies", {
    params: { search }, // ✅ Axios automatically builds the query string
  });
  return data;
};

/**
 * Fetch details for a specific dairy by its ID.
 */
export const fetchPublicDairyById = async (id) => {
  const { data } = await client.get(`/dairies/${id}`);
  return data;
};