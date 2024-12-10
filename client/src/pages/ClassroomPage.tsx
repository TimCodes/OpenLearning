import { useRoute } from "wouter";
import { useCourse } from "@/hooks/use-courses";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/classroom/Navigation";
import AssignmentList from "@/components/classroom/AssignmentList";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

export default function ClassroomPage() {
  const [, params] = useRoute("/course/:id");
  const courseId = parseInt(params?.id || "0");
  const { course, isLoading } = useCourse(courseId);
  
  // Subscribe to course notifications
  useNotifications(courseId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="bg-primary text-primary-foreground">
        <div className="container py-8">
          <h1 className="text-3xl font-bold">{course.name}</h1>
          <p className="mt-2 text-primary-foreground/80">{course.section}</p>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="assignments">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="mt-6">
            <AssignmentList courseId={courseId} />
          </TabsContent>

          <TabsContent value="people" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Teachers</h3>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {course.teacher?.name?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{course.teacher?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4 flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Students
                    </h3>
                    <div className="space-y-4">
                      {course.enrollments?.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center space-x-4"
                        >
                          <Avatar>
                            <AvatarFallback>
                              {enrollment.student.name[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {enrollment.student.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
