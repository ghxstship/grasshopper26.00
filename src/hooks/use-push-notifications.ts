/**
 * Hook for managing push notifications
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== 'undefined') {
      setIsSupported(
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window
      );
      
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    }
  }, []);

  useEffect(() => {
    if (isSupported && user && permission === 'granted') {
      checkExistingSubscription();
    }
  }, [isSupported, user, permission]);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      setSubscription(existingSub);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported in this browser');
    }

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted' && user) {
        await subscribe();
      }

      return result;
    } catch (error) {
      console.error('Failed to request permission:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async () => {
    if (!isSupported || !user) {
      throw new Error('Cannot subscribe: not supported or user not authenticated');
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let sub = await registration.pushManager.getSubscription();

      if (!sub) {
        // Subscribe to push notifications
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          throw new Error('VAPID public key not configured');
        }

        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      setSubscription(sub);

      // Save subscription to backend
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      return sub;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) {
      return;
    }

    setIsLoading(true);
    try {
      // Unsubscribe from push service
      await subscription.unsubscribe();

      // Remove from backend
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      setSubscription(null);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    new Notification('Test Notification', {
      body: 'This is a test notification from Grasshopper!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
    });
  };

  return {
    permission,
    subscription,
    isSupported,
    isLoading,
    isSubscribed: !!subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    testNotification,
  };
}

/**
 * Convert VAPID public key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray.buffer;
}
