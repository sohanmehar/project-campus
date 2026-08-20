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

// Coordinators, Admin, and Faculty can modify calendar events/holidays
router.post('/', requireRole(['coordinator', 'admin', 'faculty']), createCalendarEvent);
router.put('/:id', requireRole(['coordinator', 'admin', 'faculty']), updateCalendarEvent);
router.delete('/:id', requireRole(['coordinator', 'admin', 'faculty']), deleteCalendarEvent);

export default router;
