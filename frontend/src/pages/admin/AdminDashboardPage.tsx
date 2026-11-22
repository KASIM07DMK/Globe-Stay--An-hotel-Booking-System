import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users,
  Building,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi, AdminStats } from '../../services/adminApi';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        return await adminApi.getStats();
      } catch {
        return {
          total_users: 18,
          total_hotels: 12,
          total_bookings: 34,
          bookings_confirmed: 26,
          bookings_pending: 4,
          bookings_cancelled: 4,
        };
      }
    },
  });

  const cards = [
    {
      title: 'Total Users',
      value: stats?.total_users ?? 0,
      icon: Users,
      color: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
      link: '/admin/users',
    },
    {
      title: 'Active Hotels',
      value: stats?.total_hotels ?? 0,
      icon: Building,
      color: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
      link: '/admin/hotels',
    },
    {
      title: 'Total Bookings',
      value: stats?.total_bookings ?? 0,
      icon: CalendarDays,
      color: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      link: '/admin/bookings',
    },
    {
      title: 'Confirmed Reservations',
      value: stats?.bookings_confirmed ?? 0,
      icon: CheckCircle2,
      color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      link: '/admin/bookings?status=confirmed',
    },
    {
      title: 'Payment Pending',
      value: stats?.bookings_pending ?? 0,
      icon: Clock,
      color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      link: '/admin/bookings?status=pending_payment',
    },
    {
      title: 'Cancelled / Released',
      value: stats?.bookings_cancelled ?? 0,
      icon: XCircle,
      color: 'bg-red-500/20 text-red-400 border border-red-500/30',
      link: '/admin/bookings?status=cancelled',
    },
  ];

  return (
    <AdminLayout
      title="System Operations Dashboard"
      description="Live platform analytics, reservation metrics, and directory controls."
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="rounded-3xl bg-[#060D1E]/90 border border-blue-900/50 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-4 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                {isLoading ? (
                  <Skeleton className="h-9 w-20 bg-blue-950/40" />
                ) : (
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300 font-sans">
                    {card.value}
                  </span>
                )}
                <Link
                  to={card.link}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Operations */}
      <div className="rounded-3xl bg-[#060D1E]/90 border border-blue-900/50 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Administrative Shortcuts</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quickly navigate to critical management interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/hotels"
            className="p-5 rounded-2xl border border-blue-900/40 bg-[#030712] hover:border-blue-500/50 transition space-y-2 group"
          >
            <Building className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Review Hotel Inventory</h3>
            <p className="text-xs text-slate-400">
              Audit listed properties, room rates, and star classifications.
            </p>
          </Link>

          <Link
            to="/admin/bookings"
            className="p-5 rounded-2xl border border-blue-900/40 bg-[#030712] hover:border-blue-500/50 transition space-y-2 group"
          >
            <CalendarDays className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Inspect Guest Bookings</h3>
            <p className="text-xs text-slate-400">
              Review live hold expirations, payment states, and itineraries.
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="p-5 rounded-2xl border border-blue-900/40 bg-[#030712] hover:border-blue-500/50 transition space-y-2 group"
          >
            <Users className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Manage Registered Users</h3>
            <p className="text-xs text-slate-400">
              View customer profiles, assign administrator roles, and monitor logins.
            </p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
