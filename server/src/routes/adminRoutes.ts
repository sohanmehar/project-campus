import { Router } from 'express';
import { 
  getAdminStats, 
  getStudentsRegistry, 
  toggleStudentStatus,
  importStudentsBulk,
  getFacultyList,
  addFacultyMember,
  importFacultyBulk,
  deleteFacultyMember,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  addCourseToDepartment,
  deleteCourseFromDepartment,
  getSystemSettings,
  updateSystemSettings,
  getAiPlatformMetrics
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// Allow both Faculty and Admin to read department catalog
router.get('/departments', requireRole(['admin', 'faculty', 'student']), getDepartments);

// Restrict administrative mutations to Admin only
router.use(requireRole(['admin']));

router.get('/stats', getAdminStats);
router.get('/students', getStudentsRegistry);
router.patch('/students/:id/status', toggleStudentStatus);
router.post('/students/bulk-import', importStudentsBulk);

router.get('/faculty', getFacultyList);
router.post('/faculty', addFacultyMember);
router.post('/faculty/bulk-import', importFacultyBulk);
router.delete('/faculty/:id', deleteFacultyMember);

router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);
router.post('/departments/:id/courses', addCourseToDepartment);
router.delete('/departments/:id/courses/:courseCode', deleteCourseFromDepartment);

router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);
router.get('/ai-metrics', getAiPlatformMetrics);

export default router;