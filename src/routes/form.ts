import { Router } from 'express';
import { createForm, getForms, getLocation } from '../controllers/formController';

const router = Router();

// GET /forms -> list form entries (including coordinates)
router.get('/', getForms);

// GET /forms/getLocation -> list only entries that have coordinates
router.get('/getLocation', getLocation);

// POST /forms -> create a new form entry
router.post('/', createForm);

export default router;
