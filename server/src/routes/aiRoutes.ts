import { Router } from 'express';
import { handleAiQuery, getChatHistory } from '../controllers/aiController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/query', handleAiQuery);
router.get('/history', getChatHistory);

export default router;