import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const genre = searchParams.get('genre');

    let query = supabase
      .from('artists')
      .select('*')
      .order('name', { ascending: true });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (genre) {
      query = query.contains('genre_tags', [genre]);
    }

    const { data: artists, error } = await query;

    if (error) {
      console.error('Artists fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ artists });
  } catch (error) {
    console.error('Artists fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artists' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const artistData = await req.json();
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: adminData } = await supabase
      .from('brand_admins')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!adminData || !['owner', 'admin', 'editor'].includes(adminData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create artist
    const { data: artist, error } = await supabase
      .from('artists')
      .insert(artistData)
      .select()
      .single();

    if (error) {
      console.error('Artist creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, artist });
  } catch (error) {
    console.error('Artist creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create artist' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ...updates } = await req.json();
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: adminData } = await supabase
      .from('brand_admins')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!adminData || !['owner', 'admin', 'editor'].includes(adminData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update artist
    const { data: artist, error } = await supabase
      .from('artists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Artist update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, artist });
  } catch (error) {
    console.error('Artist update error:', error);
    return NextResponse.json(
      { error: 'Failed to update artist' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Artist ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: adminData } = await supabase
      .from('brand_admins')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!adminData || !['owner', 'admin'].includes(adminData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete artist
    const { error } = await supabase
      .from('artists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Artist deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Artist deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete artist' },
      { status: 500 }
    );
  }
}
