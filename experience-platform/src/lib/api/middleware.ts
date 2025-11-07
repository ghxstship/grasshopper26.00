import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ErrorResponses } from './error-handler';

// Authentication middleware
export async function requireAuth(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw ErrorResponses.unauthorized();
  }

  return user;
}

// Admin role middleware
export async function requireAdmin(req: NextRequest) {
  const user = await requireAuth(req);
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    throw ErrorResponses.forbidden('Admin access required');
  }

  return user;
}

// Brand admin middleware
export async function requireBrandAdmin(req: NextRequest, brandId: string) {
  const user = await requireAuth(req);
  const supabase = await createClient();

  const { data: brandAdmin } = await supabase
    .from('brand_admins')
    .select('role')
    .eq('user_id', user.id)
    .eq('brand_id', brandId)
    .single();

  if (!brandAdmin || !['owner', 'admin'].includes(brandAdmin.role)) {
    throw ErrorResponses.forbidden('Brand admin access required');
  }

  return user;
}

// Pagination middleware
export interface PaginationParams {
  limit: number;
  offset: number;
  page: number;
}

export function parsePagination(req: NextRequest): PaginationParams {
  const searchParams = req.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');
  const page = Math.floor(offset / limit) + 1;

  return { limit, offset, page };
}

// Sorting middleware
export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function parseSort(
  req: NextRequest,
  allowedFields: string[],
  defaultField: string = 'created_at'
): SortParams {
  const searchParams = req.nextUrl.searchParams;
  const sortBy = searchParams.get('sortBy') || defaultField;
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  if (!allowedFields.includes(sortBy)) {
    throw ErrorResponses.validationError(
      `Invalid sort field. Allowed: ${allowedFields.join(', ')}`
    );
  }

  if (!['asc', 'desc'].includes(sortOrder)) {
    throw ErrorResponses.validationError('Invalid sort order. Use "asc" or "desc"');
  }

  return { sortBy, sortOrder };
}

// Filter middleware
export function parseFilters(
  req: NextRequest,
  allowedFilters: string[]
): Record<string, string> {
  const searchParams = req.nextUrl.searchParams;
  const filters: Record<string, string> = {};

  allowedFilters.forEach((filter) => {
    const value = searchParams.get(filter);
    if (value) {
      filters[filter] = value;
    }
  });

  return filters;
}

// Request validation middleware
export async function validateRequest<T>(
  req: NextRequest,
  schema: any
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    throw error; // Will be caught by error handler
  }
}

// CORS middleware
export function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Request logging middleware
export function logRequest(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
}

// IP extraction middleware
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

// User agent extraction
export function getUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'unknown';
}
