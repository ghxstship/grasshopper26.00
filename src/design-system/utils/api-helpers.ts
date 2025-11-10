/**
 * API Helper Utilities
 * GHXSTSHIP Entertainment Platform API Integration
 */

export interface APIResponse<T = unknown> {
  data?: T;
  error?: APIError;
  status: number;
  headers?: Headers;
}

export interface APIError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
}

/**
 * Make API request
 */
export async function apiRequest<T = unknown>(
  url: string,
  config: RequestConfig = {}
): Promise<APIResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000,
    retries = 0,
  } = config;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          message: data.message || 'Request failed',
          code: data.code,
          details: data,
        },
        status: response.status,
        headers: response.headers,
      };
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiRequest<T>(url, { ...config, retries: retries - 1 });
    }

    return {
      error: {
        message: error instanceof Error ? error.message : 'Network error',
      },
      status: 0,
    };
  }
}

/**
 * GET request
 */
export async function get<T = unknown>(
  url: string,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, { ...config, method: 'GET' });
}

/**
 * POST request
 */
export async function post<T = unknown>(
  url: string,
  body?: unknown,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, { ...config, method: 'POST', body });
}

/**
 * PUT request
 */
export async function put<T = unknown>(
  url: string,
  body?: unknown,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, { ...config, method: 'PUT', body });
}

/**
 * PATCH request
 */
export async function patch<T = unknown>(
  url: string,
  body?: unknown,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, { ...config, method: 'PATCH', body });
}

/**
 * DELETE request
 */
export async function del<T = unknown>(
  url: string,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, { ...config, method: 'DELETE' });
}

/**
 * Build API query string
 */
export function buildAPIQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Build URL with query params
 */
export function buildURL(baseUrl: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return baseUrl;
  return `${baseUrl}${buildAPIQueryString(params)}`;
}

/**
 * Parse API error
 */
export function parseAPIError(error: APIError): string {
  return error.message || 'An error occurred';
}

/**
 * Check if response is successful
 */
export function isSuccessResponse<T>(response: APIResponse<T>): response is APIResponse<T> & { data: T } {
  return !response.error && response.status >= 200 && response.status < 300;
}

/**
 * Retry request with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<APIResponse<T>>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<APIResponse<T>> {
  let lastError: APIResponse<T> | null = null;

  for (let i = 0; i < maxRetries; i++) {
    const response = await fn();

    if (isSuccessResponse(response)) {
      return response;
    }

    lastError = response;
    const delay = baseDelay * Math.pow(2, i);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  return lastError!;
}

/**
 * Batch requests
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<APIResponse<T>>>,
  batchSize: number = 5
): Promise<Array<APIResponse<T>>> {
  const results: Array<APIResponse<T>> = [];

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(req => req()));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Create API client
 */
export function createAPIClient(baseURL: string, defaultHeaders?: Record<string, string>) {
  return {
    get: <T>(path: string, config?: Omit<RequestConfig, 'method' | 'body'>) =>
      get<T>(`${baseURL}${path}`, {
        ...config,
        headers: { ...defaultHeaders, ...config?.headers },
      }),

    post: <T>(path: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
      post<T>(`${baseURL}${path}`, body, {
        ...config,
        headers: { ...defaultHeaders, ...config?.headers },
      }),

    put: <T>(path: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
      put<T>(`${baseURL}${path}`, body, {
        ...config,
        headers: { ...defaultHeaders, ...config?.headers },
      }),

    patch: <T>(path: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
      patch<T>(`${baseURL}${path}`, body, {
        ...config,
        headers: { ...defaultHeaders, ...config?.headers },
      }),

    delete: <T>(path: string, config?: Omit<RequestConfig, 'method' | 'body'>) =>
      del<T>(`${baseURL}${path}`, {
        ...config,
        headers: { ...defaultHeaders, ...config?.headers },
      }),
  };
}

/**
 * Upload file
 */
export async function uploadFile(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<APIResponse> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        resolve({
          data,
          status: xhr.status,
        });
      } catch {
        resolve({
          error: { message: 'Failed to parse response' },
          status: xhr.status,
        });
      }
    });

    xhr.addEventListener('error', () => {
      resolve({
        error: { message: 'Upload failed' },
        status: 0,
      });
    });

    xhr.open('POST', url);
    xhr.send(formData);
  });
}

/**
 * Download file
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(objectUrl);
}

/**
 * Poll endpoint until condition is met
 */
export async function pollUntil<T>(
  fn: () => Promise<APIResponse<T>>,
  condition: (data: T) => boolean,
  interval: number = 1000,
  maxAttempts: number = 30
): Promise<APIResponse<T>> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fn();

    if (isSuccessResponse(response) && condition(response.data)) {
      return response;
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return {
    error: { message: 'Polling timeout' },
    status: 408,
  };
}

/**
 * Cache API response
 */
export class APICache {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private ttl: number;

  constructor(ttl: number = 5 * 60 * 1000) {
    this.ttl = ttl;
  }

  set(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Create cached API client
 */
export function createCachedAPIClient(baseURL: string, cacheTTL?: number) {
  const cache = new APICache(cacheTTL);
  const client = createAPIClient(baseURL);

  return {
    ...client,
    getCached: async <T>(path: string, config?: Omit<RequestConfig, 'method' | 'body'>) => {
      const cacheKey = `${path}${buildAPIQueryString(config as any)}`;
      const cached = cache.get<T>(cacheKey);

      if (cached) {
        return { data: cached, status: 200 } as APIResponse<T>;
      }

      const response = await client.get<T>(path, config);

      if (isSuccessResponse(response)) {
        cache.set(cacheKey, response.data);
      }

      return response;
    },
    clearCache: () => cache.clear(),
  };
}

/**
 * Handle API rate limiting
 */
export class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private lastRequest = 0;
  private minInterval: number;

  constructor(requestsPerSecond: number = 10) {
    this.minInterval = 1000 / requestsPerSecond;
  }

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequest;

      if (timeSinceLastRequest < this.minInterval) {
        await new Promise(resolve =>
          setTimeout(resolve, this.minInterval - timeSinceLastRequest)
        );
      }

      const fn = this.queue.shift();
      if (fn) {
        this.lastRequest = Date.now();
        await fn();
      }
    }

    this.processing = false;
  }
}
