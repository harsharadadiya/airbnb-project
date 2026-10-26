import { Router } from 'express';
import { deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();

router.delete('/:id', protect, validateObjectId(), deleteReview);

export default router;
