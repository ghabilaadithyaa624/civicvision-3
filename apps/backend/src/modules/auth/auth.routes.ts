import { Router } from "express";
import { register, login, me, updateRole } from "./auth.controller";
import { validate } from "@middleware/validate.middleware";
import { authenticate } from "@middleware/auth.middleware";
import { registerSchema, loginSchema } from "@validators/auth.validator";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);
router.patch("/role", authenticate, updateRole);

export { router as authRouter };
