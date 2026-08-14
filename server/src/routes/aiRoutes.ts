import { Router } from 'express';
import { handleAiQuery, getChatHistory, deleteChatConversation } from '../controllers/aiController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/query', handleAiQuery);
router.post('/chat', handleAiQuery);
router.get('/history', getChatHistory);
router.delete('/history/:id', deleteChatConversation);

export default router;