import { Router } from 'express';
import { 
  getEvents, 
  registerForEvent, 
  getStudentRegistrations, 
  cancelRegistration 
} from '../controllers/eventController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getEvents);
router.post('/:id/register', registerForEvent);
router.get('/my-registrations', getStudentRegistrations);
router.delete('/registrations/:id', cancelRegistration);

export default router;