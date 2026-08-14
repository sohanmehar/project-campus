import { Router } from 'express';
import { 
  getEvents, 
  createEvent,
  deleteEvent,
  registerForEvent, 
  getStudentRegistrations, 
  cancelRegistration 
} from '../controllers/eventController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getEvents);
router.post('/', requireRole(['admin', 'coordinator']), createEvent);
router.delete('/:id', requireRole(['admin', 'coordinator']), deleteEvent);
router.post('/:id/register', registerForEvent);
router.get('/my-registrations', getStudentRegistrations);
router.delete('/registrations/:id', cancelRegistration);

export default router;