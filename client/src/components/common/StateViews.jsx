// Reusable "nothing here" and "something went wrong" blocks.
import { AlertTriangle, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function EmptyState({ icon: Icon = SearchX, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center', className)}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="size-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-2xl border border-red-200 bg-red-50/60 px-6 py-14 text-center', className)}>
      <AlertTriangle className="mb-3 size-9 text-destructive" />
      <h3 className="text-lg font-bold">Something went wrong</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error?.message || 'Please try again.'}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
