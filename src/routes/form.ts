import { Router } from 'express';
import { createForm } from '../controllers/formController';

const router = Router();

// POST /forms -> create a new form entry
router.post('/', createForm);

export default router;
