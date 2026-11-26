import { Router } from 'express';
import { UserController } from '../controllers/collaboration.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/me', UserController.getProfile);
router.patch('/me', UserController.updateProfile);
router.patch('/me/preferences', UserController.updatePreferences);

export default router;
