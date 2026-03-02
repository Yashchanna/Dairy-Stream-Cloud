import {
  getAgentDeliveries,
  updateDeliveryStatus,
  submitDeliveryProof,
  markDeliveryFailed,
  getDeliveryById,
  bulkUpdateDeliveryStatuses,
} from '../../services/agent/delivery.service.js';

/**
 * Get agent deliveries
 */
export const getDeliveries = async (req, res) => {
  try {
    const { agentId, date } = req.query;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: 'agentId is required',
      });
    }

    const deliveries = await getAgentDeliveries(agentId, date);

    res.json({
      success: true,
      data: deliveries,
      count: deliveries.length,
    });
  } catch (error) {
    console.error('❌ GET DELIVERIES ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliveries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update delivery status
 */
export const updateStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.body;

    if (!deliveryId || !status) {
      return res.status(400).json({
        success: false,
        message: 'deliveryId and status are required',
      });
    }

    const validStatuses = ['PENDING', 'IN_TRANSIT', 'COMPLETED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updated = await updateDeliveryStatus(deliveryId, status);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('❌ UPDATE STATUS ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Submit delivery proof
 */
export const submitProof = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { proofType, otp } = req.body;
    const proofFile = req.file;

    if (!deliveryId || !proofType) {
      return res.status(400).json({
        success: false,
        message: 'deliveryId and proofType are required',
      });
    }

    if (proofType === 'PHOTO' && !proofFile) {
      return res.status(400).json({
        success: false,
        message: 'Photo file is required for PHOTO proof type',
      });
    }

    if (proofType === 'OTP' && !otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required for OTP proof type',
      });
    }

    let proofPhotoUrl = null;
    if (proofFile) {
      // TODO: Upload to cloud storage (e.g., AWS S3, Firebase Storage)
      // For now, save file path or URL
      proofPhotoUrl = `/uploads/proofs/${deliveryId}_${Date.now()}.jpg`;
    }

    const updated = await submitDeliveryProof(
      deliveryId,
      proofType,
      proofPhotoUrl,
      otp
    );

    res.json({
      success: true,
      message: 'Delivery proof submitted successfully',
      data: updated,
    });
  } catch (error) {
    console.error('❌ SUBMIT PROOF ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to submit delivery proof',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Mark delivery as failed
 */
export const markFailed = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { reason, reasonDetails } = req.body;
    const proofFile = req.file;

    if (!deliveryId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'deliveryId and reason are required',
      });
    }

    const validReasons = [
      'CUSTOMER_UNAVAILABLE',
      'PAYMENT_ISSUE',
      'WRONG_ADDRESS',
      'OTHER',
    ];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reason. Must be one of: ${validReasons.join(', ')}`,
      });
    }

    let proofPhotoUrl = null;
    if (proofFile) {
      // TODO: Upload to cloud storage
      proofPhotoUrl = `/uploads/proofs/${deliveryId}_${Date.now()}.jpg`;
    }

    const updated = await markDeliveryFailed(
      deliveryId,
      reason,
      reasonDetails,
      proofPhotoUrl
    );

    res.json({
      success: true,
      message: 'Delivery marked as failed',
      data: updated,
    });
  } catch (error) {
    console.error('❌ MARK FAILED ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to mark delivery as failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get delivery details
 */
export const getDeliveryDetails = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    if (!deliveryId) {
      return res.status(400).json({
        success: false,
        message: 'deliveryId is required',
      });
    }

    const delivery = await getDeliveryById(deliveryId);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found',
      });
    }

    res.json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    console.error('❌ GET DELIVERY DETAILS ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Bulk update deliveries
 */
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { deliveries } = req.body;

    if (!deliveries || !Array.isArray(deliveries)) {
      return res.status(400).json({
        success: false,
        message: 'deliveries array is required',
      });
    }

    const updated = await bulkUpdateDeliveryStatuses(deliveries);

    res.json({
      success: true,
      message: `Updated ${updated.length} deliveries`,
      data: updated,
    });
  } catch (error) {
    console.error('❌ BULK UPDATE ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update deliveries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
