// All request validation rules in one place (using Zod).
import { z } from 'zod';
import { CATEGORIES } from '../models/Listing.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD');

/* ---------------- Auth ---------------- */

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72)
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/\d/, 'Password must contain a number'),
  role: z.enum(['guest', 'host']).default('guest'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  avatarUrl: z.union([z.string().url('Enter a valid image URL'), z.literal('')]).optional(),
});

/* ---------------- Listings ---------------- */

const locationSchema = z.object({
  address: z.string().trim().min(3, 'Address is required').max(200),
  city: z.string().trim().min(2, 'City is required').max(80),
  country: z.string().trim().min(2, 'Country is required').max(80),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

const listingFields = {
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(2000),
  category: z.enum(CATEGORIES, { message: 'Choose a category' }),
  pricePerNight: z.coerce.number().min(10, 'Minimum price is 10').max(100000),
  maxGuests: z.coerce.number().int().min(1).max(16),
  bedrooms: z.coerce.number().int().min(0).max(20),
  beds: z.coerce.number().int().min(1).max(30),
  bathrooms: z.coerce.number().min(0).max(20),
  amenities: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  images: z.array(z.string().trim().url('Each image must be a valid URL')).min(1, 'Add at least one image').max(10),
  location: locationSchema,
  isActive: z.boolean().optional(),
};

export const createListingSchema = z.object(listingFields);
export const updateListingSchema = z
  .object(listingFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Send at least one field to update');

export const listingQuerySchema = z
  .object({
    location: z.string().trim().max(100).optional(),
    category: z.enum(CATEGORIES).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    guests: z.coerce.number().int().min(1).max(16).optional(),
    checkIn: dateOnly.optional(),
    checkOut: dateOnly.optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating']).default('newest'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  })
  .refine((q) => Boolean(q.checkIn) === Boolean(q.checkOut), {
    message: 'Send both checkIn and checkOut',
    path: ['checkOut'],
  })
  .refine((q) => !q.checkIn || !q.checkOut || q.checkOut > q.checkIn, {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  });

/* ---------------- Bookings ---------------- */

export const createBookingSchema = z.object({
  listingId: objectId,
  checkIn: dateOnly,
  checkOut: dateOnly,
  guests: z.coerce.number().int().min(1, 'At least 1 guest').max(16),
});

/* ---------------- Reviews ---------------- */

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Pick a rating').max(5),
  comment: z.string().trim().min(10, 'Review must be at least 10 characters').max(1000),
});
