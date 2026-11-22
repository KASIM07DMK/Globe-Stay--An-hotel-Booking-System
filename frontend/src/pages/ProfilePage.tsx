import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../features/auth/AuthContext';
import { updateProfile, changePassword } from '../services/authApi';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.full_name || '' },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onUpdateProfile = async (data: ProfileFormData) => {
    setProfileError('');
    setProfileSuccess('');
    setIsUpdatingProfile(true);
    try {
      await updateProfile({ full_name: data.fullName });
      setProfileSuccess('Profile name updated successfully.');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (data: PasswordFormData) => {
    setPasswordError('');
    setPasswordSuccess('');
    setIsUpdatingPassword(true);
    try {
      await changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
      setPasswordSuccess('Password altered securely.');
      resetPasswordForm();
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password. Verify current password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Profile Card Header */}
        <div className="bg-[#060D1E]/90 rounded-3xl border border-blue-900/50 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-glow-blue border border-blue-400/30">
              {user?.full_name?.charAt(0) || 'G'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">{user?.full_name || 'Traveler'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-950/60 text-blue-300 border border-blue-800/40">
                  {user?.role || 'Customer'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-red-400 hover:bg-red-950/40 hover:text-red-300 border border-red-900/30"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* General Information */}
          <div className="bg-[#060D1E]/90 rounded-3xl border border-blue-900/50 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-blue-900/40">
              <User className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Personal Details</h2>
            </div>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-300 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Your full name"
                leftIcon={<User className="w-4 h-4 text-blue-400" />}
                error={profileErrors.fullName?.message}
                {...registerProfile('fullName')}
              />

              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email is bound to your account and cannot be modified directly"
                leftIcon={<Mail className="w-4 h-4 text-blue-400" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isUpdatingProfile}
              >
                Save Details
              </Button>
            </form>
          </div>

          {/* Security & Password */}
          <div className="bg-[#060D1E]/90 rounded-3xl border border-blue-900/50 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-blue-900/40">
              <Lock className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Security &amp; Password</h2>
            </div>

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-300 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-blue-400" />}
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword')}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Min 8 characters"
                leftIcon={<Lock className="w-4 h-4 text-blue-400" />}
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                leftIcon={<Lock className="w-4 h-4 text-blue-400" />}
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />

              <Button
                type="submit"
                variant="outline"
                size="md"
                className="w-full border-blue-900/60 text-blue-300 hover:text-white"
                isLoading={isUpdatingPassword}
              >
                Update Password
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
