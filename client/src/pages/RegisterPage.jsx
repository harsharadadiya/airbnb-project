import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Home, Luggage } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthCard from '@/components/common/AuthCard';
import FormField from '@/components/common/FormField';
import PasswordInput from '@/components/common/PasswordInput';

// Same rules as the server (server/src/validators/schemas.js)
const schema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Must contain a letter')
      .regex(/\d/, 'Must contain a number'),
    confirmPassword: z.string(),
    role: z.enum(['guest', 'host']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const { register: signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: params.get('role') === 'host' ? 'host' : 'guest',
    },
  });

  if (user) return <Navigate to="/" replace />;

  async function onSubmit({ confirmPassword: _ignored, ...values }) {
    try {
      const created = await signUp(values);
      toast.success(`Welcome to StayNest, ${created.name.split(' ')[0]}!`);
      navigate(created.role === 'host' ? '/host' : location.state?.from || '/', { replace: true });
    } catch (error) {
      const fields = Object.entries(error.fieldErrors ?? {});
      fields.forEach(([field, message]) => setError(field, { message }));
      if (!fields.length) setError('root', { message: error.message });
    }
  }

  return (
    <AuthCard
      title="Create your account"
      description="Book unique stays — or share your own place."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-foreground underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        {errors.root && <Alert severity="error">{errors.root.message}</Alert>}

        <FormField label="I want to">
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup
                exclusive
                fullWidth
                color="primary"
                value={field.value}
                onChange={(_e, value) => value && field.onChange(value)}
                aria-label="Account type"
              >
                <ToggleButton value="guest" sx={{ gap: 1, py: 1.2 }}>
                  <Luggage size={18} /> Travel
                </ToggleButton>
                <ToggleButton value="host" sx={{ gap: 1, py: 1.2 }}>
                  <Home size={18} /> Host my place
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          />
        </FormField>

        <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint="At least 8 characters with a letter and a number"
        >
          <PasswordInput id="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} {...register('password')} />
        </FormField>

        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
        </FormField>

        <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">
          Sign up
        </Button>
      </form>
    </AuthCard>
  );
}
