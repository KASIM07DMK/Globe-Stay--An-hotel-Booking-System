import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { reviewsApi, FavoriteItem } from '../../services/reviewsApi';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../toast/ToastContext';

interface WishlistContextType {
  wishlistIds: Set<number>;
  isWishlisted: (hotelId: number | string) => boolean;
  toggleWishlist: (hotelId: number | string, hotelName?: string) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const LOCAL_STORAGE_KEY = 'globestay_wishlist_ids';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as number[];
        return new Set<number>(parsed);
      }
    } catch (e) {
      console.error('Error reading wishlist from localStorage', e);
    }
    return new Set<number>();
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync with API when user is logged in
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    setIsLoading(true);

    reviewsApi.getMyFavorites()
      .then((items: FavoriteItem[]) => {
        if (!isMounted) return;
        const apiIds = new Set<number>(items.map((i: FavoriteItem) => i.hotel_id));
        setWishlistIds((prev: Set<number>) => {
          const merged = new Set<number>([...Array.from(prev), ...Array.from(apiIds)]);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(merged)));
          } catch {}
          return merged;
        });
      })
      .catch((err: any) => {
        console.warn('Could not sync favorites with backend, using local state:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const isWishlisted = useCallback((hotelId: number | string): boolean => {
    const idNum = typeof hotelId === 'string' ? parseInt(hotelId, 10) : hotelId;
    return wishlistIds.has(idNum);
  }, [wishlistIds]);

  const toggleWishlist = useCallback(async (hotelId: number | string, hotelName?: string) => {
    const idNum = typeof hotelId === 'string' ? parseInt(hotelId, 10) : hotelId;
    const isCurrentlyWishlisted = wishlistIds.has(idNum);
    const nextState = !isCurrentlyWishlisted;

    // Optimistically update local state immediately
    setWishlistIds((prev: Set<number>) => {
      const updated = new Set<number>(prev);
      if (nextState) {
        updated.add(idNum);
      } else {
        updated.delete(idNum);
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(updated)));
      } catch {}
      return updated;
    });

    showToast(
      nextState
        ? `Saved ${hotelName || 'property'} to your private wishlist`
        : `Removed ${hotelName || 'property'} from your wishlist`,
      nextState ? 'success' : 'info'
    );

    // If authenticated, persist to backend API
    if (isAuthenticated) {
      try {
        await reviewsApi.toggleFavorite(idNum);
      } catch (err: any) {
        console.error('Failed to sync favorite with server:', err);
      }
    }
  }, [wishlistIds, isAuthenticated, showToast]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
