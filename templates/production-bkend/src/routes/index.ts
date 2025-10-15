import express from 'express';
import authRoutes from './auth';
import fileRoutes from './files';
import monitoringRoutes from './monitoring';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/monitoring', monitoringRoutes);

export default router;