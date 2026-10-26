import {
  Bath,
  Building2,
  Car,
  CookingPot,
  Dumbbell,
  Flame,
  Laptop,
  Mountain,
  PawPrint,
  PlugZap,
  Sailboat,
  Snowflake,
  Sparkles,
  ThermometerSun,
  TreePalm,
  TreePine,
  Tv,
  Umbrella,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wheat,
  Wifi,
} from 'lucide-react';

// Must match CATEGORIES in server/src/models/Listing.js
export const CATEGORIES = [
  { value: 'Beach', icon: Umbrella },
  { value: 'Cabin', icon: TreePine },
  { value: 'City', icon: Building2 },
  { value: 'Countryside', icon: Wheat },
  { value: 'Lake', icon: Sailboat },
  { value: 'Mountain', icon: Mountain },
  { value: 'Tropical', icon: TreePalm },
  { value: 'Unique', icon: Sparkles },
];

// Must match AMENITIES in server/src/models/Listing.js
export const AMENITIES = [
  { value: 'Wifi', icon: Wifi },
  { value: 'Kitchen', icon: CookingPot },
  { value: 'Free parking', icon: Car },
  { value: 'Air conditioning', icon: Snowflake },
  { value: 'Heating', icon: ThermometerSun },
  { value: 'Washer', icon: WashingMachine },
  { value: 'TV', icon: Tv },
  { value: 'Pool', icon: Waves },
  { value: 'Hot tub', icon: Bath },
  { value: 'Workspace', icon: Laptop },
  { value: 'Fireplace', icon: Flame },
  { value: 'BBQ grill', icon: UtensilsCrossed },
  { value: 'Beach access', icon: Umbrella },
  { value: 'Pets allowed', icon: PawPrint },
  { value: 'Gym', icon: Dumbbell },
  { value: 'EV charger', icon: PlugZap },
];

export const amenityIcon = (name) => AMENITIES.find((a) => a.value === name)?.icon ?? Sparkles;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

export const SERVICE_FEE_RATE = 0.1; // keep in sync with server/src/services/bookingService.js
export const MAX_NIGHTS = 30;
export const PRICE_LIMIT = 1000; // top of the price slider
