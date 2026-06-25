import { Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { AuthenticatedRequest } from "../types/index.js";
import { sendResponse } from "../utils/response.js";

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return sendResponse(res, 401, false, "Unauthorized - Please login to continue");
    }

    req.user = session.user as any;
    req.session = session.session as any;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (roles: ("USER" | "ADMIN")[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized");
    }

    if (!roles.includes(req.user.role)) {
      return sendResponse(
        res,
        403,
        false,
        "Forbidden - You do not have permission to access this resource"
      );
    }

    next();
  };
};
