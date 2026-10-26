// shadcn/ui Dropdown Menu
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

const DropdownMenu = (props) => <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
const DropdownMenuTrigger = (props) => <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;

function DropdownMenuContent({ className, sideOffset = 8, align = 'end', ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-[1200] min-w-52 overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none select-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

const DropdownMenuLabel = ({ className, ...props }) => (
  <DropdownMenuPrimitive.Label className={cn('px-2.5 py-1.5 text-sm', className)} {...props} />
);
const DropdownMenuSeparator = ({ className, ...props }) => (
  <DropdownMenuPrimitive.Separator className={cn('-mx-1.5 my-1.5 h-px bg-border', className)} {...props} />
);

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator };
