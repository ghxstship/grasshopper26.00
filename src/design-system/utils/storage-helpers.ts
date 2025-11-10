/**
 * Storage Helper Utilities
 * GHXSTSHIP Entertainment Platform Local/Session Storage
 */

export type StorageType = 'local' | 'session';

/**
 * Check if storage is available
 */
export function isStorageAvailable(type: StorageType = 'local'): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    const test = '__storage_test__';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage instance
 */
function getStorage(type: StorageType): Storage | null {
  if (!isStorageAvailable(type)) return null;
  return type === 'local' ? localStorage : sessionStorage;
}

/**
 * Set item in storage
 */
export function setStorageItem<T>(
  key: string,
  value: T,
  type: StorageType = 'local'
): boolean {
  const storage = getStorage(type);
  if (!storage) return false;

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get item from storage
 */
export function getStorageItem<T>(
  key: string,
  type: StorageType = 'local'
): T | null {
  const storage = getStorage(type);
  if (!storage) return null;

  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

/**
 * Remove item from storage
 */
export function removeStorageItem(
  key: string,
  type: StorageType = 'local'
): boolean {
  const storage = getStorage(type);
  if (!storage) return false;

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all storage
 */
export function clearStorage(type: StorageType = 'local'): boolean {
  const storage = getStorage(type);
  if (!storage) return false;

  try {
    storage.clear();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all storage keys
 */
export function getStorageKeys(type: StorageType = 'local'): string[] {
  const storage = getStorage(type);
  if (!storage) return [];

  return Object.keys(storage);
}

/**
 * Get storage size in bytes
 */
export function getStorageSize(type: StorageType = 'local'): number {
  const storage = getStorage(type);
  if (!storage) return 0;

  let size = 0;
  for (const key in storage) {
    if (storage.hasOwnProperty(key)) {
      size += key.length + (storage.getItem(key)?.length || 0);
    }
  }

  return size;
}

/**
 * Set item with expiry
 */
export function setStorageItemWithExpiry<T>(
  key: string,
  value: T,
  expiryMs: number,
  type: StorageType = 'local'
): boolean {
  const item = {
    value,
    expiry: Date.now() + expiryMs,
  };

  return setStorageItem(key, item, type);
}

/**
 * Get item with expiry check
 */
export function getStorageItemWithExpiry<T>(
  key: string,
  type: StorageType = 'local'
): T | null {
  const item = getStorageItem<{ value: T; expiry: number }>(key, type);

  if (!item) return null;

  if (Date.now() > item.expiry) {
    removeStorageItem(key, type);
    return null;
  }

  return item.value;
}

/**
 * Create namespaced storage
 */
export function createNamespacedStorage(namespace: string, type: StorageType = 'local') {
  const prefix = `${namespace}:`;

  return {
    set: <T>(key: string, value: T) => setStorageItem(`${prefix}${key}`, value, type),
    get: <T>(key: string) => getStorageItem<T>(`${prefix}${key}`, type),
    remove: (key: string) => removeStorageItem(`${prefix}${key}`, type),
    clear: () => {
      const keys = getStorageKeys(type).filter(k => k.startsWith(prefix));
      keys.forEach(key => removeStorageItem(key, type));
    },
    keys: () => getStorageKeys(type).filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length)),
  };
}

/**
 * Watch storage changes
 */
export function watchStorage(
  callback: (key: string, newValue: unknown, oldValue: unknown) => void,
  type: StorageType = 'local'
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorageChange = (e: StorageEvent) => {
    if (e.storageArea === (type === 'local' ? localStorage : sessionStorage)) {
      const newValue = e.newValue ? JSON.parse(e.newValue) : null;
      const oldValue = e.oldValue ? JSON.parse(e.oldValue) : null;
      callback(e.key || '', newValue, oldValue);
    }
  };

  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}

/**
 * Sync storage across tabs
 */
export function syncStorageAcrossTabs<T>(
  key: string,
  callback: (value: T | null) => void,
  type: StorageType = 'local'
): () => void {
  return watchStorage((changedKey, newValue) => {
    if (changedKey === key) {
      callback(newValue as T | null);
    }
  }, type);
}

/**
 * Migrate storage data
 */
export function migrateStorage(
  migrations: Record<string, (oldValue: unknown) => unknown>,
  type: StorageType = 'local'
): void {
  Object.entries(migrations).forEach(([key, migrate]) => {
    const oldValue = getStorageItem(key, type);
    if (oldValue !== null) {
      const newValue = migrate(oldValue);
      setStorageItem(key, newValue, type);
    }
  });
}

/**
 * Compress storage data
 */
export function compressStorageData(data: unknown): string {
  // Simple compression - in production use a library like lz-string
  return JSON.stringify(data);
}

/**
 * Decompress storage data
 */
export function decompressStorageData<T>(compressed: string): T | null {
  try {
    return JSON.parse(compressed);
  } catch {
    return null;
  }
}

/**
 * Create persistent state manager
 */
export function createPersistentState<T>(
  key: string,
  initialValue: T,
  type: StorageType = 'local'
) {
  const get = (): T => {
    const stored = getStorageItem<T>(key, type);
    return stored !== null ? stored : initialValue;
  };

  const set = (value: T | ((prev: T) => T)): void => {
    const newValue = typeof value === 'function' 
      ? (value as (prev: T) => T)(get())
      : value;
    setStorageItem(key, newValue, type);
  };

  const remove = (): void => {
    removeStorageItem(key, type);
  };

  return { get, set, remove };
}

/**
 * Create storage cache
 */
export class StorageCache<T> {
  private namespace: string;
  private type: StorageType;
  private ttl: number;

  constructor(namespace: string, ttl: number = 5 * 60 * 1000, type: StorageType = 'local') {
    this.namespace = namespace;
    this.type = type;
    this.ttl = ttl;
  }

  set(key: string, value: T): void {
    setStorageItemWithExpiry(`${this.namespace}:${key}`, value, this.ttl, this.type);
  }

  get(key: string): T | null {
    return getStorageItemWithExpiry<T>(`${this.namespace}:${key}`, this.type);
  }

  remove(key: string): void {
    removeStorageItem(`${this.namespace}:${key}`, this.type);
  }

  clear(): void {
    const keys = getStorageKeys(this.type).filter(k => k.startsWith(`${this.namespace}:`));
    keys.forEach(key => removeStorageItem(key, this.type));
  }
}

/**
 * Store user preferences
 */
export const userPreferences = createNamespacedStorage('user-preferences');

/**
 * Store cart data
 */
export const cartStorage = createNamespacedStorage('cart');

/**
 * Store auth tokens
 */
export const authStorage = createNamespacedStorage('auth');

/**
 * Store recently viewed items
 */
export const recentlyViewed = createNamespacedStorage('recently-viewed');
