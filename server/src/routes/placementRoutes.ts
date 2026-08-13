import { Router } from 'express';
import { 
  getPlacementDrives, 
  createPlacementDrive, 
  deletePlacementDrive, 
  checkEligibilityAI, 
  applyForPlacement ,
  getStudentApplications
} from '../controllers/placementController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/drives', getPlacementDrives);
router.post('/drives', requireRole(['admin']), createPlacementDrive);
router.delete('/drives/:id', requireRole(['admin']), deletePlacementDrive);
router.post('/:id/check-eligibility', checkEligibilityAI);
router.post('/:id/apply', applyForPlacement);
router.get('/my-applications', getStudentApplications);

export default router;