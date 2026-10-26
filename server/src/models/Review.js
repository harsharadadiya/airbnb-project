import mongoose from 'mongoose';
import { Listing } from './Listing.js';

const reviewSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per guest per listing
reviewSchema.index({ listing: 1, author: 1 }, { unique: true });

/**
 * REVIEW AGGREGATION
 * Recalculates the average rating and number of reviews for a listing
 * using a MongoDB aggregation pipeline, then saves them on the listing.
 */
reviewSchema.statics.recalcListingStats = async function recalcListingStats(listingId) {
  const listing = new mongoose.Types.ObjectId(String(listingId));

  // 1) Add up all star ratings for this listing   2) Count the reviews
  const [[stats], reviewCount] = await Promise.all([
    this.aggregate([
      { $match: { listing } },
      { $group: { _id: '$listing', ratingTotal: { $sum: '$rating' } } },
    ]),
    this.countDocuments({ listing }),
  ]);

  // average = total / count, rounded to 2 decimals (e.g. 4.67)
  const avgRating = reviewCount ? Math.round((stats.ratingTotal / reviewCount) * 100) / 100 : 0;
  await Listing.findByIdAndUpdate(listingId, { avgRating, reviewCount });
};

reviewSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Review = mongoose.model('Review', reviewSchema);
