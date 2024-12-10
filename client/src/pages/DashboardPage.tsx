import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/hooks/use-courses";
import { useUser } from "@/hooks/use-user";
import CourseCard from "@/components/classroom/CourseCard";
import CreateCourseDialog from "@/components/classroom/CreateCourseDialog";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const { user } = useUser();
  const { courses, isLoading } = useCourses();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Classroom</h1>
          {user?.role === "teacher" && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Button>
          )}
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses?.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        )}

        {!isLoading && courses?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No courses yet</h3>
            <p className="text-muted-foreground mt-1">
              {user?.role === "teacher"
                ? "Create a class to get started"
                : "Join a class to get started"}
            </p>
          </div>
        )}
      </main>

      <CreateCourseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
