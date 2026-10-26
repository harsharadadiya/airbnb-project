import { Router } from 'express';
import {
  getMeta,
  getListings,
  getListing,
  getAvailability,
  createListing,
  updateListing,
  deleteListing,
} from '../controllers/listingController.js';
import { getReviews, createReview, getReviewEligibility } from '../controllers/reviewController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import {
  listingQuerySchema,
  createListingSchema,
  updateListingSchema,
  createReviewSchema,
} from '../validators/schemas.js';

const router = Router();

// Public (no login needed)
router.get('/', validate({ query: listingQuerySchema }), getListings);
router.get('/meta', getMeta);
router.get('/:id', validateObjectId(), getListing);
router.get('/:id/availability', validateObjectId(), getAvailability);
router.get('/:id/reviews', validateObjectId(), getReviews);

// Logged-in users
router.get('/:id/reviews/eligibility', protect, validateObjectId(), getReviewEligibility);
router.post('/:id/reviews', protect, validateObjectId(), validate({ body: createReviewSchema }), createReview);

// Hosts only
router.post('/', protect, requireRole('host'), validate({ body: createListingSchema }), createListing);
router.patch('/:id', protect, requireRole('host'), validateObjectId(), validate({ body: updateListingSchema }), updateListing);
router.delete('/:id', protect, requireRole('host'), validateObjectId(), deleteListing);

export default router;
