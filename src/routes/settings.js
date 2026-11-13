import { Router } from 'express';
import { getSettings, updateSettings, updateProfile } from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.get('/', getSettings);
router.put('/', updateSettings);
router.put('/profile', updateProfile);

export default router;
