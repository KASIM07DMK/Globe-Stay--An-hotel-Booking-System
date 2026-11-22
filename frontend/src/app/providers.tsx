import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth/AuthContext';
import { CurrencyProvider } from '../features/currency/CurrencyContext';
import { ToastProvider } from '../features/toast/ToastContext';
import { WishlistProvider } from '../features/wishlist/WishlistContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <ToastProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </ToastProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
