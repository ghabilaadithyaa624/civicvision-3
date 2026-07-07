import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/apiResponse";
import { AuthService } from "@services/auth.service";
import { UserRepository } from "@repositories/user.repository";
import { UnauthorizedError } from "@utils/AppError";

let authServiceInstance: AuthService | undefined;

function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await getAuthService().register(req.body);
  sendSuccess(res, {
    message: "Registration successful",
    data: result,
    statusCode: 201,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await getAuthService().login(req.body);
  sendSuccess(res, {
    message: "Login successful",
    data: result,
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  // req.user is the decoded JWT payload ({ sub, email, role }) — not a
  // full AppUser.  Fetch the real row so the response includes fullName,
  // isActive, timestamps, etc.
  const userRepo = new UserRepository();
  const user = await userRepo.findById(req.user!.sub);

  if (!user) {
    throw new UnauthorizedError("User no longer exists");
  }

  sendSuccess(res, {
    message: "Current authenticated user",
    data: { user },
  });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const { role } = req.body;
  const result = await getAuthService().updateRole(userId, role);
  sendSuccess(res, {
    message: "Role updated successfully",
    data: result,
  });
});
