import express from 'express';
import { 
  getFacultyDashboard,
  getStudentsForAttendance,
  markAttendanceSession,
  getAttendanceSession,
  createAssignment,
  getFacultyAssignments,
  deleteAssignment,
  gradeSubmission,
  getFacultySubmissions,
  createNotice,
  getNotices,
  deleteNotice,
  addFacultyCourse,
  deleteFacultyCourse,
  updateCourseSyllabus
} from '../controllers/facultyController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

// Apply global authentication token verification to all faculty routes
router.use(authenticateToken);

// Dashboard & Students
router.get('/dashboard', requireRole(['faculty', 'admin']), getFacultyDashboard);
router.get('/students', requireRole(['faculty', 'admin']), getStudentsForAttendance);

// Attendance Engine
router.post('/attendance', requireRole(['faculty', 'admin']), markAttendanceSession);
router.get('/attendance/session', requireRole(['faculty', 'admin']), getAttendanceSession);

// Assignments & Grading
router.get('/assignments', requireRole(['faculty', 'admin']), getFacultyAssignments);
router.post('/assignments', requireRole(['faculty', 'admin']), createAssignment);
router.delete('/assignments/:id', requireRole(['faculty', 'admin']), deleteAssignment);
router.get('/submissions', requireRole(['faculty', 'admin']), getFacultySubmissions);
router.put('/submissions/:id/grade', requireRole(['faculty', 'admin']), gradeSubmission);
router.patch('/submissions/:id/grade', requireRole(['faculty', 'admin']), gradeSubmission);

// Notices & Course Content
router.post('/notices', requireRole(['faculty', 'admin', 'coordinator']), createNotice);
router.get('/notices', getNotices);
router.delete('/notices/:id', requireRole(['faculty', 'admin', 'coordinator']), deleteNotice);
router.post('/courses', requireRole(['faculty', 'admin']), addFacultyCourse);
router.delete('/courses/:code', requireRole(['faculty', 'admin']), deleteFacultyCourse);
router.put('/courses/:code/syllabus', requireRole(['faculty', 'admin']), updateCourseSyllabus);

export default router;