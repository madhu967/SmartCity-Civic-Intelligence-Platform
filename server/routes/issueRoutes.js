import { Router } from 'express';
import requireAuth from '../middleware/authMiddleware.js';
import requireCitizen from '../middleware/citizenMiddleware.js';
import { createIssue, detectIssueCategory, getMyIssues, getCommunityIssues, getCivicStats } from '../controllers/issueController.js';

const router = Router();

router.get('/community', requireAuth, getCommunityIssues);
router.get('/stats', requireAuth, getCivicStats);

router.use(requireAuth, requireCitizen);
router.get('/', getMyIssues);
router.post('/detect-category', detectIssueCategory);
router.post('/', createIssue);

export default router;
