import { Router } from 'express';
import { createForm, getForms } from '../controllers/formController';

const router = Router();

// GET /forms -> list form entries (including coordinates)
router.get('/', getForms);

// POST /forms -> create a new form entry
router.post('/', createForm);

export default router;
