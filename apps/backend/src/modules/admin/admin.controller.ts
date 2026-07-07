import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/apiResponse";
import { UserRepository } from "@repositories/user.repository";
import { BadRequestError, NotFoundError } from "@utils/AppError";

const userRepo = new UserRepository();

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userRepo.findAll();
  sendSuccess(res, {
    message: "Users retrieved successfully",
    data: { users },
  });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !["CITIZEN", "FIELD_AGENT", "ADMIN"].includes(role)) {
    throw new BadRequestError("Invalid or missing user role");
  }

  const existingUser = await userRepo.findById(id);
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  const updatedUser = await userRepo.updateRole(id, role);
  sendSuccess(res, {
    message: "User role updated successfully",
    data: { user: updatedUser },
  });
});

export const toggleUserActive = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new BadRequestError("isActive must be a boolean");
  }

  const existingUser = await userRepo.findById(id);
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  const updatedUser = await userRepo.updateActiveStatus(id, isActive);
  sendSuccess(res, {
    message: `User account ${isActive ? "enabled" : "disabled"} successfully`,
    data: { user: updatedUser },
  });
});
