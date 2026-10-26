// "My trips": upcoming, past and cancelled bookings for the logged-in guest.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import { CalendarDays, Luggage, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAsync } from '@/hooks/useAsync';
import { bookingService } from '@/services';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SafeImage from '@/components/common/SafeImage';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { EmptyState, ErrorState } from '@/components/common/StateViews';
import ReviewForm from '@/components/reviews/ReviewForm';
import { formatDateRange, formatPrice, fromDateKey, plural } from '@/lib/format';
import { startOfToday } from 'date-fns';

export default function TripsPage() {
  const { data: bookings, loading, error, reload } = useAsync(() => bookingService.mine(), []);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  const today = startOfToday();
  const groups = { upcoming: [], past: [], cancelled: [] };
  for (const b of bookings ?? []) {
    if (b.status === 'cancelled') groups.cancelled.push(b);
    else if (fromDateKey(b.checkOut) > today) groups.upcoming.push(b);
    else groups.past.push(b);
  }
  groups.upcoming.reverse(); // soonest first

  async function handleCancel() {
    try {
      await bookingService.cancel(cancelTarget._id);
      toast.success('Booking cancelled. The dates are free again.');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight">My trips</h1>
      <p className="mt-1 text-muted-foreground">Everything you have booked, in one place.</p>

      <div className="mt-8">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: '16px' }} />
            ))}
          </div>
        ) : !bookings.length ? (
          <EmptyState
            icon={Luggage}
            title="No trips booked… yet!"
            description="Time to dust off your bags and start planning your next adventure."
            action={
              <Button asChild>
                <Link to="/">Start searching</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-10">
            <TripGroup title="Upcoming" items={groups.upcoming} onCancel={setCancelTarget} />
            <TripGroup title="Past stays" items={groups.past} onReview={setReviewTarget} />
            <TripGroup title="Cancelled" items={groups.cancelled} />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel this booking?"
        description={cancelTarget && `${cancelTarget.listing?.title} · ${formatDateRange(cancelTarget.checkIn, cancelTarget.checkOut)}`}
        confirmLabel="Yes, cancel booking"
        destructive
        onConfirm={handleCancel}
      />

      <Dialog open={Boolean(reviewTarget)} onOpenChange={(open) => !open && setReviewTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How was your stay?</DialogTitle>
            <DialogDescription>{reviewTarget?.listing?.title}</DialogDescription>
          </DialogHeader>
          {reviewTarget && (
            <ReviewForm
              listingId={reviewTarget.listing._id}
              onCreated={() => {
                setReviewTarget(null);
                reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TripGroup({ title, items, onCancel, onReview }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">
        {title} <span className="text-muted-foreground">({items.length})</span>
      </h2>
      <ul className="grid gap-4">
        {items.map((booking) => (
          <TripCard key={booking._id} booking={booking} onCancel={onCancel} onReview={onReview} />
        ))}
      </ul>
    </section>
  );
}

function TripCard({ booking, onCancel, onReview }) {
  const { listing } = booking;
  const status =
    booking.status === 'cancelled'
      ? { label: 'Cancelled', variant: 'destructive' }
      : booking.isCompleted
        ? { label: 'Completed', variant: 'secondary' }
        : { label: 'Confirmed', variant: 'success' };

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm sm:flex-row">
      <SafeImage src={listing?.images?.[0]} alt={listing?.title ?? 'Removed listing'} className="h-44 w-full sm:h-auto sm:w-56" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            {listing ? (
              <Link to={`/listings/${listing._id}`} className="text-lg font-bold hover:underline">
                {listing.title}
              </Link>
            ) : (
              <p className="text-lg font-bold text-muted-foreground">This listing was removed</p>
            )}
            {listing && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" /> {listing.location.city}, {listing.location.country}
              </p>
            )}
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-muted-foreground" />
            {formatDateRange(booking.checkIn, booking.checkOut)} · {plural(booking.nights, 'night')}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4 text-muted-foreground" /> {plural(booking.guests, 'guest')}
          </span>
          <span className="font-semibold">{formatPrice(booking.totalPrice)} total</span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          {onCancel && fromDateKey(booking.checkIn) > startOfToday() && (
            <Button variant="outline" size="sm" onClick={() => onCancel(booking)}>
              Cancel booking
            </Button>
          )}
          {onReview && listing && booking.isCompleted && !booking.hasReviewed && (
            <Button size="sm" onClick={() => onReview(booking)}>
              Write a review
            </Button>
          )}
          {onReview && booking.hasReviewed && <span className="text-sm text-muted-foreground">✓ You reviewed this place</span>}
        </div>
      </div>
    </li>
  );
}
