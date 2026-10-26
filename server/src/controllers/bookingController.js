import { Booking } from '../models/Booking.js';
import { Listing } from '../models/Listing.js';
import { Review } from '../models/Review.js';
import { AppError } from '../utils/AppError.js';
import { DAY_MS, parseDateOnly, todayUTC } from '../utils/dates.js';
import { createBookingSafely, releaseNights, MAX_NIGHTS } from '../services/bookingService.js';

const LISTING_FIELDS = 'title images location pricePerNight host';

// POST /api/bookings
export async function createBooking(req, res) {
  const { listingId, guests } = req.body;
  const checkIn = parseDateOnly(req.body.checkIn);
  const checkOut = parseDateOnly(req.body.checkOut);

  // ---- Business rules ----
  if (!checkIn || !checkOut) throw new AppError('Please choose valid dates', 400);
  if (checkIn < todayUTC()) throw new AppError('Check-in date cannot be in the past', 400);
  if (checkOut <= checkIn) throw new AppError('Check-out must be after check-in', 400);

  const nights = Math.round((checkOut - checkIn) / DAY_MS);
  if (nights > MAX_NIGHTS) throw new AppError(`You can book at most ${MAX_NIGHTS} nights at a time`, 400);

  const listing = await Listing.findById(listingId);
  if (!listing || !listing.isActive) throw new AppError('Listing not found', 404);
  if (listing.host.equals(req.user._id)) throw new AppError('You cannot book your own listing', 400);
  if (guests > listing.maxGuests) {
    throw new AppError(`This place allows a maximum of ${listing.maxGuests} guests`, 400);
  }

  // ---- Overlap-safe write ----
  const booking = await createBookingSafely({ listing, guestId: req.user._id, checkIn, checkOut, guests });
  await booking.populate('listing', LISTING_FIELDS);

  res.status(201).json({ booking });
}

// GET /api/bookings/me  -> the logged-in guest's trips
export async function getMyBookings(req, res) {
  const bookings = await Booking.find({ guest: req.user._id })
    .sort({ checkIn: -1 })
    .populate('listing', LISTING_FIELDS)
    .lean();

  // Mark which listings this guest has already reviewed (to show / hide the "Write a review" button)
  const listingIds = bookings.map((b) => b.listing?._id).filter(Boolean);
  const reviews = await Review.find({ author: req.user._id, listing: { $in: listingIds } })
    .select('listing')
    .lean();
  const reviewed = new Set(reviews.map((r) => String(r.listing)));
  const today = todayUTC();

  res.json({
    bookings: bookings.map((b) => ({
      ...b,
      isCompleted: b.status === 'confirmed' && new Date(b.checkOut) <= today,
      hasReviewed: b.listing ? reviewed.has(String(b.listing._id)) : false,
    })),
  });
}

// PATCH /api/bookings/:id/cancel  -> the guest or the host can cancel an upcoming booking
export async function cancelBooking(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError('Booking not found', 404);

  const isGuest = booking.guest.equals(req.user._id);
  const isHost = booking.host.equals(req.user._id);
  if (!isGuest && !isHost) throw new AppError('You cannot cancel this booking', 403);
  if (booking.status === 'cancelled') throw new AppError('This booking is already cancelled', 400);
  if (booking.checkIn <= todayUTC()) throw new AppError('Stays that have started cannot be cancelled', 400);

  booking.status = 'cancelled';
  await booking.save();
  await releaseNights(booking._id); // the dates become available again

  res.json({ booking });
}
