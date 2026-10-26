import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Alert from '@mui/material/Alert';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthCard from '@/components/common/AuthCard';
import FormField from '@/components/common/FormField';
import PasswordInput from '@/components/common/PasswordInput';

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const DEMO_ACCOUNTS = [
  { label: 'Demo guest', email: 'guest@staynest.dev' },
  { label: 'Demo host', email: 'host@staynest.dev' },
];

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  if (user) return <Navigate to={redirectTo} replace />;

  async function onSubmit(values) {
    try {
      const loggedIn = await login(values);
      toast.success(`Welcome back, ${loggedIn.name.split(' ')[0]}!`);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setError('root', { message: error.message });
    }
  }

  function fillDemo(email) {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password123', { shouldValidate: true });
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to book stays and manage your trips."
      footer={
        <>
          New to StayNest?{' '}
          <Link to="/register" state={location.state} className="font-semibold text-foreground underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        {errors.root && <Alert severity="error">{errors.root.message}</Alert>}

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>

        <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">
          Log in
        </Button>

        <div className="rounded-xl bg-muted p-3 text-center text-xs text-muted-foreground">
          <p className="mb-2">Try a demo account (after running the seed):</p>
          <div className="flex justify-center gap-2">
            {DEMO_ACCOUNTS.map((demo) => (
              <Button key={demo.email} type="button" variant="outline" size="sm" onClick={() => fillDemo(demo.email)}>
                {demo.label}
              </Button>
            ))}
          </div>
        </div>
      </form>
    </AuthCard>
  );
}
