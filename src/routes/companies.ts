import { Router } from "express";
import {
  addDynamicField,
  createCompany,
  disableDynamicField,
  getEligibility,
  listCompanies,
  listDynamicFields,
  updateCompany,
  updateDynamicField,
} from "../controllers/companies";
import {
  getApplicationForm,
  listCompanyApplications,
  submitApplication,
} from "../controllers/applications";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

const router = Router();

router.get("/", authenticate, listCompanies);
router.post("/", authenticate, requireRole("COORDINATOR"), createCompany);
router.patch("/:id", authenticate, requireRole("COORDINATOR"), updateCompany);

router.get(
  "/:companyId/fields",
  authenticate,
  requireRole("COORDINATOR"),
  listDynamicFields
);
router.post(
  "/:companyId/fields",
  authenticate,
  requireRole("COORDINATOR"),
  addDynamicField
);
router.patch(
  "/:companyId/fields/:fieldId",
  authenticate,
  requireRole("COORDINATOR"),
  updateDynamicField
);
router.delete(
  "/:companyId/fields/:fieldId",
  authenticate,
  requireRole("COORDINATOR"),
  disableDynamicField
);

router.get(
  "/:companyId/applications",
  authenticate,
  requireRole("COORDINATOR"),
  listCompanyApplications
);

router.get(
  "/:companyId/apply",
  authenticate,
  requireRole("STUDENT"),
  getApplicationForm
);
router.post(
  "/:companyId/apply",
  authenticate,
  requireRole("STUDENT"),
  submitApplication
);
router.get(
  "/:companyId/eligibility",
  authenticate,
  requireRole("STUDENT"),
  getEligibility
);

export default router;
