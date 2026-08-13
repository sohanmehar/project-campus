import { Router } from 'express';
import { 
  getFacultyDashboard,
  getStudentsForAttendance,
  markAttendanceSession,
  getAttendanceSession,
  createAssignment,
  gradeSubmission,
  getFacultySubmissions,
  createNotice,
  getNotices,
  updateCourseSyllabus
} from '../controllers/facultyController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', requireRole(['faculty', 'admin']), getFacultyDashboard);
router.get('/students', requireRole(['faculty', 'admin']), getStudentsForAttendance);
router.post('/attendance', requireRole(['faculty', 'admin']), markAttendanceSession);
router.post('/assignments', requireRole(['faculty', 'admin']), createAssignment);
router.get('/submissions', requireRole(['faculty', 'admin']), getFacultySubmissions);
router.post('/notices', requireRole(['faculty', 'admin']), createNotice);
router.get('/notices', getNotices);
router.get('/attendance/session', requireRole(['faculty', 'admin']), getAttendanceSession);
router.put('/courses/:code/syllabus', requireRole(['faculty', 'admin']), updateCourseSyllabus);
router.put('/submissions/:id/grade', protect, gradeSubmission);
router.patch('/submissions/:id/grade', protect, gradeSubmission);

export default router;