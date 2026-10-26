// shadcn/ui-style native <select>. Works perfectly with react-hook-form's register().
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function NativeSelect({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        data-slot="native-select"
        className={cn(
          'h-10 w-full cursor-pointer appearance-none rounded-lg border border-input bg-background py-2 pr-9 pl-3 text-sm shadow-xs outline-none',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 aria-invalid:border-destructive',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export { NativeSelect };
