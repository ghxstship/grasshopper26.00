/**
 * Notification Helper Utilities
 * GHXSTSHIP Entertainment Platform Notification System
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPosition = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  position?: NotificationPosition;
  dismissible?: boolean;
}

/**
 * Generate notification ID
 */
export function generateNotificationId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create notification object
 */
export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  options: Partial<Notification> = {}
): Notification {
  return {
    id: generateNotificationId(),
    type,
    title,
    message,
    duration: options.duration || 5000,
    position: options.position || 'top-right',
    dismissible: options.dismissible !== false,
  };
}

/**
 * Show browser notification
 */
export async function showBrowserNotification(
  title: string,
  options: NotificationOptions = {}
): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('Browser notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification(title, options);
    }
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  return await Notification.requestPermission();
}

/**
 * Check if notifications are supported
 */
export function areNotificationsSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Check if notifications are enabled
 */
export function areNotificationsEnabled(): boolean {
  return areNotificationsSupported() && Notification.permission === 'granted';
}

/**
 * Format notification message
 */
export function formatNotificationMessage(
  template: string,
  data: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return String(data[key] || match);
  });
}

/**
 * Create event notification
 */
export function createEventNotification(
  eventName: string,
  eventDate: Date,
  type: 'reminder' | 'update' | 'cancellation'
): Notification {
  const messages = {
    reminder: `${eventName} is coming up soon!`,
    update: `${eventName} has been updated`,
    cancellation: `${eventName} has been cancelled`,
  };

  return createNotification(
    type === 'cancellation' ? 'error' : 'info',
    type.toUpperCase(),
    messages[type]
  );
}

/**
 * Create ticket notification
 */
export function createTicketNotification(
  ticketType: string,
  action: 'purchased' | 'transferred' | 'scanned'
): Notification {
  const messages = {
    purchased: `${ticketType} ticket purchased successfully`,
    transferred: `${ticketType} ticket transferred`,
    scanned: `${ticketType} ticket scanned for entry`,
  };

  return createNotification(
    'success',
    action.toUpperCase(),
    messages[action]
  );
}

/**
 * Schedule notification
 */
export function scheduleNotification(
  notification: Notification,
  delay: number
): number {
  return window.setTimeout(() => {
    showBrowserNotification(notification.title, {
      body: notification.message,
      icon: '/icon.png',
    });
  }, delay);
}

/**
 * Cancel scheduled notification
 */
export function cancelScheduledNotification(timerId: number): void {
  clearTimeout(timerId);
}

/**
 * Group notifications by type
 */
export function groupNotificationsByType(
  notifications: Notification[]
): Record<NotificationType, Notification[]> {
  return notifications.reduce((acc, notification) => {
    if (!acc[notification.type]) {
      acc[notification.type] = [];
    }
    acc[notification.type].push(notification);
    return acc;
  }, {} as Record<NotificationType, Notification[]>);
}

/**
 * Filter unread notifications
 */
export function filterUnreadNotifications(
  notifications: Notification[],
  readIds: Set<string>
): Notification[] {
  return notifications.filter(n => !readIds.has(n.id));
}

/**
 * Sort notifications by date
 */
export function sortNotificationsByDate(
  notifications: Notification[],
  order: 'asc' | 'desc' = 'desc'
): Notification[] {
  return [...notifications].sort((a, b) => {
    const timeA = parseInt(a.id.split('-')[1]);
    const timeB = parseInt(b.id.split('-')[1]);
    return order === 'asc' ? timeA - timeB : timeB - timeA;
  });
}

/**
 * Create push notification payload
 */
export function createPushNotificationPayload(
  title: string,
  body: string,
  data?: Record<string, unknown>
): {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
} {
  return {
    title,
    body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data,
  };
}

/**
 * Send push notification via service worker
 */
export async function sendPushNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const payload = createPushNotificationPayload(title, body, data);

  await registration.showNotification(payload.title, {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    data: payload.data,
  });
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

/**
 * Convert VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Get notification icon for type (GHXSTSHIP monochromatic)
 */
export function getNotificationIcon(type: NotificationType): string {
  // All icons are monochromatic geometric shapes
  const icons = {
    success: '✓', // Checkmark
    error: '✕', // X
    warning: '!', // Exclamation
    info: 'i', // Info
  };

  return icons[type];
}

/**
 * Get notification color (GHXSTSHIP monochromatic)
 */
export function getNotificationColor(type: NotificationType): string {
  // All notifications use black/white/grey for GHXSTSHIP
  return '#000000';
}

/**
 * Create in-app notification banner
 */
export function createNotificationBanner(notification: Notification): HTMLDivElement {
  const banner = document.createElement('div');
  banner.id = notification.id;
  banner.className = 'notification-banner';
  banner.style.cssText = `
    position: fixed;
    ${notification.position?.includes('top') ? 'top: 20px;' : 'bottom: 20px;'}
    ${notification.position?.includes('left') ? 'left: 20px;' : notification.position?.includes('right') ? 'right: 20px;' : 'left: 50%; transform: translateX(-50%);'}
    background: #FFFFFF;
    border: 3px solid #000000;
    padding: 16px;
    z-index: 9999;
    min-width: 300px;
    max-width: 500px;
  `;

  banner.innerHTML = `
    <div style="font-family: 'Bebas Neue', sans-serif; font-size: 18px; text-transform: uppercase; margin-bottom: 8px;">
      ${notification.title}
    </div>
    <div style="font-family: 'Share Tech', monospace; font-size: 14px;">
      ${notification.message}
    </div>
  `;

  if (notification.dismissible) {
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
    `;
    closeBtn.onclick = () => banner.remove();
    banner.appendChild(closeBtn);
  }

  if (notification.duration) {
    setTimeout(() => banner.remove(), notification.duration);
  }

  return banner;
}

/**
 * Show in-app notification
 */
export function showInAppNotification(notification: Notification): void {
  const banner = createNotificationBanner(notification);
  document.body.appendChild(banner);
}
