// shadcn/ui Calendar, built on react-day-picker
import { DayPicker } from 'react-day-picker';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function Calendar({ className, classNames, showOutsideDays = false, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-1', className)}
      classNames={{
        root: 'w-fit',
        months: 'relative flex flex-col gap-6 sm:flex-row',
        month: 'flex w-full flex-col gap-4',
        nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
        button_previous:
          'inline-flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-default z-10',
        button_next:
          'inline-flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-default z-10',
        month_caption: 'flex h-8 items-center justify-center',
        caption_label: 'text-sm font-bold',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-10 text-[0.75rem] font-medium text-muted-foreground',
        week: 'mt-1 flex w-full',
        day: 'relative size-10 p-0 text-center text-sm select-none',
        day_button:
          'size-10 cursor-pointer rounded-full font-medium transition hover:border hover:border-foreground disabled:cursor-not-allowed disabled:hover:border-0',
        range_start: 'rounded-l-full bg-muted [&>button]:bg-foreground [&>button]:text-background',
        range_end: 'rounded-r-full bg-muted [&>button]:bg-foreground [&>button]:text-background',
        range_middle: 'bg-muted [&>button]:rounded-none',
        selected: '',
        today: '[&>button]:underline [&>button]:underline-offset-4',
        outside: 'text-muted-foreground opacity-40',
        disabled: 'text-muted-foreground/40',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass }) =>
          orientation === 'left' ? (
            <ChevronLeftIcon className={cn('size-4', chevronClass)} />
          ) : (
            <ChevronRightIcon className={cn('size-4', chevronClass)} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
