import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIssueRequest,
  getIssueByIdRequest,
  getIssuesRequest,
  updateIssueStatusRequest,
  deleteIssueRequest,
  uploadImageRequest,
  type IssueListFilters,
} from "../api/issues.api";
import type { CreateIssueInput, IssueStatus, IssueReport } from "@civicvision/shared-types";

export function useUploadImageMutation() {
  return useMutation({
    mutationFn: (file: File) => uploadImageRequest(file),
  });
}

export function useCreateIssueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIssueInput) => createIssueRequest(payload),
    onMutate: async (newIssue) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["issues"] });

      // Snapshot the previous queries in cache
      const queries = queryClient.getQueriesData<IssueReport[]>({ queryKey: ["issues"] });
      const previousQueries = queries.map(([queryKey, queryData]) => ({
        queryKey,
        queryData,
      }));

      // Generate a temporary optimistic issue report
      const optimisticIssue: IssueReport = {
        id: `temp-${Date.now()}`,
        title: newIssue.title,
        description: newIssue.description ?? null,
        category: newIssue.category,
        status: "PENDING" as const,
        latitude: newIssue.latitude,
        longitude: newIssue.longitude,
        imageUrl: newIssue.imageUrl ?? null,
        aiConfidence: null,
        reportedById: "temp-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically insert the issue into all matching list queries
      queries.forEach(([queryKey, queryData]) => {
        if (Array.isArray(queryData)) {
          queryClient.setQueryData(queryKey, [optimisticIssue, ...queryData]);
        }
      });

      return { previousQueries };
    },
    onError: (_err, _newIssue, context) => {
      // Rollback the cache state if the mutation fails
      context?.previousQueries.forEach(({ queryKey, queryData }) => {
        queryClient.setQueryData(queryKey, queryData);
      });
    },
    onSettled: () => {
      // Invalidate and refetch to sync with the server database
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
}

export function useIssuesQuery(filters?: IssueListFilters) {
  return useQuery({
    queryKey: ["issues", filters],
    queryFn: () => getIssuesRequest(filters),
  });
}

export function useIssueQuery(id: string) {
  return useQuery({
    queryKey: ["issues", id],
    queryFn: () => getIssueByIdRequest(id),
    enabled: Boolean(id),
  });
}

export function useUpdateIssueStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: IssueStatus }) =>
      updateIssueStatusRequest(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["issues"] });

      // Snapshot all cached issue lists
      const queries = queryClient.getQueriesData<IssueReport[]>({ queryKey: ["issues"] });
      const previousQueries = queries.map(([queryKey, queryData]) => ({
        queryKey,
        queryData,
      }));

      // Snapshot single issue query detail
      const previousSingleIssue = queryClient.getQueryData<IssueReport>(["issues", id]);

      // Optimistically update status in all lists
      queries.forEach(([queryKey, queryData]) => {
        if (Array.isArray(queryData)) {
          queryClient.setQueryData(
            queryKey,
            queryData.map((issue) => (issue.id === id ? { ...issue, status } : issue))
          );
        }
      });

      // Optimistically update single issue query detail
      if (previousSingleIssue) {
        queryClient.setQueryData(["issues", id], { ...previousSingleIssue, status });
      }

      return { previousQueries, previousSingleIssue };
    },
    onError: (_err, variables, context) => {
      // Rollback lists
      context?.previousQueries.forEach(({ queryKey, queryData }) => {
        queryClient.setQueryData(queryKey, queryData);
      });
      // Rollback single issue
      if (context?.previousSingleIssue) {
        queryClient.setQueryData(["issues", variables.id], context.previousSingleIssue);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issues", variables.id] });
    },
  });
}

export function useDeleteIssueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIssueRequest(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["issues"] });

      // Snapshot all cached issue lists
      const queries = queryClient.getQueriesData<IssueReport[]>({ queryKey: ["issues"] });
      const previousQueries = queries.map(([queryKey, queryData]) => ({
        queryKey,
        queryData,
      }));

      // Optimistically remove the issue from all lists
      queries.forEach(([queryKey, queryData]) => {
        if (Array.isArray(queryData)) {
          queryClient.setQueryData(
            queryKey,
            queryData.filter((issue) => issue.id !== id)
          );
        }
      });

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      // Rollback cache state
      context?.previousQueries.forEach(({ queryKey, queryData }) => {
        queryClient.setQueryData(queryKey, queryData);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
}
