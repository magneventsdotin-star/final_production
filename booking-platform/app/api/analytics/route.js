import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const data = await req.json();
    const { path, type, userAgent, sessionId } = data;
    
    // Hash IP address for unique visitor tracking without storing raw IPs
    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('analytics').insert([{
      path: path || '/',
      type: type || 'page_view',
      user_agent: userAgent || 'unknown',
      ip_hash: ipHash,
      session_id: sessionId || null
    }]);

    if (error) {
      console.error('Analytics tracking error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
