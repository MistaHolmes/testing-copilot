import { Router } from 'express';
import { checkHealth } from '../controllers/healthController';

const router = Router();

// GET /health -> handled by controller
router.get('/', checkHealth);

export default router;