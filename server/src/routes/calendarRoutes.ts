import { Router } from 'express';
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../controllers/calendarController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// All authenticated users can view calendar
router.get('/', getCalendarEvents);

// Only Coordinators and Admin can modify calendar events/holidays
router.post('/', requireRole(['coordinator', 'admin']), createCalendarEvent);
router.put('/:id', requireRole(['coordinator', 'admin']), updateCalendarEvent);
router.delete('/:id', requireRole(['coordinator', 'admin']), deleteCalendarEvent);

export default router;
