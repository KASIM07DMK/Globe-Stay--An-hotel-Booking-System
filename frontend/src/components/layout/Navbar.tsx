import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Menu, X, ChevronDown, User, Heart, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { CurrencyCode } from '../../types';
import { useAuth } from '../../features/auth/AuthContext';
import { useCurrency } from '../../features/currency/CurrencyContext';
import { useToast } from '../../features/toast/ToastContext';

interface NavbarProps {
  currentCurrency?: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  user?: { name: string; role: string } | null;
}

const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'USD', label: 'USD ($)', symbol: '$' },
  { code: 'EUR', label: 'EUR (€)', symbol: '€' },
  { code: 'GBP', label: 'GBP (£)', symbol: '£' },
  { code: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { code: 'AED', label: 'AED (د.إ)', symbol: 'AED' },
  { code: 'INR', label: 'INR (₹)', symbol: '₹' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentCurrency: propCurrency,
  onCurrencyChange: propOnChange,
  user: propUser,
}) => {
  const { user: authUser } = useAuth();
  const { currency: ctxCurrency, setCurrency: ctxSetCurrency } = useCurrency();
  const { showToast } = useToast();
  const currentCurrency = propCurrency ?? ctxCurrency;
  const onCurrencyChange = propOnChange ?? ctxSetCurrency;
  const user =
    propUser !== undefined
      ? propUser
      : authUser
      ? { name: authUser.full_name, role: authUser.role }
      : null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  return (
    <header className="glass-nav sticky top-0 z-40 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-brand-950 border border-blue-400/40 flex items-center justify-center text-accent-300 font-bold shadow-glow-blue group-hover:scale-105 transition-transform duration-200">
            <Compass className="w-6 h-6 text-accent-400 group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-white font-sans">
              Globe<span className="text-accent-400">Stay</span>
            </span>
            <span className="text-[10px] tracking-widest uppercase font-bold text-blue-300/80">
              International Reservations
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="/#destinations"
            className="text-sm font-semibold text-slate-300 hover:text-accent-400 transition-colors"
          >
            Destinations
          </a>
          <a
            href="/#featured-hotels"
            className="text-sm font-semibold text-slate-300 hover:text-accent-400 transition-colors"
          >
            Featured Stays
          </a>
          <a
            href="/#why-globestay"
            className="text-sm font-semibold text-slate-300 hover:text-accent-400 transition-colors"
          >
            Why GlobeStay
          </a>
          <a
            href="/#inspiration"
            className="text-sm font-semibold text-slate-300 hover:text-accent-400 transition-colors"
          >
            Travel Journal
          </a>
        </nav>

        {/* Right Actions: Currency, Saved, Auth */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Currency Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-blue-900/60 bg-[#060D1E] text-xs font-bold text-blue-200 hover:bg-blue-950/80 hover:border-blue-700 transition shadow-sm"
              aria-label="Select currency"
            >
              <span>{currentCurrency}</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
            </button>

            {currencyDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setCurrencyDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#060D1E] p-1.5 shadow-card-dark border border-blue-900/70 z-20">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        onCurrencyChange?.(curr.code);
                        showToast(`Display rates converted to ${curr.label}`, 'info');
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition ${
                        currentCurrency === curr.code
                          ? 'bg-blue-600/30 text-accent-300 font-bold border border-blue-500/30'
                          : 'text-slate-300 hover:bg-blue-950/50'
                      }`}
                    >
                      <span>{curr.label}</span>
                      <span className="text-blue-400">{curr.symbol}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Favorites Link */}
          <Link
            to="/favorites"
            className="p-2 text-blue-300 hover:text-accent-300 rounded-xl hover:bg-blue-950/50 transition border border-transparent hover:border-blue-900/40"
            title="Saved Favorites"
          >
            <Heart className="w-5 h-5" />
          </Link>

          {/* User State & Admin Entry */}
          {user ? (
            <div className="flex items-center space-x-2.5">
              <Link
                to={user.role === 'admin' ? '/admin' : '/my-bookings'}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                  user.role === 'admin'
                    ? 'bg-gradient-to-r from-blue-900/80 to-indigo-950 border-blue-500/50 text-accent-300 shadow-glow-blue'
                    : 'bg-gradient-to-r from-blue-950 to-brand-900 border-blue-800/40 hover:border-blue-500/50 text-white'
                }`}
              >
                {user.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-accent-400" />
                ) : (
                  <User className="w-4 h-4 text-blue-400" />
                )}
                <span>{user.name}</span>
                {user.role === 'admin' && (
                  <span className="text-[9px] uppercase px-1.5 py-0.2 bg-blue-600/40 text-blue-200 rounded">Admin</span>
                )}
              </Link>

              {user.role !== 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-blue-900/60 bg-[#060D1E] hover:bg-blue-950/80 hover:border-blue-500/50 text-[11px] font-bold text-accent-400 transition"
                  title="Switch to Admin Console"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login?role=admin"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-blue-900/60 bg-[#060D1E] hover:bg-blue-950/80 hover:border-blue-500/50 text-xs font-bold text-accent-400 transition shadow-sm"
                title="Admin Portal & Console Access"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="accent" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-blue-950/60"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-blue-950 bg-[#020617]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            <a
              href="/#destinations"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-blue-950/60 rounded-xl"
            >
              Destinations
            </a>
            <a
              href="/#featured-hotels"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-blue-950/60 rounded-xl"
            >
              Featured Stays
            </a>
            <a
              href="/#why-globestay"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-blue-950/60 rounded-xl"
            >
              Why GlobeStay
            </a>
            <a
              href="/#inspiration"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-blue-950/60 rounded-xl"
            >
              Travel Journal
            </a>
          </nav>

          <div className="pt-3 border-t border-blue-950 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400">Currency</span>
            <div className="flex space-x-1">
              {currencies.slice(0, 4).map((c) => (
                <button
                  key={c.code}
                  onClick={() => onCurrencyChange?.(c.code)}
                  className={`px-2 py-1 text-xs rounded-lg font-bold ${
                    currentCurrency === c.code
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-950/60 text-slate-300'
                  }`}
                >
                  {c.code}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-blue-950">
            {user ? (
              <div className="flex flex-col space-y-2">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/my-bookings'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 bg-blue-950/80 border border-blue-800/40 rounded-xl text-xs font-bold text-white"
                >
                  <span className="flex items-center space-x-2">
                    {user.role === 'admin' && <Shield className="w-4 h-4 text-accent-400" />}
                    <User className="w-4 h-4 text-blue-400" />
                    <span>{user.name}</span>
                  </span>
                  <span className="text-[10px] text-accent-300 bg-blue-600/30 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </Link>
                {user.role !== 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-xs font-bold text-accent-400 hover:bg-blue-950/50 rounded-xl flex items-center space-x-2 border border-blue-900/50"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Operations Console</span>
                  </Link>
                )}
                <Link
                  to="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-blue-950/50 rounded-xl flex items-center space-x-2"
                >
                  <Heart className="w-4 h-4 text-accent-400" />
                  <span>Saved Stays</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login?role=admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-blue-600/50 bg-blue-950/70 text-xs font-bold text-accent-300 shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5 text-accent-400" />
                  <span>Admin Portal Access</span>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="accent" size="sm" className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
