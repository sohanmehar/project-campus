import { Router } from 'express';
import { getStudentAttendanceSummary, createAttendanceSession, updateAttendanceSession, getStudentAttendanceAnalytics } from '../controllers/attendanceController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/summary', getStudentAttendanceSummary);
router.post('/sessions', requireRole(['faculty', 'admin']), createAttendanceSession);
router.put('/sessions/:id', requireRole(['faculty', 'admin']), updateAttendanceSession);
router.get('/student', getStudentAttendanceAnalytics);

export default router;