import { Router } from 'express';
import { 
  getAdminStats, 
  getAllUsers,
  updateUserRole,
  deleteUser,
  getStudentsRegistry, 
  toggleStudentStatus,
  importStudentsBulk,
  addStudent,
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
  getAiPlatformMetrics,
  globalSearch,
  getAdminComplaints,
  updateComplaintStatus,
  getEventAnalytics
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// Public search & Department catalog read
router.get('/search', globalSearch);
router.get('/departments', requireRole(['admin', 'faculty', 'student', 'coordinator']), getDepartments);

// Restricted Administrative Mutations
router.use(requireRole(['admin']));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/students', getStudentsRegistry);
router.patch('/students/:id/status', toggleStudentStatus);
router.post('/students/bulk-import', importStudentsBulk);
router.post('/students', addStudent);

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
router.get('/complaints', getAdminComplaints);
router.patch('/complaints/:id', updateComplaintStatus);
router.get('/events-analytics', getEventAnalytics);

export default router;