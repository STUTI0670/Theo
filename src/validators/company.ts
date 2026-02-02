import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1),
  jobRole: z.string().min(1),
  jobDescription: z.string().optional(),
  minCgpa: z.number().min(0).max(10),
  allowedBranches: z.array(z.string().min(1)),
  otherEligibility: z.record(z.any()).optional(),
  applicationStart: z.string().datetime(),
  applicationDeadline: z.string().datetime(),
  isPublished: z.boolean().optional(),
});
