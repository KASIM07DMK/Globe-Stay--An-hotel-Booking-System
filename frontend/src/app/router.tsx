import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// ── Lazy-loaded public pages ─────────────────────────────────────────────────
const HomePage = lazy(() => import('../pages/HomePage'));
const SearchResultsPage = lazy(() => import('../pages/SearchResultsPage'));
const HotelDetailsPage = lazy(() => import('../pages/HotelDetailsPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// ── Lazy-loaded protected pages ──────────────────────────────────────────────
const BookingPage = lazy(() => import('../pages/BookingPage'));
const BookingConfirmationPage = lazy(() => import('../pages/BookingConfirmationPage'));
const MyBookingsPage = lazy(() => import('../pages/MyBookingsPage'));
const BookingDetailsPage = lazy(() => import('../pages/BookingDetailsPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const FavoritesPage = lazy(() => import('../pages/FavoritesPage'));

// ── Admin pages ──────────────────────────────────────────────────────────────
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const ManageHotelsPage = lazy(() => import('../pages/admin/ManageHotelsPage'));
const ManageRoomsPage = lazy(() => import('../pages/admin/ManageRoomsPage'));
const ManageBookingsPage = lazy(() => import('../pages/admin/ManageBookingsPage'));
const ManageUsersPage = lazy(() => import('../pages/admin/ManageUsersPage'));
const ManagePaymentsPage = lazy(() => import('../pages/admin/ManagePaymentsPage'));
const ManageReviewsPage = lazy(() => import('../pages/admin/ManageReviewsPage'));

// ── Page loader ──────────────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#030712]">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── Router ───────────────────────────────────────────────────────────────────
export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/hotels/:id" element={<HotelDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Authenticated user routes */}
        <Route path="/booking" element={
          <ProtectedRoute><BookingPage /></ProtectedRoute>
        } />
        <Route path="/booking-confirmation/:bookingId" element={
          <ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
        } />
        <Route path="/bookings/:bookingId" element={
          <ProtectedRoute><BookingDetailsPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute><FavoritesPage /></ProtectedRoute>
        } />

        {/* Admin routes — AdminLayout still handles its own auth gate for the sidebar */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/hotels" element={<ManageHotelsPage />} />
        <Route path="/admin/rooms" element={<ManageRoomsPage />} />
        <Route path="/admin/bookings" element={<ManageBookingsPage />} />
        <Route path="/admin/users" element={<ManageUsersPage />} />
        <Route path="/admin/payments" element={<ManagePaymentsPage />} />
        <Route path="/admin/reviews" element={<ManageReviewsPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
