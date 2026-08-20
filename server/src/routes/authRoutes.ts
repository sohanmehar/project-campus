import { Router } from 'express';
import { 
  signup, 
  login, 
  googleLogin, 
  logout, 
  getMe, 
  updateStudentProfile,
  completeStudentOnboarding,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public auth routes (NO middleware)
router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (Requires valid JWT token)
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateStudentProfile);
router.post('/onboarding', authenticateToken, completeStudentOnboarding);

export default router;