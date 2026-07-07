import type {
  IssueCategory,
  IssueStatus,
  IssueReport as SharedIssueReport,
  CreateIssueInput as SharedCreateIssueInput,
  UpdateIssueStatusInput as SharedUpdateIssueStatusInput,
} from "@civicvision/shared-types";

export type { IssueCategory, IssueStatus };

export type IssueReport = SharedIssueReport<Date>;

export interface CreateIssueInput extends SharedCreateIssueInput {
  reportedById: string;
  aiConfidence?: number;
}

export type UpdateIssueStatusInput = SharedUpdateIssueStatusInput;
