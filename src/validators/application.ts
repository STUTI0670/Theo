import { z } from "zod";

export const applicationSubmitSchema = z.object({
  responses: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()])),
  fileUrls: z.record(z.string().url()).optional(),
});
