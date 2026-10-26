// The booking box on the listing page.
// Frontend checks: dates chosen, no booked nights inside the range, guest limit, max 30 nights.
// The server checks everything again (never trust the browser alone).
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addDays, differenceInCalendarDays, isSameDay, startOfToday } from 'date-fns';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { bookingService, listingService } from '@/services';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import GuestCounter from '@/components/listings/GuestCounter';
import { formatDate, formatDateRange, formatPrice, fromDateKey, plural, toDateKey } from '@/lib/format';
import { MAX_NIGHTS, SERVICE_FEE_RATE } from '@/lib/constants';

export default function BookingWidget({ listing, initialCheckIn, initialCheckOut, initialGuests }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [range, setRange] = useState(() =>
    initialCheckIn && initialCheckOut ? { from: fromDateKey(initialCheckIn), to: fromDateKey(initialCheckOut) } : undefined
  );
  const [guests, setGuests] = useState(Math.min(Number(initialGuests) || 1, listing.maxGuests));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Dates that are already booked by someone else
  const availability = useAsync(() => listingService.availability(listing._id), [listing._id]);
  const booked = useMemo(() => new Set(availability.data ?? []), [availability.data]);
  const isBooked = (date) => booked.has(toDateKey(date));

  // First booked night after the chosen check-in (you can check out that morning, but not later)
  const firstBlockedAfter = (start) => {
    for (let d = addDays(start, 1), i = 0; i <= MAX_NIGHTS; d = addDays(d, 1), i++) if (isBooked(d)) return d;
    return null;
  };

  // Decides which calendar days can be clicked
  const isDisabled = (date) => {
    if (date < startOfToday()) return true;
    if (range?.from && !range?.to && date > range.from) {
      // Choosing the check-out day
      if (differenceInCalendarDays(date, range.from) > MAX_NIGHTS) return true;
      const blocked = firstBlockedAfter(range.from);
      return blocked ? date > blocked : false;
    }
    return isBooked(date); // choosing the check-in day
  };

  // Our own click logic: 1st click = check-in, 2nd click = check-out
  function handleSelect(_ignored, day) {
    setFormError('');
    if (!range?.from || range.to || day <= range.from) {
      setRange({ from: day, to: undefined });
      return;
    }
    setRange({ from: range.from, to: day });
    setCalendarOpen(false);
  }

  const nights = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const subtotal = nights * listing.pricePerNight;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;
  const isOwnListing = user && String(listing.host?._id ?? listing.host) === String(user._id);

  function handleReserveClick() {
    if (!user) {
      // Remember where we were (with the chosen dates) and come back after login
      const params = new URLSearchParams();
      if (nights) {
        params.set('checkIn', toDateKey(range.from));
        params.set('checkOut', toDateKey(range.to));
      }
      params.set('guests', guests);
      navigate('/login', { state: { from: `${location.pathname}?${params}` } });
      return;
    }
    if (!nights) {
      setFormError('Choose your check-in and check-out dates.');
      setCalendarOpen(true);
      return;
    }
    if (guests > listing.maxGuests) {
      setFormError(`This place allows up to ${listing.maxGuests} guests.`);
      return;
    }
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await bookingService.create({
        listingId: listing._id,
        checkIn: toDateKey(range.from),
        checkOut: toDateKey(range.to),
        guests,
      });
      toast.success('Booking confirmed! Have a great trip 🎉');
      navigate('/trips');
    } catch (error) {
      toast.error(error.message);
      if (error.status === 409) {
        // Someone else just booked these dates -> refresh the calendar
        setRange(undefined);
        availability.reload();
      }
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border p-6 shadow-xl shadow-black/5">
      <div className="mb-5 flex items-baseline justify-between">
        <p>
          <span className="text-2xl font-extrabold">{formatPrice(listing.pricePerNight)}</span>
          <span className="text-muted-foreground"> night</span>
        </p>
        {listing.reviewCount > 0 && (
          <span className="flex items-center gap-1 text-sm">
            <Star className="size-3.5 fill-current" />
            <b>{listing.avgRating.toFixed(2)}</b>
            <span className="text-muted-foreground">· {plural(listing.reviewCount, 'review')}</span>
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="grid w-full cursor-pointer grid-cols-2 text-left">
              <span className="border-r p-3">
                <span className="block text-[10px] font-extrabold tracking-wide uppercase">Check-in</span>
                <span className="text-sm">{range?.from ? formatDate(toDateKey(range.from)) : 'Add date'}</span>
              </span>
              <span className="p-3">
                <span className="block text-[10px] font-extrabold tracking-wide uppercase">Checkout</span>
                <span className="text-sm">{range?.to ? formatDate(toDateKey(range.to)) : 'Add date'}</span>
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto" align="end">
            <div className="mb-2">
              <p className="font-bold">{nights ? plural(nights, 'night') : 'Select dates'}</p>
              <p className="text-sm text-muted-foreground">
                {nights
                  ? formatDateRange(range.from, range.to)
                  : range?.from
                    ? 'Now choose your checkout date'
                    : 'Crossed-out days are already booked'}
              </p>
            </div>
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={range}
              onSelect={handleSelect}
              disabled={isDisabled}
              startMonth={startOfToday()}
              defaultMonth={range?.from}
              modifiers={{ booked: (d) => isBooked(d) && !(range?.to && isSameDay(d, range.to)) }}
              modifiersClassNames={{ booked: '[&>button]:line-through' }}
            />
            <div className="mt-2 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setRange(undefined)}>
                Clear dates
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <div className="border-t p-3">
          <GuestCounter
            value={guests}
            onChange={setGuests}
            max={listing.maxGuests}
            label="Guests"
            hint={`Maximum ${listing.maxGuests}`}
          />
        </div>
      </div>

      {formError && <p className="mt-3 text-sm font-medium text-destructive">{formError}</p>}
      {availability.error && <p className="mt-3 text-sm text-destructive">Could not load availability.</p>}

      {isOwnListing ? (
        <Button className="mt-4 w-full" size="lg" variant="outline" onClick={() => navigate(`/host/listings/${listing._id}/edit`)}>
          This is your listing · Edit
        </Button>
      ) : (
        <Button className="mt-4 w-full" size="lg" onClick={handleReserveClick} disabled={availability.loading}>
          {user ? 'Reserve' : 'Log in to reserve'}
        </Button>
      )}
      <p className="mt-3 text-center text-xs text-muted-foreground">You won’t be charged yet</p>

      {nights > 0 && (
        <div className="mt-5 grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="underline">
              {formatPrice(listing.pricePerNight)} × {plural(nights, 'night')}
            </span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Service fee</span>
            <span>{formatPrice(serviceFee)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      )}

      {/* Confirmation step */}
      <Dialog open={confirmOpen} onOpenChange={(open) => !submitting && setConfirmOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your booking</DialogTitle>
            <DialogDescription>{listing.title}</DialogDescription>
          </DialogHeader>
          {nights > 0 && (
            <div className="grid gap-2 rounded-xl bg-muted p-4 text-sm">
              <Row label="Dates" value={formatDateRange(range.from, range.to)} />
              <Row label="Guests" value={plural(guests, 'guest')} />
              <Row label="Nights" value={nights} />
              <Separator className="my-1" />
              <Row label="Total" value={<b>{formatPrice(total)}</b>} />
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              Back
            </Button>
            <Button onClick={handleConfirm} loading={submitting}>
              Confirm and book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
