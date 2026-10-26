import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// "−  2  +" control for choosing a number of guests
export default function GuestCounter({ value, onChange, min = 1, max = 16, label = 'Guests', hint }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="font-semibold">{label}</p>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          aria-label="Fewer guests"
        >
          <Minus />
        </Button>
        <span className="w-6 text-center font-semibold" aria-live="polite">
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          aria-label="More guests"
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}
