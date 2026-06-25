import { z } from "zod";

const FoundStatusEnum = z.enum(["FOUND", "RETURNED"]);

export const createFoundPhoneSchema = z.object({
  body: z.object({
    phoneModel: z.string().min(1, "Phone model is required"),
    imei: z.string().regex(/^\d{15}$/, "IMEI must be exactly 15 digits"),
    brand: z.string().min(1, "Brand is required"),
    location: z.string().min(1, "Location is required"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    contactNumber: z.string().optional().nullable(),
    status: FoundStatusEnum.optional(),
  }),
});

export const updateFoundPhoneSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid report ID format"),
  }),
  body: z.object({
    phoneModel: z.string().min(1).optional(),
    imei: z.string().regex(/^\d{15}$/, "IMEI must be exactly 15 digits").optional(),
    brand: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    description: z.string().min(5).optional(),
    contactNumber: z.string().optional().nullable(),
    status: FoundStatusEnum.optional(),
  }),
});

export const getSingleFoundPhoneSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid report ID format"),
  }),
});

export const queryFoundPhoneSchema = z.object({
  query: z.object({
    imei: z.string().optional(),
    phoneModel: z.string().optional(),
    brand: z.string().optional(),
    location: z.string().optional(),
    status: FoundStatusEnum.optional(),
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  }),
});
