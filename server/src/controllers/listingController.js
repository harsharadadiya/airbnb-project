import { Listing, CATEGORIES, AMENITIES } from '../models/Listing.js';
import { BookedNight } from '../models/BookedNight.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { AppError } from '../utils/AppError.js';
import { parseDateOnly, toDateString, todayUTC } from '../utils/dates.js';

const HOST_FIELDS = 'name avatarUrl createdAt';

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  price_asc: { pricePerNight: 1 },
  price_desc: { pricePerNight: -1 },
  rating: { avgRating: -1, reviewCount: -1 },
};

// Makes user text safe to use inside a regular expression
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/listings/meta  -> categories and amenities for forms and filters
export function getMeta(_req, res) {
  res.json({ categories: CATEGORIES, amenities: AMENITIES });
}

// GET /api/listings?location=goa&guests=2&minPrice=50&maxPrice=300&checkIn=2026-12-01&checkOut=2026-12-05&page=1
export async function getListings(req, res) {
  const { location, category, minPrice, maxPrice, guests, checkIn, checkOut, sort, page, limit } =
    req.validatedQuery;

  const filter = { isActive: true };

  if (location) {
    const pattern = new RegExp(escapeRegex(location), 'i');
    filter.$or = [{ 'location.city': pattern }, { 'location.country': pattern }, { title: pattern }];
  }
  if (category) filter.category = category;
  if (guests) filter.maxGuests = { $gte: guests };
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.pricePerNight = {};
    if (minPrice !== undefined) filter.pricePerNight.$gte = minPrice;
    if (maxPrice !== undefined) filter.pricePerNight.$lte = maxPrice;
  }

  // Hide listings that already have a booked night inside the chosen dates
  if (checkIn && checkOut) {
    const start = parseDateOnly(checkIn);
    const end = parseDateOnly(checkOut);
    if (!start || !end) throw new AppError('Invalid dates', 400);
    const unavailable = await BookedNight.distinct('listing', { date: { $gte: start, $lt: end } });
    if (unavailable.length) filter._id = { $nin: unavailable };
  }

  const [total, listings] = await Promise.all([
    Listing.countDocuments(filter),
    Listing.find(filter)
      .sort(SORT_OPTIONS[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('host', HOST_FIELDS),
  ]);

  res.json({
    listings,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}

// GET /api/listings/:id
export async function getListing(req, res) {
  const listing = await Listing.findById(req.params.id).populate('host', HOST_FIELDS);
  if (!listing || !listing.isActive) throw new AppError('Listing not found', 404);
  res.json({ listing });
}

// GET /api/listings/:id/availability  -> list of booked dates ("YYYY-MM-DD") from today onwards
export async function getAvailability(req, res) {
  const nights = await BookedNight.find({ listing: req.params.id, date: { $gte: todayUTC() } })
    .select('date')
    .sort({ date: 1 })
    .lean();
  res.json({ bookedDates: nights.map((n) => toDateString(n.date)) });
}

// POST /api/listings  (hosts only)
export async function createListing(req, res) {
  const listing = await Listing.create({ ...req.body, host: req.user._id });
  res.status(201).json({ listing });
}

async function findOwnListing(listingId, userId) {
  const listing = await Listing.findById(listingId);
  if (!listing) throw new AppError('Listing not found', 404);
  if (!listing.host.equals(userId)) throw new AppError('You can only change your own listings', 403);
  return listing;
}

// PATCH /api/listings/:id  (owner only)
export async function updateListing(req, res) {
  const listing = await findOwnListing(req.params.id, req.user._id);
  Object.assign(listing, req.body);
  await listing.save();
  res.json({ listing });
}

// DELETE /api/listings/:id  (owner only)
export async function deleteListing(req, res) {
  const listing = await findOwnListing(req.params.id, req.user._id);

  const upcoming = await Booking.exists({
    listing: listing._id,
    status: 'confirmed',
    checkOut: { $gt: todayUTC() },
  });
  if (upcoming) {
    throw new AppError('This listing has upcoming bookings. Cancel them first or pause the listing instead.', 409);
  }

  await Promise.all([
    Review.deleteMany({ listing: listing._id }),
    BookedNight.deleteMany({ listing: listing._id }),
    listing.deleteOne(),
  ]);
  res.json({ message: 'Listing deleted' });
}
