import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import type { Course } from "@db/schema";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/course/${course.id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-xl">{course.name}</CardTitle>
          <p className="text-sm text-primary-foreground/80">{course.section}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{course.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
