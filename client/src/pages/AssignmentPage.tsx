import { useRoute } from "wouter";
import { useAssignment } from "@/hooks/use-assignments";
import Navigation from "@/components/classroom/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";

export default function AssignmentPage() {
  const [, params] = useRoute("/assignment/:id");
  const assignmentId = parseInt(params?.id || "0");
  const { assignment, isLoading, submit } = useAssignment(assignmentId);
  const { user } = useUser();
  const [submission, setSubmission] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  const handleSubmit = async () => {
    await submit({ content: submission });
    setSubmission("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="border-b">
        <div className="container py-4">
          <h1 className="text-2xl font-semibold">{assignment.title}</h1>
          <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {assignment.dueDate ? format(new Date(assignment.dueDate), "PPP") : "No due date"}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              {assignment.dueDate ? format(new Date(assignment.dueDate), "p") : "No time set"}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose">
                {assignment.description}
              </div>
            </CardContent>
          </Card>

          {user?.role === "student" && (
            <Card>
              <CardHeader>
                <CardTitle>Your Work</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your submission here..."
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  className="min-h-[200px]"
                />
                <Button onClick={handleSubmit} className="mt-4">
                  Turn In
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
