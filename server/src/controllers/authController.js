import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/token.js';

// POST /api/auth/register
export async function register(req, res) {
  const { name, email, password, role } = req.body;

  const exists = await User.exists({ email });
  if (exists) throw new AppError('An account with this email already exists', 409);

  const user = await User.create({ name, email, password, role });
  res.status(201).json({ token: signToken(user._id), user });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  // Same message for "no user" and "wrong password" so attackers cannot guess emails
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  res.json({ token: signToken(user._id), user });
}

// GET /api/auth/me
export async function getMe(req, res) {
  res.json({ user: req.user });
}

// PATCH /api/auth/me
export async function updateMe(req, res) {
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json({ user: req.user });
}

// POST /api/auth/become-host
export async function becomeHost(req, res) {
  if (req.user.role !== 'host') {
    req.user.role = 'host';
    await req.user.save();
  }
  res.json({ user: req.user });
}
