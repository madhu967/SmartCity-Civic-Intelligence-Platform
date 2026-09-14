import { Router } from 'express';
import { createWorker, listUsers, listWorkers, updateUserStatus } from '../controllers/adminController.js';
import requireAuth from '../middleware/authMiddleware.js';
import requireAdmin from '../middleware/adminMiddleware.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/users', listUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.post('/workers', createWorker);
router.get('/workers', listWorkers);

export default router;