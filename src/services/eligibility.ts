import { prisma } from "../config/prisma";

export const checkEligibility = async (companyId: string, studentId: string) => {
  const [company, profile] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId } }),
    prisma.studentProfile.findUnique({ where: { userId: studentId } }),
  ]);

  if (!company || !profile) {
    return { eligible: false, reason: "Missing company or student profile." };
  }

  if (profile.cgpa < company.minCgpa) {
    return { eligible: false, reason: "CGPA below minimum requirement." };
  }

  const allowedBranches = company.allowedBranches as string[];
  if (!allowedBranches.includes(profile.branch)) {
    return { eligible: false, reason: "Branch not eligible." };
  }

  // Additional rules are stored as metadata for extensibility.
  return { eligible: true, reason: "Eligible." };
};
