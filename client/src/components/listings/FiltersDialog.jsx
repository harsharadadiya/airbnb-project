// "Filters" button + dialog with a price range slider (MUI) and sorting.
import { useState } from 'react';
import Slider from '@mui/material/Slider';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { PRICE_LIMIT, SORT_OPTIONS } from '@/lib/constants';
import { formatPrice } from '@/lib/format';

export default function FiltersDialog({ filters, onApply }) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState([0, PRICE_LIMIT]);
  const [sort, setSort] = useState('newest');

  // Load the current values every time the dialog opens
  function handleOpenChange(next) {
    if (next) {
      setPrice([Number(filters.minPrice) || 0, Number(filters.maxPrice) || PRICE_LIMIT]);
      setSort(filters.sort || 'newest');
    }
    setOpen(next);
  }

  function apply() {
    onApply({
      minPrice: price[0] > 0 ? price[0] : '',
      maxPrice: price[1] < PRICE_LIMIT ? price[1] : '',
      sort: sort === 'newest' ? '' : sort,
    });
    setOpen(false);
  }

  const activeCount = [filters.minPrice, filters.maxPrice, filters.sort].filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="shrink-0 rounded-xl">
          <SlidersHorizontal />
          Filters
          {activeCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] text-background">
              {activeCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>Narrow down your search.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Label>Price per night</Label>
          <div className="px-3">
            <Slider
              value={price}
              onChange={(_e, value) => setPrice(value)}
              min={0}
              max={PRICE_LIMIT}
              step={10}
              disableSwap
              valueLabelDisplay="auto"
              valueLabelFormat={formatPrice}
              getAriaLabel={(i) => (i === 0 ? 'Minimum price' : 'Maximum price')}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="rounded-lg border px-3 py-1.5">{formatPrice(price[0])}</span>
            <span className="rounded-lg border px-3 py-1.5">
              {formatPrice(price[1])}
              {price[1] >= PRICE_LIMIT && '+'}
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="sort">Sort by</Label>
          <NativeSelect id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        <DialogFooter className="mt-2">
          <Button
            variant="ghost"
            onClick={() => {
              setPrice([0, PRICE_LIMIT]);
              setSort('newest');
            }}
          >
            Reset
          </Button>
          <Button variant="dark" onClick={apply}>
            Show results
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
