import { Router } from 'express';
import { getComplaints, createComplaint, getAllComplaints, updateComplaintStatus } from '../controllers/complaintController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getComplaints);
router.get('/my-tickets', getComplaints); // Alias mapping for frontend compatibility
router.post('/', createComplaint);
router.get('/admin/all', requireRole(['admin']), getAllComplaints);
router.patch('/:id/status', requireRole(['admin']), updateComplaintStatus);

export default router;