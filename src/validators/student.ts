import { z } from "zod";

export const studentProfileSchema = z.object({
  name: z.string().min(1),
  rollNumber: z.string().min(1),
  branch: z.string().min(1),
  cgpa: z.number().min(0).max(10),
  phone: z.string().min(7),
  resumeUrl: z.string().url().optional(),
  portfolioLinks: z.array(z.string().url()).optional(),
});
