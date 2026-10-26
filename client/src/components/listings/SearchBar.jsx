// The big rounded search bar: Where / When / Who
import { useEffect, useState } from 'react';
import { startOfToday } from 'date-fns';
import { Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { formatDateRange, fromDateKey, plural, toDateKey } from '@/lib/format';
import GuestCounter from './GuestCounter';

export default function SearchBar({ filters, onSearch }) {
  const [location, setLocation] = useState(filters.location);
  const [range, setRange] = useState(toRange(filters));
  const [guests, setGuests] = useState(Number(filters.guests) || 1);

  // Keep the form in sync when the URL changes (e.g. browser back button)
  useEffect(() => {
    setLocation(filters.location);
    setRange(toRange(filters));
    setGuests(Number(filters.guests) || 1);
  }, [filters.location, filters.checkIn, filters.checkOut, filters.guests]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(event) {
    event.preventDefault();
    const hasRange = range?.from && range?.to;
    onSearch({
      location: location.trim(),
      checkIn: hasRange ? toDateKey(range.from) : '',
      checkOut: hasRange ? toDateKey(range.to) : '',
      guests: guests > 1 ? guests : '',
    });
  }

  const datesLabel = range?.from && range?.to ? formatDateRange(range.from, range.to) : 'Add dates';

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl flex-col gap-1 rounded-3xl border bg-background p-2 shadow-lg shadow-black/5 md:flex-row md:items-center md:rounded-full"
      role="search"
    >
      <label className="flex-1 cursor-text rounded-full px-5 py-2 transition hover:bg-muted">
        <span className="block text-xs font-bold">Where</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Search destinations"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          maxLength={100}
        />
      </label>

      <div className="hidden h-8 w-px bg-border md:block" />

      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="flex-1 cursor-pointer rounded-full px-5 py-2 text-left transition hover:bg-muted">
            <span className="block text-xs font-bold">When</span>
            <span className={range?.from && range?.to ? 'text-sm' : 'text-sm text-muted-foreground'}>{datesLabel}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="center">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={range}
            onSelect={setRange}
            disabled={{ before: startOfToday() }}
            startMonth={startOfToday()}
          />
          <div className="mt-2 flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setRange(undefined)}>
              Clear dates
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="hidden h-8 w-px bg-border md:block" />

      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="flex-1 cursor-pointer rounded-full px-5 py-2 text-left transition hover:bg-muted">
            <span className="block text-xs font-bold">Who</span>
            <span className={guests > 1 ? 'text-sm' : 'text-sm text-muted-foreground'}>
              {guests > 1 ? plural(guests, 'guest') : 'Add guests'}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <GuestCounter value={guests} onChange={setGuests} hint="Adults and children" />
        </PopoverContent>
      </Popover>

      <Button type="submit" size="lg" className="rounded-full md:size-12 md:px-0" aria-label="Search">
        <Search className="size-5" />
        <span className="md:hidden">Search</span>
      </Button>
    </form>
  );
}

function toRange(filters) {
  if (!filters.checkIn || !filters.checkOut) return undefined;
  return { from: fromDateKey(filters.checkIn), to: fromDateKey(filters.checkOut) };
}
