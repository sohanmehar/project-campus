import { Router } from 'express';
import { signup, login, googleLogin, logout, getMe, updateStudentProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public auth routes (NO middleware)
router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', logout);

// Protected routes (Requires valid JWT token)
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateStudentProfile);

export default router;