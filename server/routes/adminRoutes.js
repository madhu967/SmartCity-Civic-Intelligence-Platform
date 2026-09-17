import { Router } from 'express';
import { createWorker, getAiCityInsights, listIssues, listUsers, listWorkers, updateIssue, updateUserStatus } from '../controllers/adminController.js';
import requireAuth from '../middleware/authMiddleware.js';
import requireAdmin from '../middleware/adminMiddleware.js';
import { listContactMessages, updateContactMessage } from '../controllers/contactController.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/insights', getAiCityInsights);
router.get('/users', listUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.post('/workers', createWorker);
router.get('/workers', listWorkers);
router.get('/issues', listIssues);
router.patch('/issues/:issueId', updateIssue);
router.get('/contacts', listContactMessages);
router.patch('/contacts/:contactId', updateContactMessage);

export default router;