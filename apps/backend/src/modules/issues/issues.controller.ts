import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/apiResponse";
import { IssueService } from "@services/issue.service";
import { ForbiddenError } from "@utils/AppError";
import type { IssueCategory, IssueStatus } from "@app-types/issue.types";

let issueServiceInstance: IssueService | undefined;

function getIssueService(): IssueService {
  if (!issueServiceInstance) {
    issueServiceInstance = new IssueService();
  }
  return issueServiceInstance;
}

export const createIssue = asyncHandler(async (req: Request, res: Response) => {
  const issue = await getIssueService().createIssue({
    ...req.body,
    reportedById: req.user!.sub,
  });

  sendSuccess(res, {
    message: "Issue reported successfully",
    data: { issue },
    statusCode: 201,
  });
});

export const getIssueById = asyncHandler(async (req: Request, res: Response) => {
  const issue = await getIssueService().getIssueById(req.params.id);

  sendSuccess(res, {
    message: "Issue retrieved successfully",
    data: { issue },
  });
});

export const getAllIssues = asyncHandler(async (req: Request, res: Response) => {
  const { status, category, reportedById } = req.query;

  const filters: {
    status?: IssueStatus;
    category?: IssueCategory;
    reportedById?: string;
  } = {};

  if (status) filters.status = status as IssueStatus;
  if (category) filters.category = category as IssueCategory;
  if (reportedById) filters.reportedById = reportedById as string;

  const issues = await getIssueService().getAllIssues(filters);

  sendSuccess(res, {
    message: "Issues retrieved successfully",
    data: { issues },
  });
});

export const updateIssueStatus = asyncHandler(async (req: Request, res: Response) => {
  // Role-based access check: only FIELD_AGENT or ADMIN can update issue status
  const userRole = req.user!.role;
  if (userRole !== "FIELD_AGENT" && userRole !== "ADMIN") {
    throw new ForbiddenError("Only field agents or administrators can update issue status");
  }

  const issue = await getIssueService().updateIssueStatus(req.params.id, req.body.status);

  sendSuccess(res, {
    message: "Issue status updated successfully",
    data: { issue },
  });
});

export const deleteIssue = asyncHandler(async (req: Request, res: Response) => {
  // Role-based access check: only ADMIN can delete issues
  const userRole = req.user!.role;
  if (userRole !== "ADMIN") {
    throw new ForbiddenError("Only administrators can delete issues");
  }

  await getIssueService().deleteIssue(req.params.id);

  sendSuccess(res, {
    message: "Issue deleted successfully",
  });
});
