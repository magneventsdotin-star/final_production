import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    const { data: profile, error: profileFetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profile) {
      return NextResponse.json({
        message: 'User is active in database. Not a ghost.',
        isGhost: false
      });
    }
    const { data: { users }, error: authSearchError } = await supabaseAdmin.auth.admin.listUsers();

    if (authSearchError) {
      return NextResponse.json({ error: authSearchError.message }, { status: 500 });
    }

    const ghostUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (ghostUser) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(ghostUser.id);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Ghost user detected and removed from Auth.',
        isGhost: true,
        cleaned: true
      });
    }

    return NextResponse.json({
      message: 'No ghost user found.',
      isGhost: false
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
