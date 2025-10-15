import { Router } from 'express';
import { authenticate, requireRoles } from '../system/auth';
import { router as filesRouter } from '../system/files';
import { router as notifyRouter } from '../system/notify';
import { dashboardRouter } from '../telemetry/dashboard';

export const router = Router();

router.use('/files', authenticate, filesRouter);
router.use('/notify', authenticate, notifyRouter);
router.use('/monitor', dashboardRouter);

router.get('/admin/stats', authenticate, requireRoles('admin'), (_req, res) => {
  res.json({ users: 0, uptime: process.uptime() });
});


