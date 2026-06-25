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
} from "./lost-phone.controller.js";
import {
  createLostPhoneSchema,
  updateLostPhoneSchema,
  getSingleLostPhoneSchema,
  queryLostPhoneSchema,
} from "./lost-phone.validation.js";

const router = Router();

router.post("/", requireAuth, validate(createLostPhoneSchema), asyncHandler(createReport));
router.get("/", validate(queryLostPhoneSchema), asyncHandler(getAllReports));
router.get("/:id", validate(getSingleLostPhoneSchema), asyncHandler(getSingleReport));
router.patch("/:id", requireAuth, validate(updateLostPhoneSchema), asyncHandler(updateReport));
router.delete("/:id", requireAuth, validate(getSingleLostPhoneSchema), asyncHandler(deleteReport));

export default router;
