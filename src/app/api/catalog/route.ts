import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    let query = supabase
      .from('catalog_items')
      .select(`
        *,
        category:catalog_categories(*)
      `)
      .eq('is_active', true)
      .order('name');

    // Filter by category
    if (category) {
      const { data: categoryData } = await supabase
        .from('catalog_categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }

    // Search by name or description
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Error fetching catalog items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch catalog items' },
        { status: 500 }
      );
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
