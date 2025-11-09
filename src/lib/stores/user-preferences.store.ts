/**
 * User Preferences Store
 * Manages user preferences with persistence
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

type ViewMode = 'grid' | 'list';
type SortOrder = 'date' | 'price' | 'popularity' | 'name';

interface UserPreferencesStore {
  // Display preferences
  viewMode: ViewMode;
  itemsPerPage: number;
  
  // Sorting preferences
  defaultSortOrder: SortOrder;
  
  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  
  // Privacy preferences
  analyticsConsent: boolean;
  marketingConsent: boolean;
  
  // Accessibility preferences
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setItemsPerPage: (count: number) => void;
  setDefaultSortOrder: (order: SortOrder) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setPushNotifications: (enabled: boolean) => void;
  setSmsNotifications: (enabled: boolean) => void;
  setAnalyticsConsent: (consent: boolean) => void;
  setMarketingConsent: (consent: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  
  // Reset to defaults
  resetPreferences: () => void;
}

const defaultPreferences = {
  viewMode: 'grid' as ViewMode,
  itemsPerPage: 12,
  defaultSortOrder: 'date' as SortOrder,
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
  analyticsConsent: false,
  marketingConsent: false,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium' as const,
};

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  devtools(
    persist(
      (set) => ({
        ...defaultPreferences,
        
        setViewMode: (mode) => set({ viewMode: mode }),
        setItemsPerPage: (count) => set({ itemsPerPage: count }),
        setDefaultSortOrder: (order) => set({ defaultSortOrder: order }),
        setEmailNotifications: (enabled) => set({ emailNotifications: enabled }),
        setPushNotifications: (enabled) => set({ pushNotifications: enabled }),
        setSmsNotifications: (enabled) => set({ smsNotifications: enabled }),
        setAnalyticsConsent: (consent) => set({ analyticsConsent: consent }),
        setMarketingConsent: (consent) => set({ marketingConsent: consent }),
        setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
        setHighContrast: (enabled) => set({ highContrast: enabled }),
        setFontSize: (size) => set({ fontSize: size }),
        
        resetPreferences: () => set(defaultPreferences),
      }),
      {
        name: 'gvteway-user-preferences',
        version: 1,
      }
    ),
    { name: 'UserPreferencesStore' }
  )
);

// Convenience hooks
export const useViewMode = () => useUserPreferencesStore((state) => state.viewMode);
export const useNotificationPreferences = () => useUserPreferencesStore((state) => ({
  email: state.emailNotifications,
  push: state.pushNotifications,
  sms: state.smsNotifications,
}));
export const useAccessibilityPreferences = () => useUserPreferencesStore((state) => ({
  reducedMotion: state.reducedMotion,
  highContrast: state.highContrast,
  fontSize: state.fontSize,
}));
