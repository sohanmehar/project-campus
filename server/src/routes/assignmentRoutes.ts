import { Router } from 'express';
import { getAssignments, submitAssignment, getMySubmissions, reopenSubmission } from '../controllers/assignmentController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getAssignments);
router.post('/submit', submitAssignment);
router.get('/my-submissions', getMySubmissions);
router.post('/:id/reopen', requireRole(['faculty', 'admin']), reopenSubmission);

export default router;