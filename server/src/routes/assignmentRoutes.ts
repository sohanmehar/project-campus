import { Router } from 'express';
import { getAssignments, submitAssignment, getMySubmissions } from '../controllers/assignmentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getAssignments);
router.post('/submit', submitAssignment);
router.get('/my-submissions', getMySubmissions);

export default router;