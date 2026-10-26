// Write a review: star rating (MUI Rating) + comment, validated with react-hook-form + zod.
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Rating from '@mui/material/Rating';
import { toast } from 'sonner';
import { reviewService } from '@/services';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import FormField from '@/components/common/FormField';

const schema = z.object({
  rating: z.number({ message: 'Pick a star rating' }).int().min(1, 'Pick a star rating').max(5),
  comment: z.string().trim().min(10, 'Please write at least 10 characters').max(1000, 'Keep it under 1000 characters'),
});

export default function ReviewForm({ listingId, onCreated, onCancel }) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { rating: 0, comment: '' } });

  async function onSubmit(values) {
    try {
      const review = await reviewService.create(listingId, values);
      toast.success('Thanks for your review!');
      onCreated?.(review);
    } catch (error) {
      // Show server-side field errors next to the right field
      Object.entries(error.fieldErrors ?? {}).forEach(([field, message]) => setError(field, { message }));
      toast.error(error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-2xl border p-5" noValidate>
      <FormField label="Your rating" error={errors.rating?.message}>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <Rating
              name="rating"
              size="large"
              value={field.value || null}
              onChange={(_e, value) => field.onChange(value ?? 0)}
            />
          )}
        />
      </FormField>
      <FormField
        label="Your review"
        htmlFor="comment"
        error={errors.comment?.message}
        hint={`${watch('comment')?.length ?? 0}/1000`}
      >
        <Textarea
          id="comment"
          placeholder="What did you love? Anything future guests should know?"
          aria-invalid={Boolean(errors.comment)}
          {...register('comment')}
        />
      </FormField>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          Post review
        </Button>
      </div>
    </form>
  );
}
