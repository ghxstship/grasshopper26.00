/**
 * Global State Stores
 * Centralized exports for all Zustand stores
 */

// Cart store
export {
  useCartStore,
  useCartTotal,
  useCartItemCount,
  useCartItems,
  type CartItem,
} from './cart.store';

// UI store
export {
  useUIStore,
  useSearchModal,
  useCartModal,
  useMobileMenu,
} from './ui.store';

// User preferences store
export {
  useUserPreferencesStore,
  useViewMode,
  useNotificationPreferences,
  useAccessibilityPreferences,
} from './user-preferences.store';
