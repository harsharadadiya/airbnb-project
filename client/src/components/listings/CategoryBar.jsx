// Horizontal list of category icons (Beach, Cabin, City...)
import { LayoutGrid } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function CategoryBar({ value, onChange }) {
  const items = [{ value: '', label: 'All', icon: LayoutGrid }, ...CATEGORIES];

  return (
    <nav aria-label="Categories" className="-mx-1 flex gap-6 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      {items.map(({ value: itemValue, label, icon: Icon }) => {
        const active = value === itemValue;
        return (
          <button
            key={itemValue || 'all'}
            type="button"
            onClick={() => onChange(itemValue)}
            aria-pressed={active}
            className={cn(
              'flex shrink-0 cursor-pointer flex-col items-center gap-1.5 border-b-2 pb-2 text-xs font-semibold transition',
              active
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            )}
          >
            <Icon className="size-6" strokeWidth={1.6} />
            {label || itemValue}
          </button>
        );
      })}
    </nav>
  );
}
