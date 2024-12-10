import type { Express } from "express";
import { createServer } from "http";
import { setupAuth } from "./auth";
import { setupNotifications } from "./notifications/notifications.gateway";
import { db } from "../db";
import { courses, assignments, submissions, users, enrollments } from "@db/schema";
import { eq, and } from "drizzle-orm";

export function registerRoutes(app: Express): void {
  setupAuth(app);

  // Courses
  app.get("/api/courses", async (req, res) => {
    const userCourses = await db.select({
      id: courses.id,
      name: courses.name,
      description: courses.description,
      section: courses.section,
      teacherId: courses.teacherId,
      createdAt: courses.createdAt,
      teacher: users
    })
    .from(courses)
    .where(
      req.user?.role === "teacher" 
        ? eq(courses.teacherId, req.user.id)
        : undefined
    )
    .leftJoin(users, eq(courses.teacherId, users.id));
    res.json(userCourses);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const [course] = await db.select({
      course: {
        id: courses.id,
        name: courses.name,
        description: courses.description,
        section: courses.section,
        teacherId: courses.teacherId,
        createdAt: courses.createdAt
      },
      teacher: {
        id: users.id,
        name: users.name,
        role: users.role
      }
    })
    .from(courses)
    .where(eq(courses.id, parseInt(req.params.id)))
    .leftJoin(users, eq(courses.teacherId, users.id))
    .limit(1);
    
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
  app.post("/api/courses/:courseId/assignments", async (req, res) => {
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).send("Only teachers can create assignments");
    }

    const courseId = parseInt(req.params.courseId);
    const { dueDate, ...rest } = req.body;
    
    // Parse the date string from the datetime-local input
    let parsedDate = null;
    if (dueDate) {
      try {
        parsedDate = new Date(dueDate);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).send("Invalid date format");
        }
      } catch (error) {
        return res.status(400).send("Invalid date format");
      }
    }
    
    const [assignment] = await db.insert(assignments).values({
      ...rest,
      courseId,
      dueDate: parsedDate,
    }).returning();

    res.json(assignment);
  });

  app.get("/api/courses/:courseId/assignments", async (req, res) => {
    const courseAssignments = await db.select()
      .from(assignments)
      .where(eq(assignments.courseId, parseInt(req.params.courseId)))
      .leftJoin(
        submissions,
        and(
          eq(assignments.id, submissions.assignmentId),
          req.user?.role === "student"
            ? eq(submissions.studentId, req.user.id)
            : undefined
        )
      )
      .leftJoin(users, eq(submissions.studentId, users.id));
    res.json(courseAssignments);
  });

  app.get("/api/assignments/:id", async (req, res) => {
    const [assignment] = await db.select({
      assignment: {
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        dueDate: assignments.dueDate,
        courseId: assignments.courseId,
        points: assignments.points,
        createdAt: assignments.createdAt
      },
      submissions: {
        id: submissions.id,
        content: submissions.content,
        submittedAt: submissions.submittedAt,
        grade: submissions.grade,
        feedback: submissions.feedback,
        student: {
          id: users.id,
          name: users.name
        }
      }
    })
    .from(assignments)
    .where(eq(assignments.id, parseInt(req.params.id)))
    .leftJoin(
      submissions,
      and(
        eq(assignments.id, submissions.assignmentId),
        req.user?.role === "student"
          ? eq(submissions.studentId, req.user.id)
          : undefined
      )
    )
    .leftJoin(users, eq(submissions.studentId, users.id))
    .limit(1);
    
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
    const assignment = await db.query[assignments.name].findFirst({
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
