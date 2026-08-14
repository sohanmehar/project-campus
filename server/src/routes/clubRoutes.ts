import { Router } from 'express';
import { getClubs, joinClub, leaveClub } from '../controllers/clubController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getClubs);
router.post('/:id/join', authenticateToken, joinClub);
router.delete('/:id/leave', authenticateToken, leaveClub);

export default router;
