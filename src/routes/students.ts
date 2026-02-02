import { Router } from "express";
import { getProfile, upsertProfile } from "../controllers/students";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

const router = Router();

router.get("/me", authenticate, requireRole("STUDENT"), getProfile);
router.put("/me", authenticate, requireRole("STUDENT"), upsertProfile);

export default router;
