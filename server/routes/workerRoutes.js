import { Router } from 'express';
import { listAssignedIssues, updateAssignedIssue, updateAvailability } from '../controllers/workerController.js';
import requireAuth from '../middleware/authMiddleware.js';
import requireWorker from '../middleware/workerMiddleware.js';

const router = Router();

router.use(requireAuth, requireWorker);
router.patch('/availability', updateAvailability);
router.get('/issues', listAssignedIssues);
router.patch('/issues/:issueId', updateAssignedIssue);

export default router;