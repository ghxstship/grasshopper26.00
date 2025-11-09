import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateDeepLink,
  parseDeepLink,
  deepLinks,
  generateShareableLink,
  isInternalLink,
  preserveQueryParams,
  generateReturnUrl,
  parseReturnUrl,
} from '../deep-linking'

describe('Deep Linking Utilities', () => {
  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://gvteway.com',
        pathname: '/test',
        search: '?foo=bar',
      },
      writable: true,
    })
  })

  describe('generateDeepLink', () => {
    it('should generate a simple path', () => {
      const link = generateDeepLink({ path: '/events' })
      expect(link).toBe('/events')
    })

    it('should generate a path with query parameters', () => {
      const link = generateDeepLink({
        path: '/events',
        params: { filter: 'upcoming', page: 1 },
      })
      expect(link).toContain('/events?')
      expect(link).toContain('filter=upcoming')
      expect(link).toContain('page=1')
    })

    it('should generate a path with hash', () => {
      const link = generateDeepLink({
        path: '/events',
        hash: 'section-tickets',
      })
      expect(link).toBe('/events#section-tickets')
    })

    it('should handle hash with # prefix', () => {
      const link = generateDeepLink({
        path: '/events',
        hash: '#section-tickets',
      })
      expect(link).toBe('/events#section-tickets')
    })

    it('should skip undefined parameters', () => {
      const link = generateDeepLink({
        path: '/events',
        params: { filter: 'upcoming', page: undefined },
      })
      expect(link).toBe('/events?filter=upcoming')
    })
  })

  describe('parseDeepLink', () => {
    it('should parse a simple URL', () => {
      const result = parseDeepLink('https://gvteway.com/events')
      expect(result.path).toBe('/events')
      expect(result.params).toEqual({})
      expect(result.hash).toBeNull()
    })

    it('should parse URL with query parameters', () => {
      const result = parseDeepLink('https://gvteway.com/events?filter=upcoming&page=2')
      expect(result.path).toBe('/events')
      expect(result.params).toEqual({ filter: 'upcoming', page: '2' })
    })

    it('should parse URL with hash', () => {
      const result = parseDeepLink('https://gvteway.com/events#tickets')
      expect(result.path).toBe('/events')
      expect(result.hash).toBe('tickets')
    })
  })

  describe('deepLinks generators', () => {
    it('should generate event link', () => {
      const link = deepLinks.event('event-123')
      expect(link).toBe('/events/event-123')
    })

    it('should generate event link with params', () => {
      const link = deepLinks.event('event-123', { section: 'tickets' })
      expect(link).toContain('/events/event-123')
      expect(link).toContain('section=tickets')
    })

    it('should generate artist link', () => {
      const link = deepLinks.artist('artist-slug')
      expect(link).toBe('/artists/artist-slug')
    })

    it('should generate order link', () => {
      const link = deepLinks.order('order-123')
      expect(link).toBe('/orders/order-123')
    })

    it('should generate admin event edit link', () => {
      const link = deepLinks.adminEvent('event-123', 'edit')
      expect(link).toBe('/admin/events/event-123/edit')
    })

    it('should generate membership checkout link', () => {
      const link = deepLinks.membershipCheckout('premium')
      expect(link).toContain('/membership/checkout')
      expect(link).toContain('tier=premium')
    })
  })

  describe('generateShareableLink', () => {
    it('should generate link with UTM parameters', () => {
      const link = generateShareableLink('/events', {
        source: 'email',
        medium: 'newsletter',
        campaign: 'summer-2024',
      })
      expect(link).toContain('utm_source=email')
      expect(link).toContain('utm_medium=newsletter')
      expect(link).toContain('utm_campaign=summer-2024')
    })

    it('should skip undefined UTM parameters', () => {
      const link = generateShareableLink('/events', {
        source: 'email',
      })
      expect(link).toContain('utm_source=email')
      expect(link).not.toContain('utm_medium')
    })
  })

  describe('isInternalLink', () => {
    it('should identify internal absolute URLs', () => {
      expect(isInternalLink('https://gvteway.com/events')).toBe(true)
    })

    it('should identify external URLs', () => {
      expect(isInternalLink('https://example.com/events')).toBe(false)
    })

    it('should identify relative URLs as internal', () => {
      expect(isInternalLink('/events')).toBe(true)
      expect(isInternalLink('./events')).toBe(true)
    })
  })

  describe('preserveQueryParams', () => {
    it('should preserve specified query parameters', () => {
      const result = preserveQueryParams('/new-path', ['foo'])
      expect(result).toContain('/new-path')
      expect(result).toContain('foo=bar')
    })

    it('should not preserve unspecified parameters', () => {
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'https://gvteway.com',
          search: '?foo=bar&baz=qux',
        },
        writable: true,
      })
      const result = preserveQueryParams('/new-path', ['foo'])
      expect(result).toContain('foo=bar')
      expect(result).not.toContain('baz=qux')
    })
  })

  describe('generateReturnUrl', () => {
    it('should encode current path', () => {
      const url = generateReturnUrl('/profile/orders')
      expect(url).toBe(encodeURIComponent('/profile/orders'))
    })

    it('should use window location if no path provided', () => {
      const url = generateReturnUrl()
      expect(url).toBe(encodeURIComponent('/test?foo=bar'))
    })
  })

  describe('parseReturnUrl', () => {
    it('should decode valid return URL', () => {
      const encoded = encodeURIComponent('/profile/orders')
      const result = parseReturnUrl(encoded)
      expect(result).toBe('/profile/orders')
    })

    it('should return / for invalid URLs', () => {
      expect(parseReturnUrl(null)).toBe('/')
      expect(parseReturnUrl(undefined)).toBe('/')
    })

    it('should reject external URLs', () => {
      const external = encodeURIComponent('https://evil.com/phishing')
      const result = parseReturnUrl(external)
      expect(result).toBe('/')
    })
  })
})
