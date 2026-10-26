import { useState } from 'react';
import { toast } from 'sonner';
import { Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function BecomeHostPrompt() {
  const { becomeHost } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await becomeHost();
      toast.success('You are now a host! Create your first listing.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-accent text-primary">
        <Home className="size-8" />
      </div>
      <h1 className="text-2xl font-extrabold">This area is for hosts</h1>
      <p className="mt-2 text-muted-foreground">
        Turn on hosting to list your place, manage reservations and earn money.
      </p>
      <Button className="mt-6" size="lg" loading={loading} onClick={handleClick}>
        Become a host
      </Button>
    </div>
  );
}
