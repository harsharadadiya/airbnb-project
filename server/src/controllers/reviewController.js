import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { Listing } from '../models/Listing.js';
import { AppError } from '../utils/AppError.js';
import { todayUTC } from '../utils/dates.js';

// Has this user finished a stay here? (Only then may they review.)
async function hasCompletedStay(userId, listingId) {
  return Booking.exists({
    guest: userId,
    listing: listingId,
    status: 'confirmed',
    checkOut: { $lte: todayUTC() },
  });
}

// GET /api/listings/:id/reviews
export async function getReviews(req, res) {
  const reviews = await Review.find({ listing: req.params.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('author', 'name avatarUrl');
  res.json({ reviews });
}

// GET /api/listings/:id/reviews/eligibility  -> { canReview, reason }
export async function getReviewEligibility(req, res) {
  const already = await Review.exists({ listing: req.params.id, author: req.user._id });
  if (already) return res.json({ canReview: false, reason: 'You already reviewed this place' });

  const completed = await hasCompletedStay(req.user._id, req.params.id);
  if (!completed) return res.json({ canReview: false, reason: 'You can review after you complete a stay here' });

  res.json({ canReview: true });
}

// POST /api/listings/:id/reviews
export async function createReview(req, res) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new AppError('Listing not found', 404);

  if (!(await hasCompletedStay(req.user._id, listing._id))) {
    throw new AppError('You can only review places where you have completed a stay', 403);
  }
  if (await Review.exists({ listing: listing._id, author: req.user._id })) {
    throw new AppError('You already reviewed this place', 409);
  }

  const review = await Review.create({ ...req.body, listing: listing._id, author: req.user._id });
  await Review.recalcListingStats(listing._id);
  await review.populate('author', 'name avatarUrl');

  res.status(201).json({ review });
}

// DELETE /api/reviews/:id  (author only)
export async function deleteReview(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  if (!review.author.equals(req.user._id)) throw new AppError('You can only delete your own reviews', 403);

  await review.deleteOne();
  await Review.recalcListingStats(review.listing);
  res.json({ message: 'Review deleted' });
}
