import { z } from "zod";

export const dynamicFieldSchema = z.object({
  label: z.string().min(1),
  description: z.string().optional(),
  type: z.enum([
    "SHORT_TEXT",
    "LONG_TEXT",
    "NUMBER",
    "DROPDOWN",
    "MULTIPLE_CHOICE",
    "CHECKBOX",
    "FILE_UPLOAD",
  ]),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  fileConstraints: z
    .object({
      allowedTypes: z.array(z.string()),
      maxSizeMb: z.number().min(1),
    })
    .optional(),
  displayOrder: z.number().int().min(0),
});
