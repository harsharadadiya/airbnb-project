// One listing in the grid: photo, place, rating and price.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import SafeImage from '@/components/common/SafeImage';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function ListingCard({ listing, active, onHover, linkSearch = '' }) {
  const [index, setIndex] = useState(0);
  const images = listing.images?.length ? listing.images : [''];

  function step(event, direction) {
    event.preventDefault(); // don't open the listing when clicking the arrows
    setIndex((i) => (i + direction + images.length) % images.length);
  }

  return (
    <Link
      to={`/listings/${listing._id}${linkSearch}`}
      className="group block rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      onMouseEnter={() => onHover?.(listing._id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className={cn('relative aspect-[20/19] overflow-hidden rounded-2xl bg-muted', active && 'ring-2 ring-foreground')}>
        <SafeImage
          src={images[index]}
          alt={listing.title}
          className="size-full transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold shadow-sm">
          {listing.category}
        </span>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => step(e, -1)}
              className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition group-hover:opacity-100 hover:scale-105"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={(e) => step(e, 1)}
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition group-hover:opacity-100 hover:scale-105"
              aria-label="Next photo"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1">
              {images.map((src, i) => (
                <span key={src + i} className={cn('size-1.5 rounded-full bg-white/60', i === index && 'bg-white')} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="truncate font-bold">
          {listing.location.city}, {listing.location.country}
        </h3>
        <span className="flex shrink-0 items-center gap-1 text-sm">
          <Star className="size-3.5 fill-current" />
          {listing.reviewCount ? listing.avgRating.toFixed(2) : 'New'}
        </span>
      </div>
      <p className="truncate text-sm text-muted-foreground">{listing.title}</p>
      <p className="mt-1 text-sm">
        <span className="font-bold">{formatPrice(listing.pricePerNight)}</span> night
      </p>
    </Link>
  );
}
