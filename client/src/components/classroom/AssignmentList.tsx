import { useAssignments } from "@/hooks/use-assignments";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";

interface AssignmentListProps {
  courseId: number;
}

export default function AssignmentList({ courseId }: AssignmentListProps) {
  const { assignments, isLoading } = useAssignments(courseId);
  const { user } = useUser();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {user?.role === "teacher" && (
        <div className="flex justify-end">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {assignments?.map((assignment) => (
          <Link key={assignment.id} href={`/assignment/${assignment.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Due {format(new Date(assignment.dueDate), "PPP")}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {assignment.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {assignments?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No assignments yet</h3>
            <p className="text-muted-foreground mt-1">
              Check back later for new assignments
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
