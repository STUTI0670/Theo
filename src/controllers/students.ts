import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { studentProfileSchema } from "../validators/student";

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: req.user?.sub },
  });

  if (!profile) {
    return res.status(404).json({ error: "Profile not found." });
  }

  return res.status(200).json(profile);
};

export const upsertProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = studentProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const data = parsed.data;
  const profile = await prisma.studentProfile.upsert({
    where: { userId: req.user?.sub ?? "" },
    create: {
      ...data,
      portfolioLinks: data.portfolioLinks ?? [],
      userId: req.user?.sub ?? "",
    },
    update: {
      ...data,
      portfolioLinks: data.portfolioLinks ?? [],
    },
  });

  return res.status(200).json(profile);
};
