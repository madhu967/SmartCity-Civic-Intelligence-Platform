import { Router } from 'express';
import { sendChatMessage } from '../controllers/chatController.js';
import optionalAuth from '../middleware/optionalAuthMiddleware.js';

const router = Router();

router.post('/', optionalAuth, sendChatMessage);

export default router;
