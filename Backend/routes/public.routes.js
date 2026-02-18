import express from "express";

// ✅ UPDATE IMPORT
import { detectUser } from "../controllers/authentication/detectUser.controller.js";
import { getPublicDairies, getPublicDairy } from "../controllers/public/dairies.controller.js";

const router = express.Router();

// Public Dairy Listings
router.get("/dairies", getPublicDairies);
router.get("/dairies/:id", getPublicDairy);

export default router;