import { Router } from 'express';
import { getComplaints, createComplaint } from '../controllers/complaintController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getComplaints);
router.get('/my-tickets', getComplaints); // Alias mapping for frontend compatibility
router.post('/', createComplaint);

export default router;