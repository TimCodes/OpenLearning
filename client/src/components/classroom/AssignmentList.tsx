import { useAssignments } from "@/hooks/use-assignments";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";
import { useNotifications } from "@/hooks/use-notifications";
import { useCourse } from "@/hooks/use-courses";
import { useToast } from "@/hooks/use-toast";

interface AssignmentListProps {
  courseId: number;
}

export default function AssignmentList({ courseId }: AssignmentListProps) {
  const { assignments, isLoading: assignmentsLoading } = useAssignments(courseId);
  const { course, isLoading: courseLoading } = useCourse(courseId);
  const { user } = useUser();
  const { sendNotification } = useNotifications(courseId);
  const { toast } = useToast();

  const isLoading = assignmentsLoading || courseLoading;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  const handleCreateAssignment = () => {
    if (course) {
      // Notify students about the new assignment
      sendNotification({
        type: 'assignment',
        title: `New Assignment in ${course.name}`,
        message: 'A new assignment has been posted to your class',
      });
      
      // TODO: Add create assignment dialog implementation
      // For now, we're just showing the notification
      // The actual assignment creation will be implemented later
      toast({
        title: "Coming Soon",
        description: "Assignment creation feature will be available soon!",
      });
    }
  };

  return (
    <div className="space-y-4">
      {user?.role === "teacher" && (
        <div className="flex justify-end">
          <Button onClick={handleCreateAssignment}>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {assignments?.map((assignment) => (
          <Link key={assignment.id} href={`/assignment/${assignment.id}`}>
            <a className="block">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Due {assignment.dueDate ? format(new Date(assignment.dueDate), "PPP") : "No due date"}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {assignment.description || "No description provided"}
                  </p>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}

        {(!assignments || assignments.length === 0) && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No assignments yet</h3>
            <p className="text-muted-foreground mt-1">
              {user?.role === "teacher" ? "Create an assignment to get started" : "Check back later for new assignments"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
