import { apiClient } from "@/services/apiClient";
import type {
  ApiSuccessResponse,
  IssueReport,
  CreateIssueInput,
  IssueStatus,
  IssueCategory,
} from "@civicvision/shared-types";

export interface IssueListFilters {
  status?: IssueStatus;
  category?: IssueCategory;
  reportedById?: string;
}

export async function uploadImageRequest(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<ApiSuccessResponse<{ imageUrl: string }>>(
    "/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data.data!.imageUrl;
}

export async function createIssueRequest(payload: CreateIssueInput): Promise<IssueReport> {
  const { data } = await apiClient.post<ApiSuccessResponse<{ issue: IssueReport }>>(
    "/issues",
    payload
  );
  return data.data!.issue;
}

export async function getIssueByIdRequest(id: string): Promise<IssueReport> {
  const { data } = await apiClient.get<ApiSuccessResponse<{ issue: IssueReport }>>(
    `/issues/${id}`
  );
  return data.data!.issue;
}

export async function getIssuesRequest(filters?: IssueListFilters): Promise<IssueReport[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<{ issues: IssueReport[] }>>("/issues", {
    params: filters,
  });
  return data.data!.issues;
}

export async function updateIssueStatusRequest(
  id: string,
  status: IssueStatus
): Promise<IssueReport> {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ issue: IssueReport }>>(
    `/issues/${id}`,
    { status }
  );
  return data.data!.issue;
}

export async function deleteIssueRequest(id: string): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<void>>(`/issues/${id}`);
}
