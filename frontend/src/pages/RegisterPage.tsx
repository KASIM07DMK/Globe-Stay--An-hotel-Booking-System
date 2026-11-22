import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, User, Compass, Sparkles } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { ApiError } from '../services/apiClient';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-blue-400' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-blue-500' };
  return { score, label: 'Excellent', color: 'bg-emerald-500' };
}

export const RegisterPage: React.FC = () => {
  const { register: authRegister, user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: true,
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const watchedPassword = watch('password', '');
  const strength = useMemo(() => getPasswordStrength(watchedPassword), [watchedPassword]);

  const onSubmit = async (data: RegisterFormData) => {
    setApiError('');
    setIsSubmitting(true);
    try {
      await authRegister(data.fullName, data.email, data.password);
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoData = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setValue('fullName', 'Alex Morgan');
    setValue('email', `traveler_${randomSuffix}@globestay.com`);
    setValue('password', 'TravelerPass123!');
    setValue('confirmPassword', 'TravelerPass123!');
    setValue('acceptTerms', true);
    setApiError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar user={user ? { name: user.full_name, role: user.role } : null} />

      <main className="flex-1 flex">
        {/* ── Left Decorative Panel ── */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-[#020617] via-[#071233] to-[#0A1A4A] relative overflow-hidden border-r border-blue-900/40">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/40 shadow-glow-blue flex items-center justify-center mb-8">
              <Compass className="w-10 h-10 text-blue-400" />
            </div>

            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white mb-3">
              Globe<span className="text-blue-400">Stay</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-300 mb-8">
              International Reservations
            </p>

            <p className="text-lg text-slate-300 font-medium max-w-md leading-relaxed">
              Join thousands of discerning travelers booking extraordinary stays in 85+ countries.
            </p>

            <div className="mt-12 space-y-4 text-left max-w-xs">
              {[
                'Access exclusive member-only rates',
                'Zero overbooking guarantee',
                'Manage bookings in one dashboard',
                '24/7 global concierge support',
              ].map((perk) => (
                <div key={perk} className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-sm text-slate-300">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-6 py-12 sm:px-12 bg-[#030712]">
          <div className="w-full max-w-md bg-[#060D1E]/90 border border-blue-900/50 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
                  <Compass className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Globe<span className="text-blue-400">Stay</span>
                </span>
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Create account
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Register today and unlock exclusive rates worldwide.
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillDemoData}
                className="text-[11px] font-bold text-accent-400 hover:text-accent-300 flex items-center gap-1 bg-blue-950/60 border border-blue-800/40 rounded-xl px-2.5 py-1.5 transition shrink-0"
                title="Fill with valid mock test data"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Demo</span>
              </button>
            </div>

            {/* Error Message */}
            {apiError && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/50 text-sm text-red-300 font-medium">
                {apiError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                autoComplete="name"
                leftIcon={<User className="w-4 h-4 text-blue-400" />}
                error={errors.fullName?.message}
                {...registerField('fullName')}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                leftIcon={<Mail className="w-4 h-4 text-blue-400" />}
                error={errors.email?.message}
                {...registerField('email')}
              />

              {/* Password with strength indicator */}
              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  leftIcon={<Lock className="w-4 h-4 text-blue-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-blue-400 transition-colors focus:outline-none"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  error={errors.password?.message}
                  {...registerField('password')}
                />

                {watchedPassword.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            level <= strength.score ? strength.color : 'bg-blue-950'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`mt-1 text-xs font-semibold ${
                      strength.score <= 1 ? 'text-red-400' :
                      strength.score <= 2 ? 'text-amber-400' :
                      strength.score <= 3 ? 'text-blue-400' :
                      'text-emerald-400'
                    }`}>
                      Password Strength: {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                leftIcon={<Lock className="w-4 h-4 text-blue-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-blue-400 transition-colors focus:outline-none"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.confirmPassword?.message}
                {...registerField('confirmPassword')}
              />

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-blue-900 bg-[#030712] text-blue-600 focus:ring-blue-500 h-4 w-4"
                    {...registerField('acceptTerms')}
                  />
                  <span className="text-xs text-slate-300 leading-snug">
                    I agree to the{' '}
                    <span className="text-blue-400 hover:underline">Terms of Service</span> and{' '}
                    <span className="text-blue-400 hover:underline">Privacy Policy</span>.
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-1 text-xs text-red-400">{errors.acceptTerms.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full shadow-glow-blue"
                isLoading={isSubmitting}
              >
                Create Account
              </Button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
