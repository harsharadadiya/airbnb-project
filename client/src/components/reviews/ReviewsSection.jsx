// Reviews on the listing page: average, list of reviews, and the form (only after a completed stay).
import { useState } from 'react';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { reviewService } from '@/services';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/common/UserAvatar';
import { ErrorState } from '@/components/common/StateViews';
import { formatDate, plural } from '@/lib/format';
import ReviewForm from './ReviewForm';

export default function ReviewsSection({ listing, onStatsChange }) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const reviews = useAsync(() => reviewService.list(listing._id), [listing._id]);
  const eligibility = useAsync(
    () => (user ? reviewService.eligibility(listing._id) : Promise.resolve({ canReview: false })),
    [listing._id, user?._id]
  );

  async function refresh() {
    setShowForm(false);
    await Promise.all([reviews.reload(), eligibility.reload()]);
    onStatsChange?.(); // reload the listing so the average rating updates
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete your review?')) return;
    try {
      await reviewService.remove(id);
      toast.success('Review deleted');
      refresh();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <section aria-labelledby="reviews-heading">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 id="reviews-heading" className="flex items-center gap-2 text-2xl font-extrabold">
          <Star className="size-6 fill-current" />
          {listing.reviewCount ? `${listing.avgRating.toFixed(2)} · ${plural(listing.reviewCount, 'review')}` : 'No reviews yet'}
        </h2>
        {eligibility.data?.canReview && !showForm && <Button onClick={() => setShowForm(true)}>Write a review</Button>}
      </div>

      {showForm && (
        <div className="mb-8">
          <ReviewForm listingId={listing._id} onCreated={refresh} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {reviews.error ? (
        <ErrorState error={reviews.error} onRetry={reviews.reload} />
      ) : reviews.loading ? (
        <div className="grid gap-8 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton width="40%" />
              <Skeleton height={60} />
            </div>
          ))}
        </div>
      ) : reviews.data.length === 0 ? (
        <p className="text-muted-foreground">
          Be the first to stay here and share your experience.
          {user && eligibility.data?.reason && <span className="block text-sm">{eligibility.data.reason}.</span>}
        </p>
      ) : (
        <ul className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          {reviews.data.map((review) => (
            <li key={review._id}>
              <div className="flex items-center gap-3">
                <UserAvatar user={review.author} className="size-10" />
                <div className="flex-1">
                  <p className="font-bold">{review.author?.name ?? 'Former guest'}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(review.createdAt, 'MMMM yyyy')}</p>
                </div>
                {user && review.author?._id === user._id && (
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(review._id)} aria-label="Delete review">
                    <Trash2 />
                  </Button>
                )}
              </div>
              <Rating value={review.rating} readOnly size="small" sx={{ mt: 1 }} />
              <p className="mt-1 leading-relaxed">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
