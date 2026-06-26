import { Router } from "express";
import authRouter from "../modules/auth/auth.routes.js";
import userRouter from "../modules/user/user.routes.js";
import lostPhoneRouter from "../modules/lost-phone/lost-phone.routes.js";
import foundPhoneRouter from "../modules/found-phone/found-phone.routes.js";
import adminRouter from "../modules/admin/admin.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/lost-phones", lostPhoneRouter);
router.use("/found-phones", foundPhoneRouter);
router.use("/admin", adminRouter);

export default router;
