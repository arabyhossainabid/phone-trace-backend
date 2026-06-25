import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").optional(),
    image: z
      .string()
      .url("Must be a valid URL")
      .or(z.string().length(0))
      .nullable()
      .optional(),
  }),
});
