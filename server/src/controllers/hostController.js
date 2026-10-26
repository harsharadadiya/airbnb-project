import { Listing } from '../models/Listing.js';
import { Booking } from '../models/Booking.js';
import { todayUTC } from '../utils/dates.js';
import { AppError } from '../utils/AppError.js';

// GET /api/host/listings  -> all of my listings (active and paused)
export async function getHostListings(req, res) {
  const listings = await Listing.find({ host: req.user._id }).sort({ createdAt: -1 });
  res.json({ listings });
}

// GET /api/host/listings/:id  -> one of my listings (works even when it is paused, used by the edit form)
export async function getHostListing(req, res) {
  const listing = await Listing.findOne({ _id: req.params.id, host: req.user._id });
  if (!listing) throw new AppError('Listing not found', 404);
  res.json({ listing });
}

// GET /api/host/bookings -> reservations made on my listings
export async function getHostBookings(req, res) {
  const bookings = await Booking.find({ host: req.user._id })
    .sort({ checkIn: -1 })
    .populate('listing', 'title images location')
    .populate('guest', 'name email avatarUrl');
  res.json({ bookings });
}

// GET /api/host/stats  -> numbers for the dashboard cards
export async function getHostStats(req, res) {
  const hostId = req.user._id;
  const today = todayUTC();

  const [listings, upcomingCount, earnings] = await Promise.all([
    Listing.find({ host: hostId }).select('avgRating reviewCount isActive').lean(),
    Booking.countDocuments({ host: hostId, status: 'confirmed', checkOut: { $gt: today } }),
    Booking.aggregate([
      { $match: { host: hostId, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' }, nights: { $sum: '$nights' } } },
    ]),
  ]);

  // Average rating across all listings, weighted by how many reviews each has
  const totalReviews = listings.reduce((sum, l) => sum + l.reviewCount, 0);
  const weighted = listings.reduce((sum, l) => sum + l.avgRating * l.reviewCount, 0);

  res.json({
    stats: {
      totalListings: listings.length,
      activeListings: listings.filter((l) => l.isActive).length,
      upcomingBookings: upcomingCount,
      totalEarnings: earnings[0]?.total ?? 0,
      nightsBooked: earnings[0]?.nights ?? 0,
      totalReviews,
      avgRating: totalReviews ? Math.round((weighted / totalReviews) * 100) / 100 : 0,
    },
  });
}
