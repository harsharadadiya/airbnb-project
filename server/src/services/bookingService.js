// The core booking logic lives here so both the API and the seed script can use it.
import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { BookedNight } from '../models/BookedNight.js';
import { AppError } from '../utils/AppError.js';
import { nightsBetween } from '../utils/dates.js';

export const SERVICE_FEE_RATE = 0.1; // 10% service fee
export const MAX_NIGHTS = 30;

export function calculatePrice(pricePerNight, nights) {
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  return { subtotal, serviceFee, totalPrice: subtotal + serviceFee };
}

/**
 * Creates a booking without any chance of a double booking.
 *
 * Step 1: Reserve every night in the BookedNight collection.
 *         The unique index { listing, date } rejects nights that are already taken.
 * Step 2: If any night was taken -> remove the nights we just reserved and stop (409 Conflict).
 * Step 3: Save the booking itself. If that fails, release the nights again.
 */
export async function createBookingSafely({ listing, guestId, checkIn, checkOut, guests, status = 'confirmed' }) {
  const nights = nightsBetween(checkIn, checkOut);
  const bookingId = new mongoose.Types.ObjectId();

  try {
    await BookedNight.insertMany(
      nights.map((date) => ({ listing: listing._id, date, booking: bookingId })),
      { ordered: true }
    );
  } catch (error) {
    await BookedNight.deleteMany({ booking: bookingId }); // undo the nights that did get saved
    if (error.code === 11000 || error?.writeErrors?.some?.((e) => e.code === 11000)) {
      throw new AppError('Sorry, some of those dates were just booked. Please choose different dates.', 409);
    }
    throw error;
  }

  try {
    const { serviceFee, totalPrice } = calculatePrice(listing.pricePerNight, nights.length);
    return await Booking.create({
      _id: bookingId,
      listing: listing._id,
      guest: guestId,
      host: listing.host,
      checkIn,
      checkOut,
      guests,
      nights: nights.length,
      pricePerNight: listing.pricePerNight,
      serviceFee,
      totalPrice,
      status,
    });
  } catch (error) {
    await BookedNight.deleteMany({ booking: bookingId });
    throw error;
  }
}

/** Frees the nights so other guests can book them again */
export async function releaseNights(bookingId) {
  await BookedNight.deleteMany({ booking: bookingId });
}
