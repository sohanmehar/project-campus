import { Router } from 'express';
import { getCoordinatorStats, decideActivityApproval } from '../controllers/coordinatorController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/stats', getCoordinatorStats);
router.post('/approvals/:id/decide', decideActivityApproval);

export default router;
