// One listing: photos, details, amenities, map, reviews and the booking box.
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import { ArrowLeft, Bath, BedDouble, DoorOpen, MapPin, Star, Users } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { listingService } from '@/services';
import ImageGallery from '@/components/listings/ImageGallery';
import ListingMap from '@/components/listings/ListingMap';
import BookingWidget from '@/components/booking/BookingWidget';
import ReviewsSection from '@/components/reviews/ReviewsSection';
import UserAvatar from '@/components/common/UserAvatar';
import { EmptyState, ErrorState } from '@/components/common/StateViews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { amenityIcon } from '@/lib/constants';
import { formatDate, plural } from '@/lib/format';

export default function ListingDetailPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { data: listing, loading, error, reload } = useAsync(() => listingService.get(id), [id]);

  if (loading && !listing) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        {error.status === 404 ? (
          <EmptyState
            title="This place is not available"
            description="It may have been removed by the host."
            action={
              <Button asChild>
                <Link to="/">Browse other stays</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState error={error} onRetry={reload} />
        )}
      </div>
    );
  }

  const facts = [
    { icon: Users, text: plural(listing.maxGuests, 'guest') },
    { icon: DoorOpen, text: listing.bedrooms ? plural(listing.bedrooms, 'bedroom') : 'Studio' },
    { icon: BedDouble, text: plural(listing.beds, 'bed') },
    { icon: Bath, text: plural(listing.bathrooms, 'bath') },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All stays
      </Link>

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{listing.title}</h1>
      <div className="mt-2 mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="flex items-center gap-1 font-semibold">
          <Star className="size-4 fill-current" />
          {listing.reviewCount ? `${listing.avgRating.toFixed(2)} · ${plural(listing.reviewCount, 'review')}` : 'New'}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="size-4" />
          {listing.location.city}, {listing.location.country}
        </span>
        <Badge variant="secondary">{listing.category}</Badge>
      </div>

      <ImageGallery images={listing.images} title={listing.title} />

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {/* Host + quick facts */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Hosted by {listing.host?.name ?? 'a StayNest host'}</h2>
              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                {facts.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-1.5">
                    <Icon className="size-4" /> {text}
                  </li>
                ))}
              </ul>
            </div>
            <UserAvatar user={listing.host} className="size-14 text-base" />
          </div>
          {listing.host?.createdAt && (
            <p className="mt-2 text-sm text-muted-foreground">Hosting since {formatDate(listing.host.createdAt, 'MMMM yyyy')}</p>
          )}

          <Separator className="my-8" />

          <h2 className="mb-3 text-xl font-bold">About this place</h2>
          <p className="leading-relaxed whitespace-pre-line text-foreground/90">{listing.description}</p>

          <Separator className="my-8" />

          <h2 className="mb-4 text-xl font-bold">What this place offers</h2>
          {listing.amenities.length ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {listing.amenities.map((name) => {
                const Icon = amenityIcon(name);
                return (
                  <li key={name} className="flex items-center gap-3">
                    <Icon className="size-5 text-muted-foreground" /> {name}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground">The host has not listed amenities yet.</p>
          )}

          <Separator className="my-8" />

          <h2 className="mb-1 text-xl font-bold">Where you’ll be</h2>
          <p className="mb-4 text-muted-foreground">
            {listing.location.address}, {listing.location.city}, {listing.location.country}
          </p>
          <div className="h-80 overflow-hidden rounded-2xl border">
            <ListingMap listings={[listing]} activeId={listing._id} />
          </div>

          <Separator className="my-8" />

          <ReviewsSection listing={listing} onStatsChange={reload} />
        </div>

        <aside>
          <div className="lg:sticky lg:top-24">
            <BookingWidget
              listing={listing}
              initialCheckIn={params.get('checkIn')}
              initialCheckOut={params.get('checkOut')}
              initialGuests={params.get('guests')}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8" aria-busy="true">
      <Skeleton width="55%" height={44} />
      <Skeleton width="30%" />
      <Skeleton variant="rounded" height={440} sx={{ mt: 2, borderRadius: '16px' }} />
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <Skeleton width="40%" height={32} />
          <Skeleton width="60%" />
          <Skeleton variant="rounded" height={140} sx={{ mt: 3 }} />
        </div>
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: '16px' }} />
      </div>
    </div>
  );
}
