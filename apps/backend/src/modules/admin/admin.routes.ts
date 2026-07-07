import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/requireRole.middleware";
import {
  getAllUsers,
  updateUserRole,
  toggleUserActive,
} from "./admin.controller";

const router = Router();

// Protect all admin endpoints: authenticated and ADMIN role required
router.use(authenticate, requireRole("ADMIN"));

router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/toggle-active", toggleUserActive);

export { router as adminRouter };
