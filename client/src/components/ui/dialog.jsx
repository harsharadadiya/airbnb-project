// shadcn/ui Dialog (modal window)
import { Dialog as DialogPrimitive } from 'radix-ui';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = (props) => <DialogPrimitive.Root data-slot="dialog" {...props} />;
const DialogTrigger = (props) => <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
const DialogClose = (props) => <DialogPrimitive.Close data-slot="dialog-close" {...props} />;

function DialogContent({ className, children, showCloseButton = true, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[1300] bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-[1300] grid max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-2xl border bg-background p-6 shadow-xl duration-200',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-1 opacity-70 transition hover:bg-muted hover:opacity-100 focus:outline-none">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-1.5 pr-6', className)} {...props} />
);
const DialogFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
);
const DialogTitle = ({ className, ...props }) => (
  <DialogPrimitive.Title className={cn('text-lg font-bold leading-tight', className)} {...props} />
);
const DialogDescription = ({ className, ...props }) => (
  <DialogPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
);

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
