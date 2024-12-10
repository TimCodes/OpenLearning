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
  const { assignment, isLoading, submit, grade } = useAssignment(assignmentId);
  const { user } = useUser();
  const [submission, setSubmission] = useState("");
  const { sendNotification } = useNotifications(assignment?.courseId);

  const handleGrade = async (submissionId: number, grade: number) => {
    try {
      await grade({ submissionId, grade });
      sendNotification({
        type: 'grade',
        title: 'Grade Posted',
        message: `A grade has been posted for ${assignment?.title}`,
      });
    } catch (error) {
      console.error('Failed to save grade:', error);
    }
  };

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

          {user?.role === "student" ? (
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
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Student Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {assignment.submissions?.map((submission) => (
                  <div key={submission.id} className="border-b py-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{submission.student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted {format(new Date(submission.submittedAt), "PPp")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Grade"
                            className="w-20"
                            value={submission.grade || ""}
                            onChange={(e) => handleGrade(submission.id, parseInt(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground">/ {assignment.points}</span>
                        </div>
                        <Button onClick={() => handleSaveGrade(submission)} variant="outline" size="sm">
                          Save Grade
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{submission.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
