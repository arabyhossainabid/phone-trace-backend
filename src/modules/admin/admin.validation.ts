import { z } from "zod";

export const verifyReportSchema = z.object({
  params: z.object({
    type: z.enum(["lost", "found"], {
      errorMap: () => ({ message: "Type must be 'lost' or 'found'" }),
    }),
    id: z.string().uuid("Invalid report ID format"),
  }),
});

export const deleteReportSchema = z.object({
  params: z.object({
    type: z.enum(["lost", "found"], {
      errorMap: () => ({ message: "Type must be 'lost' or 'found'" }),
    }),
    id: z.string().uuid("Invalid report ID format"),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
  body: z.object({
    role: z.enum(["USER", "ADMIN"], {
      errorMap: () => ({ message: "Role must be USER or ADMIN" }),
    }),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
});
