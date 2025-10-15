import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { authenticate, authorize, asyncHandler } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimit';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock user database
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    roles: ['admin'],
    permissions: ['read', 'write', 'delete'],
    isActive: true
  }
];

router.post('/login', authRateLimiter, asyncHandler(async (req: AuthRequest, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email && u.isActive);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    logger.warn('Failed login attempt', { email });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      roles: user.roles
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  logger.info('User logged in successfully', { userId: user.id });
  
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      roles: user.roles
    }
  });
}));

router.get('/profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({
    user: req.user
  });
}));

router.get('/admin', authenticate, authorize('admin'), asyncHandler(async (req: AuthRequest, res) => {
  res.json({ 
    message: 'Welcome admin!',
    users: users.map(u => ({ id: u.id, email: u.email, roles: u.roles }))
  });
}));

export default router;