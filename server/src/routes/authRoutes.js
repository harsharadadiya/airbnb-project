import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, updateMe, becomeHost } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/schemas.js';
import { isProduction } from '../config/env.js';

const router = Router();

// Slow down password guessing: max 20 login/register attempts per 15 minutes per IP in production
// (a higher limit in development so testing is not blocked)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 20 : 500,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

router.post('/register', authLimiter, validate({ body: registerSchema }), register);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.get('/me', protect, getMe);
router.patch('/me', protect, validate({ body: updateProfileSchema }), updateMe);
router.post('/become-host', protect, becomeHost);

export default router;
