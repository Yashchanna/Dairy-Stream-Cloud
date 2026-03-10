import { client } from "../client.js";

/**
 * Update agent location and calculate ETA
 */
export const updateAgentLocation = async (deliveryId, latitude, longitude) => {
  const response = await client.post("/agent/deliveries/location/update", {
    deliveryId,
    latitude,
    longitude,
  });
  return response.data;
};

/**
 * Start delivery - sets delivery status to IN_TRANSIT and sends notification
 */
export const startDelivery = async (deliveryId, latitude, longitude) => {
  const response = await client.post("/agent/deliveries/start", {
    deliveryId,
    latitude,
    longitude,
  });
  return response.data;
};

export default {
  updateAgentLocation,
  startDelivery,
};
