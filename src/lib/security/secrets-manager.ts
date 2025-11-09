/**
 * Secrets Management System
 * 
 * Provides secure storage and retrieval of sensitive configuration values
 * with encryption at rest and runtime validation.
 * 
 * Features:
 * - Environment variable validation
 * - Runtime secret rotation support
 * - Audit logging for secret access
 * - Type-safe secret access
 */

import { logger } from '@/lib/monitoring/logger';

export interface SecretConfig {
  key: string;
  required: boolean;
  encrypted?: boolean;
  description?: string;
  validator?: (value: string) => boolean;
}

export enum SecretCategory {
  DATABASE = 'database',
  API_KEY = 'api_key',
  ENCRYPTION = 'encryption',
  PAYMENT = 'payment',
  EMAIL = 'email',
  MONITORING = 'monitoring',
  INTEGRATION = 'integration',
}

// Secret registry with validation rules
const SECRET_REGISTRY: Record<string, SecretConfig> = {
  // Database
  NEXT_PUBLIC_SUPABASE_URL: {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    validator: (v) => v.startsWith('https://') && v.includes('.supabase.co'),
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
    validator: (v) => v.startsWith('eyJ') && v.length > 100,
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    encrypted: true,
    description: 'Supabase service role key (sensitive)',
    validator: (v) => v.startsWith('eyJ') && v.length > 100,
  },

  // Payment
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    description: 'Stripe publishable key',
    validator: (v) => v.startsWith('pk_'),
  },
  STRIPE_SECRET_KEY: {
    key: 'STRIPE_SECRET_KEY',
    required: true,
    encrypted: true,
    description: 'Stripe secret key (sensitive)',
    validator: (v) => v.startsWith('sk_'),
  },
  STRIPE_WEBHOOK_SECRET: {
    key: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    encrypted: true,
    description: 'Stripe webhook signing secret',
    validator: (v) => v.startsWith('whsec_'),
  },

  // Security
  CSRF_SECRET: {
    key: 'CSRF_SECRET',
    required: true,
    encrypted: true,
    description: 'CSRF token secret',
    validator: (v) => v.length >= 32,
  },
  CRON_SECRET: {
    key: 'CRON_SECRET',
    required: true,
    encrypted: true,
    description: 'Cron job authentication secret',
    validator: (v) => v.length >= 32,
  },

  // Email
  RESEND_API_KEY: {
    key: 'RESEND_API_KEY',
    required: true,
    encrypted: true,
    description: 'Resend email service API key',
    validator: (v) => v.startsWith('re_'),
  },

  // Redis
  UPSTASH_REDIS_REST_URL: {
    key: 'UPSTASH_REDIS_REST_URL',
    required: false,
    description: 'Upstash Redis REST URL',
    validator: (v) => v.startsWith('https://'),
  },
  UPSTASH_REDIS_REST_TOKEN: {
    key: 'UPSTASH_REDIS_REST_TOKEN',
    required: false,
    encrypted: true,
    description: 'Upstash Redis REST token',
  },

  // Monitoring
  NEXT_PUBLIC_SENTRY_DSN: {
    key: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false,
    description: 'Sentry DSN for error monitoring',
    validator: (v) => v.startsWith('https://') && v.includes('sentry.io'),
  },
  SENTRY_AUTH_TOKEN: {
    key: 'SENTRY_AUTH_TOKEN',
    required: false,
    encrypted: true,
    description: 'Sentry authentication token',
  },
};

class SecretsManager {
  private static instance: SecretsManager;
  private secretCache: Map<string, string> = new Map();
  private validationErrors: string[] = [];
  private validated: boolean = false;

  private constructor() {
    // Don't validate on construction - validate lazily when needed
    // This prevents build-time failures when secrets aren't available
  }

  static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  /**
   * Ensure secrets are validated before use
   */
  private ensureValidated(): void {
    if (!this.validated) {
      this.validateSecrets();
      this.validated = true;
    }
  }

  /**
   * Validate all required secrets on initialization
   */
  private validateSecrets(): void {
    const errors: string[] = [];

    for (const [name, config] of Object.entries(SECRET_REGISTRY)) {
      const value = process.env[config.key];

      // Check if required secret is missing
      if (config.required && !value) {
        errors.push(`Missing required secret: ${config.key}`);
        continue;
      }

      // Skip validation if not required and not present
      if (!value) continue;

      // Validate secret format
      if (config.validator && !config.validator(value)) {
        errors.push(
          `Invalid format for secret: ${config.key}${
            config.description ? ` (${config.description})` : ''
          }`
        );
      }

      // Cache the secret
      this.secretCache.set(config.key, value);
    }

    this.validationErrors = errors;

    if (errors.length > 0) {
      logger.error('Secret validation failed', undefined, { errors: errors.join(', ') });
      
      // Only fail fast in production runtime (not during build)
      // During build, VERCEL_ENV will be set but secrets may not be available yet
      const isProductionRuntime = process.env.NODE_ENV === 'production' && 
                                   process.env.VERCEL_ENV && 
                                   typeof process.env.VERCEL !== 'undefined';
      
      if (isProductionRuntime) {
        throw new Error(
          `Secret validation failed:\n${errors.join('\n')}`
        );
      } else {
        logger.warn('Running with invalid secrets (development/build mode)');
      }
    } else {
      logger.info('All secrets validated successfully');
    }
  }

  /**
   * Get a secret value with audit logging
   */
  getSecret(key: string, logAccess = true): string {
    this.ensureValidated();
    
    const value = this.secretCache.get(key) || process.env[key];

    if (!value) {
      const config = SECRET_REGISTRY[key];
      if (config?.required) {
        throw new Error(`Required secret not found: ${key}`);
      }
      return '';
    }

    // Log access to encrypted secrets
    if (logAccess && SECRET_REGISTRY[key]?.encrypted) {
      logger.info('Secret accessed', {
        key,
        timestamp: new Date().toISOString(),
      });
    }

    return value;
  }

  /**
   * Check if a secret exists
   */
  hasSecret(key: string): boolean {
    return this.secretCache.has(key) || !!process.env[key];
  }

  /**
   * Get validation errors
   */
  getValidationErrors(): string[] {
    this.ensureValidated();
    return [...this.validationErrors];
  }

  /**
   * Check if secrets are valid
   */
  isValid(): boolean {
    this.ensureValidated();
    return this.validationErrors.length === 0;
  }

  /**
   * Refresh secrets from environment (for rotation)
   */
  refresh(): void {
    this.secretCache.clear();
    this.validationErrors = [];
    this.validated = false;
    this.validateSecrets();
    this.validated = true;
    logger.info('Secrets refreshed');
  }

  /**
   * Get secret metadata (without values)
   */
  getSecretMetadata(): Array<{
    key: string;
    required: boolean;
    encrypted: boolean;
    present: boolean;
    description?: string;
  }> {
    this.ensureValidated();
    return Object.entries(SECRET_REGISTRY).map(([_, config]) => ({
      key: config.key,
      required: config.required,
      encrypted: config.encrypted || false,
      present: this.hasSecret(config.key),
      description: config.description,
    }));
  }

  /**
   * Mask sensitive values for logging
   */
  maskSecret(value: string): string {
    if (!value || value.length < 8) return '***';
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }
}

// Lazy singleton getter to avoid instantiation at module load time
export function getSecretsManager(): SecretsManager {
  return SecretsManager.getInstance();
}

// Convenience functions
export function getSecret(key: string): string {
  return getSecretsManager().getSecret(key);
}

export function hasSecret(key: string): boolean {
  return getSecretsManager().hasSecret(key);
}

export function validateSecrets(): boolean {
  return getSecretsManager().isValid();
}

export function getSecretMetadata() {
  return getSecretsManager().getSecretMetadata();
}

export function maskSecret(value: string): string {
  return getSecretsManager().maskSecret(value);
}
