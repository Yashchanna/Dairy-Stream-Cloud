import express from 'express';
// We import from 'shared' because both Admins and Agents need this list
import { getUniqueBuildings } from '../controllers/shared/building.controller.js';
import { verifyAgent } from "../middleware/agent.middleware.js";
import {
  fetchAgentDashboard,
  fetchAssignedDeliveries,
  fetchAgentHistory,
  patchAgentAvailability,
  fetchAgentSelfProfile,
  patchAssignedDeliveryStatus,
} from "../controllers/agent/delivery.controller.js";

const router = express.Router();

// ==========================================
// 🏢 BUILDING ROUTES
// ==========================================

// Endpoint: GET http://localhost:4000/api/agent/buildings
router.get('/buildings', getUniqueBuildings);

router.get("/dashboard", verifyAgent, fetchAgentDashboard);
router.get("/deliveries/assigned", verifyAgent, fetchAssignedDeliveries);
router.get("/deliveries/history", verifyAgent, fetchAgentHistory);
router.patch("/deliveries/:id/status", verifyAgent, patchAssignedDeliveryStatus);
router.get("/profile", verifyAgent, fetchAgentSelfProfile);
router.patch("/profile/availability", verifyAgent, patchAgentAvailability);


// ==========================================
// ❌ REMOVED ROUTES
// ==========================================
// The '/addAgent' route has been removed from here.
// It is correctly located in 'admin.routes.js' now.


export default router;
