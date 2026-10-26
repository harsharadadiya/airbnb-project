// Authentication middleware.
// protect      -> the request must have a valid token ("Authorization: Bearer <token>")
// requireRole  -> the logged-in user must have a certain role (e.g. "host")
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/token.js';

export async function protect(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Please log in to continue', 401);
  }

  const payload = verifyToken(token); // errors are handled in errorHandler.js
  const user = await User.findById(payload.sub);
  if (!user) throw new AppError('This account no longer exists', 401);

  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to do this', 403);
    }
    next();
  };
}
