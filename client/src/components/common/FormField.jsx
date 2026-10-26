// Label + input + error message, used by every form.
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function FormField({ label, htmlFor, error, hint, className, children }) {
  return (
    <div className={cn('grid gap-2', className)}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
