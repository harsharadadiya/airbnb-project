// Create a new listing or edit an existing one (hosts only).
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ArrowLeft, ImagePlus, Trash2 } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { hostService, listingService } from '@/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import FormField from '@/components/common/FormField';
import PageLoader from '@/components/common/PageLoader';
import SafeImage from '@/components/common/SafeImage';
import { ErrorState } from '@/components/common/StateViews';
import LocationPicker from '@/components/listings/LocationPicker';
import { AMENITIES, CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Validation rules (the server checks the same rules again)
const num = (label, min, max, int = true) => {
  let schema = z.number({ message: `${label} must be a number` }).min(min, `${label}: minimum ${min}`).max(max, `${label}: maximum ${max}`);
  if (int) schema = schema.int(`${label} must be a whole number`);
  return schema;
};

const schema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(100, 'Title is too long'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(2000),
  category: z.enum(CATEGORIES.map((c) => c.value), { message: 'Choose a category' }),
  pricePerNight: num('Price', 10, 100000, false),
  maxGuests: num('Guests', 1, 16),
  bedrooms: num('Bedrooms', 0, 20),
  beds: num('Beds', 1, 30),
  bathrooms: num('Bathrooms', 0, 20, false),
  amenities: z.array(z.string()),
  images: z
    .array(z.object({ url: z.string().trim().url('Enter a full image URL starting with https://') }))
    .min(1, 'Add at least one photo')
    .max(10, 'Up to 10 photos'),
  location: z.object({
    address: z.string().trim().min(3, 'Address is required'),
    city: z.string().trim().min(2, 'City is required'),
    country: z.string().trim().min(2, 'Country is required'),
    lat: z.number({ message: 'Pick the location on the map' }).min(-90).max(90),
    lng: z.number({ message: 'Pick the location on the map' }).min(-180).max(180),
  }),
  isActive: z.boolean(),
});

const EMPTY = {
  title: '',
  description: '',
  category: '',
  pricePerNight: 100,
  maxGuests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenities: ['Wifi'],
  images: [{ url: '' }],
  location: { address: '', city: '', country: '', lat: undefined, lng: undefined },
  isActive: true,
};

// API data -> form values (images are objects because useFieldArray needs objects)
const toForm = (l) => ({ ...EMPTY, ...l, images: l.images.map((url) => ({ url })), location: { ...l.location } });

export default function ListingEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const existing = useAsync(() => (isEdit ? hostService.listing(id) : Promise.resolve(null)), [id]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const images = useFieldArray({ control, name: 'images' });

  useEffect(() => {
    if (existing.data) reset(toForm(existing.data));
  }, [existing.data, reset]);

  async function onSubmit(values) {
    const payload = { ...values, images: values.images.map((img) => img.url.trim()) };
    try {
      const saved = isEdit ? await listingService.update(id, payload) : await listingService.create(payload);
      toast.success(isEdit ? 'Listing updated' : 'Your listing is live! 🎉');
      navigate(`/listings/${saved._id}`);
    } catch (error) {
      // Server field names look like "location.city" or "images.0" – map them back onto the form
      for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
        setError(field.startsWith('images.') ? `images.${field.split('.')[1]}.url` : field, { message });
      }
      toast.error(error.message);
    }
  }

  if (existing.loading) return <PageLoader label="Loading your listing…" />;
  if (existing.error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState error={existing.error} onRetry={existing.reload} />
      </div>
    );
  }

  const [lat, lng, address, city, country] = watch(['location.lat', 'location.lng', 'location.address', 'location.city', 'location.country']);
  const imageUrls = watch('images');
  const err = (path) => path.split('.').reduce((o, k) => o?.[k], errors)?.message;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/host" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Host dashboard
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight">{isEdit ? 'Edit listing' : 'Create a new listing'}</h1>
      <p className="mt-1 mb-8 text-muted-foreground">Fields marked with an error need your attention before saving.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
        {/* ---------- Basics ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>The basics</CardTitle>
            <CardDescription>A short, clear title and an honest description work best.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <FormField label="Title" htmlFor="title" error={err('title')}>
              <Input id="title" placeholder="Cozy cabin with mountain views" aria-invalid={!!errors.title} {...register('title')} />
            </FormField>
            <FormField label="Description" htmlFor="description" error={err('description')}>
              <Textarea id="description" rows={5} aria-invalid={!!errors.description} {...register('description')} />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Category" htmlFor="category" error={err('category')}>
                <NativeSelect id="category" aria-invalid={!!errors.category} {...register('category')}>
                  <option value="">Choose…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.value}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
              <FormField label="Price per night" htmlFor="pricePerNight" error={err('pricePerNight')}>
                <Input id="pricePerNight" type="number" min={10} step="1" {...register('pricePerNight', { valueAsNumber: true })} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* ---------- Rooms ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Rooms & guests</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {[
              ['maxGuests', 'Max guests', 1],
              ['bedrooms', 'Bedrooms', 0],
              ['beds', 'Beds', 1],
              ['bathrooms', 'Bathrooms', 0],
            ].map(([name, label, min]) => (
              <FormField key={name} label={label} htmlFor={name} error={err(name)}>
                <Input id={name} type="number" min={min} step={name === 'bathrooms' ? '0.5' : '1'} {...register(name, { valueAsNumber: true })} />
              </FormField>
            ))}
          </CardContent>
        </Card>

        {/* ---------- Amenities ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>Tap to select everything your place offers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="amenities"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(({ value, icon: Icon }) => {
                    const selected = field.value.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          field.onChange(selected ? field.value.filter((a) => a !== value) : [...field.value, value])
                        }
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition',
                          selected ? 'border-foreground bg-foreground text-background' : 'hover:border-foreground'
                        )}
                      >
                        <Icon className="size-4" /> {value}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* ---------- Photos ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>
              Paste image links (for example from Unsplash, Cloudinary or Imgur). The first photo is the cover.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {images.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <SafeImage src={imageUrls?.[index]?.url} alt={`Photo ${index + 1}`} className="size-14 shrink-0 rounded-lg" />
                <FormField className="flex-1" error={err(`images.${index}.url`)}>
                  <Input
                    placeholder="https://images.unsplash.com/photo-..."
                    aria-label={`Photo ${index + 1} URL`}
                    aria-invalid={!!errors.images?.[index]?.url}
                    {...register(`images.${index}.url`)}
                  />
                </FormField>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => images.remove(index)}
                  disabled={images.fields.length === 1}
                  aria-label="Remove photo"
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            {errors.images?.root?.message && <p className="text-sm text-destructive">{errors.images.root.message}</p>}
            {errors.images?.message && <p className="text-sm text-destructive">{errors.images.message}</p>}
            <Button
              type="button"
              variant="outline"
              className="justify-self-start"
              onClick={() => images.append({ url: '' })}
              disabled={images.fields.length >= 10}
            >
              <ImagePlus /> Add another photo
            </Button>
          </CardContent>
        </Card>

        {/* ---------- Location ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <FormField label="Street address" htmlFor="address" error={err('location.address')}>
              <Input id="address" {...register('location.address')} />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="City" htmlFor="city" error={err('location.city')}>
                <Input id="city" {...register('location.city')} />
              </FormField>
              <FormField label="Country" htmlFor="country" error={err('location.country')}>
                <Input id="country" {...register('location.country')} />
              </FormField>
            </div>
            <LocationPicker
              lat={lat}
              lng={lng}
              addressQuery={[address, city, country].filter(Boolean).join(', ')}
              onChange={(newLat, newLng) => {
                setValue('location.lat', newLat, { shouldValidate: true, shouldDirty: true });
                setValue('location.lng', newLng, { shouldValidate: true, shouldDirty: true });
              }}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Latitude" htmlFor="lat" error={err('location.lat')}>
                <Input id="lat" type="number" step="any" {...register('location.lat', { valueAsNumber: true })} />
              </FormField>
              <FormField label="Longitude" htmlFor="lng" error={err('location.lng')}>
                <Input id="lng" type="number" step="any" {...register('location.lng', { valueAsNumber: true })} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {isEdit && (
          <Card>
            <CardContent>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={field.value ? 'Listed — guests can find and book this place' : 'Paused — hidden from search'}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t bg-background/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <Button type="button" variant="ghost" onClick={() => navigate('/host')}>
            Cancel
          </Button>
          <Button type="submit" size="lg" loading={isSubmitting} disabled={isEdit && !isDirty}>
            {isEdit ? 'Save changes' : 'Publish listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
