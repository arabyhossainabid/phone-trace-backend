import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getProfile, updateProfile } from "./user.controller.js";
import { updateProfileSchema } from "./user.validation.js";

const router = Router();

router.get("/profile", requireAuth, asyncHandler(getProfile));
router.patch(
  "/profile",
  requireAuth,
  validate(updateProfileSchema),
  asyncHandler(updateProfile)
);

export default router;
