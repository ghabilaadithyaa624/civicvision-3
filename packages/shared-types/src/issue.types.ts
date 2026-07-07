export type IssueCategory =
  | "POTHOLE"
  | "GARBAGE"
  | "STREETLIGHT"
  | "WATER_LEAKAGE"
  | "DAMAGED_SIGNAGE"
  | "OTHER";

export type IssueStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED";

export interface IssueReport<TDate = string> {
  id: string;
  title: string;
  description: string | null;
  category: IssueCategory;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  aiConfidence: number | null;
  reportedById: string;
  createdAt: TDate;
  updatedAt: TDate;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  category: IssueCategory;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

export interface UpdateIssueStatusInput {
  status: IssueStatus;
}
