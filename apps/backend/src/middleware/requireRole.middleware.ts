import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "@utils/AppError";
import type { UserRole } from "@app-types/user.types";

/**
 * Express middleware factory that restricts access to users whose JWT
 * `role` claim is in the supplied allow-list.
 *
 * Must be mounted **after** `authenticate` — it reads `req.user.role`
 * which `authenticate` sets from the decoded JWT.
 *
 * Usage:
 *   router.get("/admin/users", authenticate, requireRole("ADMIN"), handler);
 *   router.get("/field", authenticate, requireRole("FIELD_AGENT", "ADMIN"), handler);
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole as UserRole)) {
      next(new ForbiddenError("You do not have permission to access this resource"));
      return;
    }

    next();
  };
}
