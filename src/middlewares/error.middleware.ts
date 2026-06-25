import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { sendResponse } from "../utils/response.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => {
      const fieldPath = e.path.slice(1).join(".");
      return {
        field: fieldPath || "field",
        message: e.message,
      };
    });
    return sendResponse(res, 400, false, "Validation failed", formattedErrors);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[])?.join(", ") || "field";
      return sendResponse(
        res,
        409,
        false,
        `Conflict: A record with this ${target} already exists`
      );
    }
    if (err.code === "P2025") {
      return sendResponse(res, 404, false, "Record not found");
    }
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return sendResponse(
    res,
    status,
    false,
    message,
    process.env.NODE_ENV === "development" ? { stack: err.stack } : undefined
  );
};
