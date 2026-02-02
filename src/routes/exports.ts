import { Router } from "express";
import {
  exportCompanyApplicationsCsv,
  exportCompanyApplicationsSheetPayload,
} from "../controllers/exports";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

const router = Router();

router.get(
  "/companies/:companyId/applications/csv",
  authenticate,
  requireRole("COORDINATOR"),
  exportCompanyApplicationsCsv
);

router.get(
  "/companies/:companyId/applications/sheets",
  authenticate,
  requireRole("COORDINATOR"),
  exportCompanyApplicationsSheetPayload
);

export default router;
