import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError } from '@/lib/api/error-handler';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';

// GET /api/v1/search - Universal search
export async function GET(req: NextRequest) {
  try {
    await rateLimit(req, RateLimitPresets.read);

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters',
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Use the universal_search function from the database
    const { data, error } = await supabase.rpc('universal_search', {
      search_query: query,
      result_limit: limit,
    });

    if (error) {
      throw error;
    }

    // Group results by type
    const results = {
      events: data?.filter((r: any) => r.result_type === 'event') || [],
      artists: data?.filter((r: any) => r.result_type === 'artist') || [],
      products: data?.filter((r: any) => r.result_type === 'product') || [],
      posts: data?.filter((r: any) => r.result_type === 'post') || [],
    };

    return NextResponse.json({
      success: true,
      query,
      data: results,
      total: data?.length || 0,
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}
