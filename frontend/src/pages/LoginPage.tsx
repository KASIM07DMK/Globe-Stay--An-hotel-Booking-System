import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Compass, Shield, User } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { ApiError } from '../services/apiClient';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin'>(() => {
    const params = new URLSearchParams(location.search);
    return params.get('role') === 'admin' ? 'admin' : 'customer';
  });

  const from = (location.state as { from?: string })?.from || (selectedRole === 'admin' ? '/admin' : '/');

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const {
    register: registerField,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('role') === 'admin') {
      setSelectedRole('admin');
      setValue('email', 'admin@globestay.com');
      setValue('password', 'AdminPass123!');
    }
  }, [location.search, setValue]);

  const handleSelectRole = (role: 'customer' | 'admin') => {
    setSelectedRole(role);
    setApiError('');
    if (role === 'admin') {
      setValue('email', 'admin@globestay.com');
      setValue('password', 'AdminPass123!');
    } else {
      setValue('email', 'customer@globestay.com');
      setValue('password', 'CustomerPass123!');
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setApiError('');
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      // After login, navigate based on role or intended destination
      const isAdmin = data.email.toLowerCase().includes('admin') || selectedRole === 'admin';
      const destination = from !== '/' && from !== '/login' ? from : isAdmin ? '/admin' : '/';
      navigate(destination, { replace: true });
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

  const handleOneClickLogin = async (role: 'customer' | 'admin') => {
    setApiError('');
    setIsSubmitting(true);
    try {
      if (role === 'admin') {
        await login('admin@globestay.com', 'AdminPass123!');
        navigate('/admin', { replace: true });
      } else {
        await login('customer@globestay.com', 'CustomerPass123!');
        navigate('/my-bookings', { replace: true });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('Could not connect to server. Make sure the backend is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
            {/* Compass Icon */}
            <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/40 shadow-glow-blue flex items-center justify-center mb-8">
              <Compass className="w-10 h-10 text-blue-400" />
            </div>

            {/* Brand Name */}
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white mb-3">
              Globe<span className="text-blue-400">Stay</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-300 mb-8">
              International Reservations
            </p>

            {/* Tagline */}
            <p className="text-lg text-slate-300 font-medium max-w-md leading-relaxed">
              Extraordinary stays with guaranteed availability across 85+ countries worldwide.
            </p>

            {/* Trust badges */}
            <div className="mt-12 flex items-center space-x-6 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span>PCI-DSS Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span>IATA Partner</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-6 py-12 sm:px-12 bg-[#030712]">
          <div className="w-full max-w-md bg-[#060D1E]/90 border border-blue-900/50 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            {/* Mobile Brand Header */}
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
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {selectedRole === 'admin' ? 'Admin Authentication' : 'Welcome back'}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {selectedRole === 'admin' 
                  ? 'Sign in to access room inventory, bookings, analytics, and operational controls.'
                  : 'Sign in to your GlobeStay account to access your bookings and exclusive rates.'}
              </p>
            </div>

            {/* Account Role Selector Tabs */}
            <div className="flex rounded-2xl bg-[#020617] p-1 border border-blue-900/60 mb-6">
              <button
                type="button"
                onClick={() => handleSelectRole('customer')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedRole === 'customer'
                    ? 'bg-blue-600 text-white shadow-glow-blue'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Traveler Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-glow-blue border border-blue-400/30'
                    : 'text-slate-400 hover:text-accent-300'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-accent-400" />
                <span>Admin Console</span>
              </button>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/50 text-sm text-red-300 font-medium">
                {apiError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                leftIcon={<Mail className="w-4 h-4 text-blue-400" />}
                error={errors.email?.message}
                {...registerField('email')}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-blue-900 bg-[#030712] text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-xs font-medium text-slate-300">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full shadow-glow-blue"
                isLoading={isSubmitting}
              >
                {selectedRole === 'admin' ? 'Enter Admin Console' : 'Sign In'}
              </Button>
            </form>

            {/* One-Click Quick Sign In Helpers */}
            <div className="mt-7 pt-5 border-t border-blue-900/40">
              <span className="block text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                ⚡ Instant 1-Click Access
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOneClickLogin('admin')}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 rounded-xl bg-blue-950/70 hover:bg-blue-900/70 border border-blue-500/40 text-accent-300 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2.5 shadow-sm group hover:scale-[1.02]"
                >
                  <Shield className="w-4 h-4 text-accent-400 group-hover:rotate-12 transition-transform shrink-0" />
                  <span className="tracking-wide">1-Click Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOneClickLogin('customer')}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 rounded-xl bg-[#020617] hover:bg-blue-950/40 border border-blue-900/60 text-slate-300 hover:text-white text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02]"
                >
                  <User className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="tracking-wide">1-Click Traveler</span>
                </button>
              </div>
            </div>

            {/* Register Link */}
            <p className="mt-6 text-center text-xs text-slate-400">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
