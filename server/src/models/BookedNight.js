import mongoose from 'mongoose';

/**
 * One document = one night that is taken at one listing.
 *
 * WHY THIS EXISTS (double-booking protection):
 * The UNIQUE index on { listing, date } means MongoDB itself refuses to store
 * the same night twice for the same listing. Even if two people click "Reserve"
 * at the exact same moment, only one of them can win. The other gets a
 * "duplicate key" error, which we turn into a friendly "dates already booked" message.
 *
 * This works on every MongoDB setup (local or Atlas) and does not need transactions.
 */
const bookedNightSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  date: { type: Date, required: true }, // midnight UTC of the night
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
});

bookedNightSchema.index({ listing: 1, date: 1 }, { unique: true });

export const BookedNight = mongoose.model('BookedNight', bookedNightSchema);
