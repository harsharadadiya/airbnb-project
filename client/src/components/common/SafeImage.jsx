// An <img> that shows a placeholder if the image link is broken, and loads lazily.
import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SafeImage({ src, alt, className, ...props }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={cn('flex items-center justify-center bg-muted text-muted-foreground', className)} aria-label={alt}>
        <ImageOff className="size-6" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
      {...props}
    />
  );
}
