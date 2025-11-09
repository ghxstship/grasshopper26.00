/**
 * UI State Store
 * Manages global UI state (modals, sidebars, etc.)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIStore {
  // Modal state
  isSearchModalOpen: boolean;
  isCartModalOpen: boolean;
  isMobileMenuOpen: boolean;
  
  // Loading states
  isGlobalLoading: boolean;
  loadingMessage?: string;
  
  // Actions
  openSearchModal: () => void;
  closeSearchModal: () => void;
  toggleSearchModal: () => void;
  
  openCartModal: () => void;
  closeCartModal: () => void;
  toggleCartModal: () => void;
  
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Close all modals
  closeAllModals: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      // Initial state
      isSearchModalOpen: false,
      isCartModalOpen: false,
      isMobileMenuOpen: false,
      isGlobalLoading: false,
      loadingMessage: undefined,
      
      // Search modal
      openSearchModal: () => set({ isSearchModalOpen: true }),
      closeSearchModal: () => set({ isSearchModalOpen: false }),
      toggleSearchModal: () => set((state) => ({ isSearchModalOpen: !state.isSearchModalOpen })),
      
      // Cart modal
      openCartModal: () => set({ isCartModalOpen: true }),
      closeCartModal: () => set({ isCartModalOpen: false }),
      toggleCartModal: () => set((state) => ({ isCartModalOpen: !state.isCartModalOpen })),
      
      // Mobile menu
      openMobileMenu: () => set({ isMobileMenuOpen: true }),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      
      // Global loading
      setGlobalLoading: (loading, message) => set({ 
        isGlobalLoading: loading, 
        loadingMessage: message 
      }),
      
      // Close all
      closeAllModals: () => set({
        isSearchModalOpen: false,
        isCartModalOpen: false,
        isMobileMenuOpen: false,
      }),
    }),
    { name: 'UIStore' }
  )
);

// Convenience hooks
export const useSearchModal = () => useUIStore((state) => ({
  isOpen: state.isSearchModalOpen,
  open: state.openSearchModal,
  close: state.closeSearchModal,
  toggle: state.toggleSearchModal,
}));

export const useCartModal = () => useUIStore((state) => ({
  isOpen: state.isCartModalOpen,
  open: state.openCartModal,
  close: state.closeCartModal,
  toggle: state.toggleCartModal,
}));

export const useMobileMenu = () => useUIStore((state) => ({
  isOpen: state.isMobileMenuOpen,
  open: state.openMobileMenu,
  close: state.closeMobileMenu,
  toggle: state.toggleMobileMenu,
}));
