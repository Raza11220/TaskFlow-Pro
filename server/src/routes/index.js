import { Router } from 'express';
import authRoutes from './auth.routes.js';
import organizationRoutes from './organization.routes.js';
import projectTaskRoutes from './projectTask.routes.js';
import collaborationRoutes from './collaboration.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);

// Organization-scoped sub-routes:
// /api/v1/organizations/:organizationId/projects, tasks, cycles, etc.
router.use('/organizations/:organizationId', projectTaskRoutes);
router.use('/organizations/:organizationId', collaborationRoutes);

export default router;
