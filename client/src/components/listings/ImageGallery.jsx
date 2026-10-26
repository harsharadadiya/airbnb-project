// Photo grid on the listing page (1 big + up to 4 small) and a dialog with all photos.
import { useState } from 'react';
import { Images } from 'lucide-react';
import SafeImage from '@/components/common/SafeImage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function ImageGallery({ images, title }) {
  const [open, setOpen] = useState(false);
  const shown = images.slice(0, 5);

  return (
    <div className="relative">
      {/* Mobile: swipeable row */}
      <div className="-mx-4 flex snap-x snap-mandatory overflow-x-auto sm:hidden [scrollbar-width:none]">
        {images.map((src, i) => (
          <SafeImage key={src + i} src={src} alt={`${title} photo ${i + 1}`} className="aspect-[4/3] w-full shrink-0 snap-center" />
        ))}
      </div>

      {/* Tablet & desktop: grid */}
      <div
        className={cn(
          'hidden h-[440px] gap-2 overflow-hidden rounded-2xl sm:grid',
          shown.length === 1 ? 'grid-cols-1' : shown.length < 5 ? 'grid-cols-2' : 'grid-cols-4 grid-rows-2'
        )}
      >
        {shown.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              'group relative cursor-pointer overflow-hidden',
              i === 0 && shown.length >= 5 && 'col-span-2 row-span-2',
              i === 0 && shown.length > 1 && shown.length < 5 && 'row-span-2'
            )}
          >
            <SafeImage src={src} alt={`${title} photo ${i + 1}`} className="size-full transition duration-300 group-hover:brightness-90" />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <Button variant="outline" size="sm" className="absolute right-4 bottom-4 hidden bg-white sm:inline-flex" onClick={() => setOpen(true)}>
          <Images /> Show all photos
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{images.length} photos</DialogDescription>
          <div className="grid gap-3 sm:grid-cols-2">
            {images.map((src, i) => (
              <SafeImage key={src + i} src={src} alt={`${title} photo ${i + 1}`} className={cn('w-full rounded-xl', i % 3 === 0 && 'sm:col-span-2')} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
