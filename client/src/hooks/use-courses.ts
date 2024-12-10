import { useQuery } from "@tanstack/react-query";
import type { Course } from "@db/schema";

export function useCourses() {
  return useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
}

export function useCourse(id: number) {
  return useQuery<Course>({
    queryKey: [`/api/courses/${id}`],
  });
}
