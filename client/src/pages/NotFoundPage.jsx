import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
      <p className="text-7xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-extrabold">We can’t find that page</h1>
      <p className="mt-2 text-muted-foreground">The link may be broken or the page may have moved.</p>
      <Button asChild className="mt-6" size="lg">
        <Link to="/">Go home</Link>
      </Button>
    </div>
  );
}
