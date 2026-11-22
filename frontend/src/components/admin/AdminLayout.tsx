import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  Building,
  Bed,
  CalendarDays,
  Users,
  CreditCard,
  MessageSquare,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { Button } from '../ui/Button';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  description,
}) => {
  const { user, isAuthenticated, logout, login, isLoading } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isQuickLoggingIn, setIsQuickLoggingIn] = useState(false);
  const [quickLoginError, setQuickLoginError] = useState('');

  const handleQuickAdminLogin = async () => {
    setIsQuickLoggingIn(true);
    setQuickLoginError('');
    try {
      await login('admin@globestay.com', 'AdminPass123!');
    } catch (err: any) {
      console.error('Failed to quick login as admin:', err);
      setQuickLoginError(err?.message || 'Login failed. Please verify the backend is running.');
    } finally {
      setIsQuickLoggingIn(false);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Hotels Directory', path: '/admin/hotels', icon: Building },
    { label: 'Room Inventory', path: '/admin/rooms', icon: Bed },
    { label: 'Reservations', path: '/admin/bookings', icon: CalendarDays },
    { label: 'Users & Roles', path: '/admin/users', icon: Users },
    { label: 'Transactions', path: '/admin/payments', icon: CreditCard },
    { label: 'Guest Reviews', path: '/admin/reviews', icon: MessageSquare },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center animate-pulse">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-sm text-slate-400 font-medium">Verifying credentials…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 text-white font-sans selection:bg-blue-600 selection:text-white">
        <div className="max-w-md w-full bg-[#060D1E] rounded-3xl p-8 border border-blue-900/50 text-center space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-glow-blue">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Administrator Access Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isAuthenticated 
              ? `You are currently signed in as a traveler (${user?.email}). Switch to an administrator account to access operational tools.`
              : 'Sign in with an administrator account to access the GlobeStay operations console.'}
          </p>

          {quickLoginError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-300 text-xs font-semibold">
              {quickLoginError}
            </div>
          )}

          <div className="pt-4 flex flex-col gap-3.5">
            <Button
              variant="primary"
              onClick={handleQuickAdminLogin}
              isLoading={isQuickLoggingIn}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white shadow-glow-blue flex items-center justify-center gap-3 text-sm font-semibold tracking-wide transition-all duration-200"
            >
              <Shield className="w-4 h-4 text-accent-300 shrink-0" />
              <span className="tracking-wide">1-Click Sign In as Admin</span>
            </Button>

            <div className="flex gap-3 pt-1">
              <Link to="/login?role=admin" state={{ from: location.pathname }} className="flex-1">
                <Button variant="outline" className="w-full py-2.5 text-slate-300 border-blue-900/60 bg-[#030712] hover:bg-blue-950/40 text-xs font-medium tracking-wide">
                  Login Page
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button variant="ghost" className="w-full py-2.5 text-slate-400 hover:text-white hover:bg-white/5 text-xs font-medium tracking-wide">
                  Back to Site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col md:flex-row font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden md:flex md:w-64 flex-col bg-[#020617] text-white shrink-0 border-r border-blue-900/40">
        {/* Brand */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-blue-900/40">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-glow-blue">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white leading-none">
                Globe<span className="text-blue-400">Stay</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-blue-300 mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-glow-blue'
                    : 'text-slate-400 hover:bg-blue-950/40 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-blue-900/40 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-blue-950/40 transition"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Public Storefront</span>
            </span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <header className="md:hidden bg-[#020617] text-white p-4 flex items-center justify-between border-b border-blue-900/40 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-bold text-base">GlobeStay Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#020617] p-6 flex flex-col text-white">
          <div className="flex justify-between items-center pb-4 border-b border-blue-900/40 mb-4">
            <span className="font-bold text-lg">Admin Navigation</span>
            <button onClick={() => setMobileSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-950/40"
                >
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-[#060D1E]/90 backdrop-blur-md border-b border-blue-900/40 px-6 sm:px-8 py-5 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-800/40">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-200">
                {user?.full_name || 'Admin User'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 space-y-6">{children}</main>
      </div>
    </div>
  );
};
