// shadcn/ui Popover (small floating panel)
import { Popover as PopoverPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

const Popover = (props) => <PopoverPrimitive.Root data-slot="popover" {...props} />;
const PopoverTrigger = (props) => <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;

function PopoverContent({ className, align = 'center', sideOffset = 8, ...props }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-[1200] rounded-2xl border bg-popover p-4 text-popover-foreground shadow-xl outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
