// Fills the database with demo users, listings, bookings and reviews.
// Run with:  npm run seed      (WARNING: it deletes existing StayNest data first)
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Booking } from '../models/Booking.js';
import { BookedNight } from '../models/BookedNight.js';
import { Review } from '../models/Review.js';
import { createBookingSafely } from '../services/bookingService.js';
import { addDays, todayUTC } from '../utils/dates.js';
import * as data from './data.js';

async function seed() {
  await connectDB();

  console.log('🧹 Clearing old data...');
  await Promise.all([
    User.deleteMany({}),
    Listing.deleteMany({}),
    Booking.deleteMany({}),
    BookedNight.deleteMany({}),
    Review.deleteMany({}),
  ]);

  // Make sure all indexes (including the unique "booked night" index) exist
  await Promise.all([User.syncIndexes(), Listing.syncIndexes(), Booking.syncIndexes(), BookedNight.syncIndexes(), Review.syncIndexes()]);

  console.log('👤 Creating users...');
  const usersByKey = {};
  for (const { key, ...fields } of data.users) {
    usersByKey[key] = await User.create(fields); // create() runs the password-hashing hook
  }

  console.log('🏠 Creating listings...');
  const listings = [];
  for (const [i, { host, ...fields }] of data.listings.entries()) {
    // Spread creation dates out so "newest" sorting looks natural
    const createdAt = addDays(new Date(), -(data.listings.length - i));
    listings.push(await Listing.create({ ...fields, host: usersByKey[host]._id, createdAt }));
  }

  console.log('📅 Creating bookings and reviews...');
  const today = todayUTC();
  const touched = new Set();
  for (const b of data.bookings) {
    const listing = listings[b.listing];
    const checkIn = addDays(today, b.checkInOffset);
    const guest = usersByKey[b.guest];
    await createBookingSafely({ listing, guestId: guest._id, checkIn, checkOut: addDays(checkIn, b.nights), guests: b.guests });

    if (b.review) {
      await Review.create({ ...b.review, listing: listing._id, author: guest._id });
      touched.add(String(listing._id));
    }
  }
  for (const id of touched) await Review.recalcListingStats(id);

  console.log('\n✅ Seed complete!');
  console.log(`   ${data.users.length} users, ${listings.length} listings, ${data.bookings.length} bookings`);
  console.log('\n   Demo accounts (password for all: Password123)');
  for (const u of data.users) console.log(`   • ${u.role.padEnd(5)}  ${u.email}`);
  console.log('');

  await disconnectDB();
}

seed().catch(async (error) => {
  console.error('❌ Seed failed:', error);
  await disconnectDB();
  process.exit(1);
});
