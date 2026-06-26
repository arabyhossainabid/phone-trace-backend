import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  verifyReport,
  deleteFakeReport,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getDashboardStats,
} from "./admin.controller.js";
import {
  verifyReportSchema,
  deleteReportSchema,
  updateRoleSchema,
  deleteUserSchema,
} from "./admin.validation.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["ADMIN"]));

router.get("/stats", asyncHandler(getDashboardStats));

router.post("/reports/:type/:id/verify", validate(verifyReportSchema), asyncHandler(verifyReport));
router.delete("/reports/:type/:id", validate(deleteReportSchema), asyncHandler(deleteFakeReport));

router.get("/users", asyncHandler(getAllUsers));
router.patch("/users/:id/role", validate(updateRoleSchema), asyncHandler(updateUserRole));
router.delete("/users/:id", validate(deleteUserSchema), asyncHandler(deleteUser));

export default router;
