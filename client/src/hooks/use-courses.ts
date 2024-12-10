import { useQuery } from "@tanstack/react-query";
import type { Course } from "@db/schema";

export function useCourses() {
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  return {
    courses,
    isLoading,
    error
  };
}

export function useCourse(id: number) {
  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: [`/api/courses/${id}`],
  });

  return {
    course,
    isLoading,
    error
  };
}
