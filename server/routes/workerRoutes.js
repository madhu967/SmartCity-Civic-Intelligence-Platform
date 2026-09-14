import { Router } from 'express';
import { updateAvailability } from '../controllers/workerController.js';
import requireAuth from '../middleware/authMiddleware.js';
import requireWorker from '../middleware/workerMiddleware.js';

const router = Router();

router.use(requireAuth, requireWorker);
router.patch('/availability', updateAvailability);

export default router;