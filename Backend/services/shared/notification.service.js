import { supabase } from "../../config/supabase.js";
import { sendNotification } from "../../push/sendNotification.js";

/**
 * Save customer push notification subscription
 */
export const savePushSubscription = async (customerId, subscription) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .update({
        push_subscription: subscription,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId)
      .select("id")
      .single();

    if (error) throw error;

    return { success: true, customerId: data.id };
  } catch (error) {
    console.error("Error saving push subscription:", error);
    throw error;
  }
};

/**
 * Get customer push subscription
 */
export const getCustomerSubscription = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("push_subscription")
      .eq("id", customerId)
      .single();

    if (error) throw error;

    return data?.push_subscription || null;
  } catch (error) {
    console.error("Error fetching customer subscription:", error);
    return null;
  }
};

/**
 * Send delivery completion notification to customer
 */
export const sendDeliveryCompletionNotification = async (deliveryId) => {
  try {
    // Fetch delivery details
    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .select(`
        id,
        customer_id,
        quantity,
        customer_name,
        address
      `)
      .eq("id", deliveryId)
      .single();

    if (deliveryError || !delivery) {
      console.error("Delivery not found for notification:", deliveryId);
      return;
    }

    // Get customer subscription
    const subscription = await getCustomerSubscription(delivery.customer_id);
    if (!subscription) {
      console.log("No subscription for customer:", delivery.customer_id);
      return;
    }

    const payload = {
      notification: {
        title: "✅ Delivery Completed!",
        body: `Your ${delivery.quantity}L milk delivery has been completed.`,
        icon: "/icons/delivery-complete.png",
        badge: "/icons/badge.png",
      },
      data: {
        type: "DELIVERY_COMPLETED",
        deliveryId: deliveryId.toString(),
        timestamp: new Date().toISOString(),
        actionUrl: `/deliveries/${deliveryId}`,
      },
      actions: [
        {
          action: "RATE",
          title: "Rate Delivery",
        },
        {
          action: "VIEW",
          title: "View Details",
        },
      ],
    };

    await sendNotification(subscription, payload);
    console.log("Delivery completion notification sent to customer:", delivery.customer_id);
  } catch (error) {
    console.error("Error sending delivery completion notification:", error);
  }
};

/**
 * Send ETA update notification to customer
 */
export const sendETAUpdateNotification = async (deliveryId, etaMinutes) => {
  try {
    // Fetch delivery details
    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .select(`
        id,
        customer_id,
        estimated_arrival_time,
        customer_name,
        quantity
      `)
      .eq("id", deliveryId)
      .single();

    if (deliveryError || !delivery) {
      console.error("Delivery not found for ETA notification:", deliveryId);
      return;
    }

    // Get customer subscription
    const subscription = await getCustomerSubscription(delivery.customer_id);
    if (!subscription) {
      console.log("No subscription for customer:", delivery.customer_id);
      return;
    }

    const payload = {
      notification: {
        title: "🕐 Delivery ETA Updated",
        body: `Your delivery will arrive in approximately ${etaMinutes} minutes.`,
        icon: "/icons/eta-update.png",
        badge: "/icons/badge.png",
      },
      data: {
        type: "ETA_UPDATE",
        deliveryId: deliveryId.toString(),
        eta: delivery.estimated_arrival_time,
        etaMinutes: etaMinutes.toString(),
        timestamp: new Date().toISOString(),
        actionUrl: `/deliveries/${deliveryId}`,
      },
    };

    await sendNotification(subscription, payload);
    console.log("ETA notification sent to customer:", delivery.customer_id);
  } catch (error) {
    console.error("Error sending ETA notification:", error);
  }
};

/**
 * Send delivery started notification
 */
export const sendDeliveryStartedNotification = async (deliveryId) => {
  try {
    // Fetch delivery details
    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .select(`
        id,
        customer_id,
        customer_name,
        estimated_arrival_time,
        quantity
      `)
      .eq("id", deliveryId)
      .single();

    if (deliveryError || !delivery) {
      console.error("Delivery not found for started notification:", deliveryId);
      return;
    }

    // Get customer subscription
    const subscription = await getCustomerSubscription(delivery.customer_id);
    if (!subscription) {
      console.log("No subscription for customer:", delivery.customer_id);
      return;
    }

    const etaTime = new Date(delivery.estimated_arrival_time);
    const timeString = etaTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const payload = {
      notification: {
        title: "🚚 Delivery Started!",
        body: `Agent is on the way with your ${delivery.quantity}L milk. ETA: ${timeString}`,
        icon: "/icons/delivery-started.png",
        badge: "/icons/badge.png",
      },
      data: {
        type: "DELIVERY_STARTED",
        deliveryId: deliveryId.toString(),
        eta: delivery.estimated_arrival_time,
        timestamp: new Date().toISOString(),
        actionUrl: `/deliveries/${deliveryId}`,
      },
    };

    await sendNotification(subscription, payload);
    console.log("Delivery started notification sent to customer:", delivery.customer_id);
  } catch (error) {
    console.error("Error sending delivery started notification:", error);
  }
};
