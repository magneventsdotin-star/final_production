import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, full_name, role, password } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return NextResponse.json({ 
        error: 'Registration restricted to @gmail.com email addresses only.' 
      }, { status: 400 });
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

    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingProfile) {
      return NextResponse.json({ 
        error: 'This email is already registered as an admin.' 
      }, { status: 400 });
    }


    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role }
    });

    if (createError) {
      if (createError.message.toLowerCase().includes('already registered') || 
          createError.message.toLowerCase().includes('already exists')) {
        return NextResponse.json({ 
          error: 'An account with this email already exists in authentication.' 
        }, { status: 400 });
      }
      throw createError;
    }

    if (!authUser.user) throw new Error('Failed to create authentication account');

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        email,
        full_name,
        role,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('Profile Creation Error:', profileError);
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error('User was created in auth but profile creation failed.');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin registered successfully',
      user: authUser.user 
    });

  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'The database rejected this registration request.' 
    }, { status: 500 });
  }
}
