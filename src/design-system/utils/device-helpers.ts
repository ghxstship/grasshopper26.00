/**
 * Device Helper Utilities
 * GHXSTSHIP Entertainment Platform Device Detection
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown';
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
}

/**
 * Get user agent
 */
export function getUserAgent(): string {
  if (typeof navigator === 'undefined') return '';
  return navigator.userAgent;
}

/**
 * Detect device type
 */
export function getDeviceType(): DeviceInfo['type'] {
  if (typeof window === 'undefined') return 'desktop';

  const ua = getUserAgent();
  const width = window.innerWidth;

  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua) || (width >= 768 && width < 1024)) {
    return 'tablet';
  }

  if (/Mobile|iPhone|iPod|Android.*Mobile/i.test(ua) || width < 768) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Detect operating system
 */
export function getOperatingSystem(): DeviceInfo['os'] {
  if (typeof navigator === 'undefined') return 'unknown';

  const ua = getUserAgent();

  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Mac OS X/.test(ua)) return 'macos';
  if (/Linux/.test(ua)) return 'linux';

  return 'unknown';
}

/**
 * Detect browser
 */
export function getBrowser(): DeviceInfo['browser'] {
  if (typeof navigator === 'undefined') return 'unknown';

  const ua = getUserAgent();

  if (/Edg/.test(ua)) return 'edge';
  if (/Chrome/.test(ua) && !/Edg/.test(ua)) return 'chrome';
  if (/Firefox/.test(ua)) return 'firefox';
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'safari';
  if (/Opera|OPR/.test(ua)) return 'opera';

  return 'unknown';
}

/**
 * Check if touch device (detailed)
 */
export function hasTouchSupport(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Get device info
 */
export function getDeviceInfo(): DeviceInfo {
  return {
    type: getDeviceType(),
    os: getOperatingSystem(),
    browser: getBrowser(),
    isTouch: hasTouchSupport(),
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  };
}

/**
 * Is mobile device (detailed)
 */
export function isMobileDevice(): boolean {
  return getDeviceType() === 'mobile';
}

/**
 * Is tablet device (detailed)
 */
export function isTabletDevice(): boolean {
  return getDeviceType() === 'tablet';
}

/**
 * Is desktop device (detailed)
 */
export function isDesktopDevice(): boolean {
  return getDeviceType() === 'desktop';
}

/**
 * Is iOS device
 */
export function isIOS(): boolean {
  return getOperatingSystem() === 'ios';
}

/**
 * Is Android device
 */
export function isAndroid(): boolean {
  return getOperatingSystem() === 'android';
}

/**
 * Is Safari browser
 */
export function isSafari(): boolean {
  return getBrowser() === 'safari';
}

/**
 * Is Chrome browser
 */
export function isChrome(): boolean {
  return getBrowser() === 'chrome';
}

/**
 * Get screen orientation
 */
export function getScreenOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait';

  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

/**
 * Is portrait orientation (detailed)
 */
export function isPortraitOrientation(): boolean {
  return getScreenOrientation() === 'portrait';
}

/**
 * Is landscape orientation (detailed)
 */
export function isLandscapeOrientation(): boolean {
  return getScreenOrientation() === 'landscape';
}

/**
 * Get viewport size
 */
export function getViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Get screen size
 */
export function getScreenSize(): { width: number; height: number } {
  if (typeof screen === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: screen.width,
    height: screen.height,
  };
}

/**
 * Get pixel ratio
 */
export function getPixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
}

/**
 * Is retina display
 */
export function isRetina(): boolean {
  return getPixelRatio() >= 2;
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Check if offline
 */
export function isOffline(): boolean {
  return !isOnline();
}

/**
 * Get connection type
 */
export function getConnectionType(): string {
  if (typeof navigator === 'undefined') return 'unknown';

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  return connection?.effectiveType || 'unknown';
}

/**
 * Is slow connection
 */
export function isSlowConnection(): boolean {
  const type = getConnectionType();
  return type === 'slow-2g' || type === '2g';
}

/**
 * Get battery status
 */
export async function getBatteryStatus(): Promise<{
  level: number;
  charging: boolean;
} | null> {
  if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
    return null;
  }

  try {
    const battery = await (navigator as any).getBattery();
    return {
      level: battery.level * 100,
      charging: battery.charging,
    };
  } catch {
    return null;
  }
}

/**
 * Check if PWA
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Check if installed
 */
export function isInstalled(): boolean {
  return isPWA();
}

/**
 * Get device memory
 */
export function getDeviceMemory(): number | null {
  if (typeof navigator === 'undefined') return null;
  return (navigator as any).deviceMemory || null;
}

/**
 * Get hardware concurrency
 */
export function getHardwareConcurrency(): number {
  if (typeof navigator === 'undefined') return 1;
  return navigator.hardwareConcurrency || 1;
}

/**
 * Check if reduced motion preferred (device)
 */
export function devicePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if dark mode preferred
 * @deprecated Use useTheme hook from @/hooks/use-theme instead
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Check if high contrast preferred (device)
 */
export function devicePrefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Get device safe area insets
 */
export function getDeviceSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
  };
}

/**
 * Vibrate device
 */
export function vibrate(pattern: number | number[]): boolean {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return false;
  }

  return navigator.vibrate(pattern);
}

/**
 * Share via native share
 */
export async function nativeShare(data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('share' in navigator)) {
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if native share available
 */
export function canNativeShare(): boolean {
  if (typeof navigator === 'undefined') return false;
  return 'share' in navigator;
}

/**
 * Request wake lock
 */
export async function requestWakeLock(): Promise<any | null> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
    return null;
  }

  try {
    return await (navigator as any).wakeLock.request('screen');
  } catch {
    return null;
  }
}
