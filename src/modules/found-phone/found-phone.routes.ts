import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createReport,
  updateReport,
  deleteReport,
  getSingleReport,
  getAllReports,
} from "./found-phone.controller.js";
import {
  createFoundPhoneSchema,
  updateFoundPhoneSchema,
  getSingleFoundPhoneSchema,
  queryFoundPhoneSchema,
} from "./found-phone.validation.js";

const router = Router();

router.post("/", requireAuth, validate(createFoundPhoneSchema), asyncHandler(createReport));
router.get("/", validate(queryFoundPhoneSchema), asyncHandler(getAllReports));
router.get("/:id", validate(getSingleFoundPhoneSchema), asyncHandler(getSingleReport));
router.patch("/:id", requireAuth, validate(updateFoundPhoneSchema), asyncHandler(updateReport));
router.delete("/:id", requireAuth, validate(getSingleFoundPhoneSchema), asyncHandler(deleteReport));

export default router;
