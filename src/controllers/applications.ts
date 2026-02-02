import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { applicationSubmitSchema } from "../validators/application";
import { checkEligibility } from "../services/eligibility";
import { getActiveFieldsForCompany } from "../services/dynamicFields";

export const getApplicationForm = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const companyId = req.params.companyId;
  const [company, fields, profile] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId } }),
    getActiveFieldsForCompany(companyId),
    prisma.studentProfile.findUnique({ where: { userId: req.user?.sub } }),
  ]);

  if (!company || !profile) {
    return res.status(404).json({ error: "Company or profile not found." });
  }

  return res.status(200).json({
    profile,
    fields,
    applicationDeadline: company.applicationDeadline,
  });
};

export const submitApplication = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const companyId = req.params.companyId;
  const parsed = applicationSubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return res.status(404).json({ error: "Company not found." });
  }

  const now = new Date();
  if (now < company.applicationStart) {
    return res.status(400).json({ error: "Applications not open yet." });
  }
  if (now > company.applicationDeadline) {
    return res.status(400).json({ error: "Deadline has passed." });
  }

  const eligibility = await checkEligibility(companyId, req.user?.sub ?? "");
  if (!eligibility.eligible) {
    return res.status(403).json({ error: eligibility.reason });
  }

  const existing = await prisma.application.findUnique({
    where: {
      companyId_studentId: {
        companyId,
        studentId: req.user?.sub ?? "",
      },
    },
  });
  if (existing) {
    return res.status(409).json({ error: "Already applied." });
  }

  const activeFields = await getActiveFieldsForCompany(companyId);
  const { responses, fileUrls } = parsed.data;

  // Responses are stored as metadata so form fields remain dynamic.
  const application = await prisma.application.create({
    data: {
      companyId,
      studentId: req.user?.sub ?? "",
      submittedAt: new Date(),
      responses: {
        create: activeFields.map((field) => ({
          fieldId: field.id,
          value: responses[field.id] ?? null,
          fileUrl: fileUrls?.[field.id],
        })),
      },
    },
    include: { responses: true },
  });

  return res.status(201).json(application);
};

export const listCompanyApplications = async (req: Request, res: Response) => {
  const companyId = req.params.companyId;
  const applications = await prisma.application.findMany({
    where: { companyId },
    include: {
      student: {
        select: { id: true, email: true, studentProfile: true },
      },
      responses: {
        include: { field: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json(applications);
};
