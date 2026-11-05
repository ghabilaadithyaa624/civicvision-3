import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, me, updateRole } from "./auth.controller";
import { validate } from "@middleware/validate.middleware";
import { authenticate } from "@middleware/auth.middleware";
import { registerSchema, loginSchema } from "@validators/auth.validator";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", authenticate, me);
router.patch("/role", authenticate, updateRole);

export { router as authRouter };
