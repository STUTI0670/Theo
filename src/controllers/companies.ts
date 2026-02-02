import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { companySchema } from "../validators/company";
import { dynamicFieldSchema } from "../validators/dynamicField";
import { getActiveFieldsForCompany } from "../services/dynamicFields";
import { checkEligibility } from "../services/eligibility";

export const getEligibility = async (req: Request, res: Response) => {
  const studentId = (req as any).user?.sub ?? "";
  const result = await checkEligibility(req.params.companyId, studentId);
  return res.status(200).json(result);
};

export const createCompany = async (req: Request, res: Response) => {
  const parsed = companySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const data = parsed.data;
  const company = await prisma.company.create({
    data: {
      ...data,
      applicationStart: new Date(data.applicationStart),
      applicationDeadline: new Date(data.applicationDeadline),
      allowedBranches: data.allowedBranches,
      otherEligibility: data.otherEligibility ?? {},
      createdById: (req as any).user?.sub ?? "",
    },
  });

  return res.status(201).json(company);
};

export const updateCompany = async (req: Request, res: Response) => {
  const parsed = companySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const data = parsed.data;
  const company = await prisma.company.update({
    where: { id: req.params.id },
    data: {
      ...data,
      applicationStart: data.applicationStart
        ? new Date(data.applicationStart)
        : undefined,
      applicationDeadline: data.applicationDeadline
        ? new Date(data.applicationDeadline)
        : undefined,
      allowedBranches: data.allowedBranches,
      otherEligibility: data.otherEligibility,
    },
  });

  return res.status(200).json(company);
};

export const listCompanies = async (req: Request, res: Response) => {
  const companies = await prisma.company.findMany({
    where: { isPublished: true },
    orderBy: { applicationDeadline: "asc" },
  });

  return res.status(200).json(companies);
};

export const addDynamicField = async (req: Request, res: Response) => {
  const parsed = dynamicFieldSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const data = parsed.data;
  const field = await prisma.dynamicField.create({
    data: {
      ...data,
      companyId: req.params.companyId,
      options: data.options ?? [],
      fileConstraints: data.fileConstraints ?? undefined,
    },
  });

  return res.status(201).json(field);
};

export const updateDynamicField = async (req: Request, res: Response) => {
  const parsed = dynamicFieldSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const data = parsed.data;
  const field = await prisma.dynamicField.update({
    where: { id: req.params.fieldId },
    data: {
      ...data,
      options: data.options,
      fileConstraints: data.fileConstraints,
    },
  });

  return res.status(200).json(field);
};

export const disableDynamicField = async (req: Request, res: Response) => {
  const field = await prisma.dynamicField.update({
    where: { id: req.params.fieldId },
    data: { isActive: false },
  });

  return res.status(200).json(field);
};

export const listDynamicFields = async (req: Request, res: Response) => {
  const fields = await getActiveFieldsForCompany(req.params.companyId);
  return res.status(200).json(fields);
};
