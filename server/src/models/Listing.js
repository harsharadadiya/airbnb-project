import mongoose from 'mongoose';

export const CATEGORIES = ['Beach', 'Cabin', 'City', 'Countryside', 'Lake', 'Mountain', 'Tropical', 'Unique'];

export const AMENITIES = [
  'Wifi',
  'Kitchen',
  'Free parking',
  'Air conditioning',
  'Heating',
  'Washer',
  'TV',
  'Pool',
  'Hot tub',
  'Workspace',
  'Fireplace',
  'BBQ grill',
  'Beach access',
  'Pets allowed',
  'Gym',
  'EV charger',
];

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, enum: CATEGORIES, required: true },
    pricePerNight: { type: Number, required: true, min: 1 },
    maxGuests: { type: Number, required: true, min: 1 },
    bedrooms: { type: Number, default: 1, min: 0 },
    beds: { type: Number, default: 1, min: 1 },
    bathrooms: { type: Number, default: 1, min: 0 },
    amenities: [{ type: String, trim: true }],
    images: {
      type: [String],
      validate: { validator: (list) => list.length > 0, message: 'At least one image is required' },
    },
    location: { type: locationSchema, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Kept up to date every time a review is added or removed (see Review model)
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes make common searches fast
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ category: 1, pricePerNight: 1 });

listingSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Listing = mongoose.model('Listing', listingSchema);
