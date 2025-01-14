import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Assignment } from "@db/schema";

export function useAssignments(courseId: number) {
  const { data: assignments, isLoading, error } = useQuery<Assignment[]>({
    queryKey: [`/api/courses/${courseId}/assignments`],
  });

  return {
    assignments,
    isLoading,
    error
  };
}

export function useAssignment(id: number) {
  const queryClient = useQueryClient();

  const { data: assignment, ...rest } = useQuery<Assignment>({
    queryKey: [`/api/assignments/${id}`],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const response = await fetch(`/api/assignments/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assignments/${id}`] });
    },
  });

  const gradeMutation = useMutation({
    mutationFn: async (data: { submissionId: number; grade: number }) => {
      const response = await fetch(`/api/assignments/${id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assignments/${id}`] });
    },
  });

  return {
    assignment,
    ...rest,
    submit: submitMutation.mutateAsync,
    grade: gradeMutation.mutateAsync,
  };
}
