import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Compass, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSubmittedEmail(data.email);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-16 sm:py-24">
        <div className="w-full max-w-md bg-[#060D1E]/90 border border-blue-900/50 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
                <Compass className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Globe<span className="text-blue-400">Stay</span>
              </span>
            </Link>

            {!isSubmitted ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Reset your password
                </h2>
                <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
                  Enter the email address associated with your account, and we&apos;ll send you a link to reset your password.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto mb-5 shadow-glow-blue">
                  <CheckCircle2 className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Check your email
                </h2>
                <p className="mt-3 text-sm text-slate-300 max-w-sm mx-auto">
                  We&apos;ve sent a password reset link to{' '}
                  <span className="font-semibold text-blue-400">{submittedEmail}</span>.
                  Please check your inbox and follow the instructions.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="font-semibold text-blue-400 hover:text-blue-300 underline"
                  >
                    try again
                  </button>
                  .
                </p>
              </>
            )}
          </div>

          {/* Form (shown only before submission) */}
          {!isSubmitted && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                leftIcon={<Mail className="w-4 h-4 text-blue-400" />}
                error={errors.email?.message}
                {...registerField('email')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full shadow-glow-blue"
                isLoading={isSubmitting}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
