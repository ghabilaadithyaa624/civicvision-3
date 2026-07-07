import { Router } from "express";
import {
  createIssue,
  getIssueById,
  getAllIssues,
  updateIssueStatus,
  deleteIssue,
} from "./issues.controller";
import { validate } from "@middleware/validate.middleware";
import { authenticate } from "@middleware/auth.middleware";
import { createIssueSchema, updateIssueStatusSchema } from "@validators/issue.validator";

const router = Router();

// CRUD endpoints for issues
router.post("/", authenticate, validate(createIssueSchema), createIssue);
router.get("/", authenticate, getAllIssues);
router.get("/:id", authenticate, getIssueById);
router.patch("/:id", authenticate, validate(updateIssueStatusSchema), updateIssueStatus);
router.delete("/:id", authenticate, deleteIssue);

export { router as issuesRouter };
