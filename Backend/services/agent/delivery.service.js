import { supabase } from '../../config/supabase.js';

/**
 * Get deliveries for an agent on a specific date
 */
export const getAgentDeliveries = async (agentId, deliveryDate = null) => {
  try {
    const date = deliveryDate || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('agent_id', agentId)
      .eq('delivery_date', date)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching agent deliveries:', error.message);
    throw error;
  }
};

/**
 * Update delivery status
 */
export const updateDeliveryStatus = async (deliveryId, status) => {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .update({
        status,
        completed_at: status === 'COMPLETED' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliveryId)
      .select();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating delivery status:', error.message);
    throw error;
  }
};

/**
 * Submit delivery proof
 */
export const submitDeliveryProof = async (
  deliveryId,
  proofType,
  proofPhotoUrl = null,
  proofOtp = null
) => {
  try {
    // Get the delivery first to check status
    const { data: delivery, error: fetchError } = await supabase
      .from('deliveries')
      .select('*')
      .eq('id', deliveryId)
      .single();

    if (fetchError) throw fetchError;

    // Update delivery with proof info
    const { data, error } = await supabase
      .from('deliveries')
      .update({
        status: 'COMPLETED',
        proof_type: proofType,
        proof_photo_url: proofPhotoUrl,
        proof_otp: proofOtp,
        otp_verified_at:
          proofType === 'OTP'
            ? new Date().toISOString()
            : null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliveryId)
      .select();

    if (error) throw error;

    // Also create entry in delivery_proofs table
    const { error: proofError } = await supabase
      .from('delivery_proofs')
      .insert({
        delivery_id: deliveryId,
        proof_type: proofType,
        photo_url: proofPhotoUrl,
        otp_code: proofOtp,
        otp_verified: proofType === 'OTP' ? true : false,
        verified_at: new Date().toISOString(),
      });

    if (proofError) {
      console.warn('Warning: Could not create proof record:', proofError);
      // Don't throw - main delivery update succeeded
    }

    return data;
  } catch (error) {
    console.error('Error submitting delivery proof:', error.message);
    throw error;
  }
};

/**
 * Mark delivery as failed
 */
export const markDeliveryFailed = async (
  deliveryId,
  failedReason,
  failedReasonDetails = null,
  proofPhotoUrl = null
) => {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .update({
        status: 'FAILED',
        failed_reason: failedReason,
        failed_reason_details: failedReasonDetails,
        proof_photo_url: proofPhotoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliveryId)
      .select();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error marking delivery failed:', error.message);
    throw error;
  }
};

/**
 * Get delivery by ID
 */
export const getDeliveryById = async (deliveryId) => {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('id', deliveryId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching delivery:', error.message);
    throw error;
  }
};

/**
 * Bulk update delivery statuses
 */
export const bulkUpdateDeliveryStatuses = async (deliveries) => {
  try {
    const updates = deliveries.map((delivery) => ({
      id: delivery.id,
      status: delivery.status,
      completed_at: delivery.status === 'COMPLETED' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('deliveries')
      .upsert(updates)
      .select();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error bulk updating deliveries:', error.message);
    throw error;
  }
};
