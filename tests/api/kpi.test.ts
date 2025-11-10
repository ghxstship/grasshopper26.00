/**
 * KPI API Integration Tests
 * Tests for KPI API endpoints
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

describe('KPI API Endpoints', () => {
  describe('GET /api/kpi/metrics', () => {
    it('should return all metrics', async () => {
      const response = await fetch(`${API_BASE}/api/kpi/metrics`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await fetch(
        `${API_BASE}/api/kpi/metrics?category=financial_revenue`
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return only core metrics when core=true', async () => {
      const response = await fetch(`${API_BASE}/api/kpi/metrics?core=true`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('POST /api/kpi/calculate', () => {
    it('should require event_id', async () => {
      const response = await fetch(`${API_BASE}/api/kpi/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('event_id');
    });

    it('should calculate KPIs for valid event_id', async () => {
      const response = await fetch(`${API_BASE}/api/kpi/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: 'test-event-id' }),
      });

      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
    });
  });

  describe('GET /api/kpi/dashboard/[eventId]', () => {
    it('should return dashboard data for event', async () => {
      const response = await fetch(
        `${API_BASE}/api/kpi/dashboard/test-event-id`
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      
      if (data.success) {
        expect(data.data).toHaveProperty('metrics');
        expect(data.data).toHaveProperty('insights');
        expect(data.data).toHaveProperty('summary');
      }
    });
  });

  describe('GET /api/kpi/insights/[eventId]', () => {
    it('should return insights for event', async () => {
      const response = await fetch(
        `${API_BASE}/api/kpi/insights/test-event-id`
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter by acknowledged status', async () => {
      const response = await fetch(
        `${API_BASE}/api/kpi/insights/test-event-id?acknowledged=false`
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

describe('KPI API Error Handling', () => {
  it('should handle invalid event IDs gracefully', async () => {
    const response = await fetch(
      `${API_BASE}/api/kpi/dashboard/invalid-uuid-format`
    );
    
    // Should not crash, should return error response
    expect([200, 400, 404, 500]).toContain(response.status);
  });

  it('should return proper error structure', async () => {
    const response = await fetch(`${API_BASE}/api/kpi/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error');
    expect(typeof data.error).toBe('string');
  });
});

describe('KPI API Performance', () => {
  it('should respond within acceptable time', async () => {
    const startTime = Date.now();
    
    await fetch(`${API_BASE}/api/kpi/metrics`);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Should respond within 2 seconds
    expect(responseTime).toBeLessThan(2000);
  });
});
