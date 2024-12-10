import type { Express } from "express";
import { createServer } from "http";
import { setupAuth } from "./auth";
import { setupNotifications } from "./notifications/notifications.gateway";
import { db } from "../db";
import { courses, assignments, submissions } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): void {
  setupAuth(app);

  // Courses
  app.get("/api/courses", async (req, res) => {
    const userCourses = await db.query.courses.findMany({
      where: req.user?.role === "teacher" 
        ? eq(courses.teacherId, req.user.id)
        : undefined,
      with: {
        teacher: true,
      },
    });
    res.json(userCourses);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, parseInt(req.params.id)),
      with: {
        teacher: true,
        enrollments: {
          with: {
            student: true,
          },
        },
      },
    });
    
    if (!course) {
      return res.status(404).send("Course not found");
    }
    
    res.json(course);
  });

  app.post("/api/courses", async (req, res) => {
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).send("Only teachers can create courses");
    }

    const course = await db.insert(courses).values({
      ...req.body,
      teacherId: req.user.id,
    }).returning();

    res.json(course[0]);
  });

  // Assignments
  app.get("/api/courses/:courseId/assignments", async (req, res) => {
    const courseAssignments = await db.query.assignments.findMany({
      where: eq(assignments.courseId, parseInt(req.params.courseId)),
      with: {
        submissions: {
          where: req.user?.role === "student" 
            ? eq(submissions.studentId, req.user.id)
            : undefined,
          with: {
            student: true,
          },
        },
      },
    });
    res.json(courseAssignments);
  });

  app.get("/api/assignments/:id", async (req, res) => {
    const assignment = await db.query.assignments.findFirst({
      where: eq(assignments.id, parseInt(req.params.id)),
      with: {
        course: true,
        submissions: {
          with: {
            student: true,
          },
          where: req.user?.role === "student" 
            ? eq(submissions.studentId, req.user.id)
            : undefined,
        },
      },
    });
    
    if (!assignment) {
      return res.status(404).send("Assignment not found");
    }
    
    res.json(assignment);
  });

  app.post("/api/assignments/:id/submit", async (req, res) => {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).send("Only students can submit assignments");
    }

    const submission = await db.insert(submissions).values({
      assignmentId: parseInt(req.params.id),
      studentId: req.user.id,
      content: req.body.content,
    }).returning();

    res.json(submission[0]);
  });

  app.post("/api/assignments/:id/grade", async (req, res) => {
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).send("Only teachers can grade assignments");
    }

    const { submissionId, grade } = req.body;
    
    const [updatedSubmission] = await db
      .update(submissions)
      .set({ grade })
      .where(eq(submissions.id, submissionId))
      .returning();

    if (!updatedSubmission) {
      return res.status(404).send("Submission not found");
    }

    // Get course information for the notification
    const assignment = await db.query.assignments.findFirst({
      where: eq(assignments.id, parseInt(req.params.id)),
      with: {
        course: true,
      },
    });

    if (assignment) {
      const io = req.app.get('io');
      io.emit('notify', {
        type: 'grade',
        title: 'Grade Posted',
        message: `Your grade for ${assignment.title} has been posted`,
        courseId: assignment.courseId,
        studentId: updatedSubmission.studentId,
      });
    }

    res.json(updatedSubmission);
  });

  // Routes registered successfully
}
