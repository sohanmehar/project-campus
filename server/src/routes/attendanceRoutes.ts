import { Router } from 'express';
import { getStudentAttendanceSummary, createAttendanceSession, getStudentAttendanceAnalytics } from '../controllers/attendanceController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/summary', getStudentAttendanceSummary);
router.post('/sessions', requireRole(['faculty', 'admin']), createAttendanceSession);
router.get('/student', getStudentAttendanceAnalytics);

export default router;