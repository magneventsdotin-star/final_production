"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (error.message?.includes('Refresh token is not valid')) {
            localStorage.removeItem('sb-lgtmmvztmelrmlzjppzx-auth-token');
          }
          router.replace('/login');
          return;
        }
        if (session?.user) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
      } catch (err) {
        localStorage.removeItem('sb-lgtmmvztmelrmlzjppzx-auth-token');
        router.replace('/login');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="w-24 h-24 flex items-center justify-center p-2 animate-pulse">
          <Image src="/logo.webp" alt="Magnevents" width={96} height={96} className="object-contain" priority />
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl font-black font-display tracking-tight text-slate-900 leading-none">
            Magne<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">vents</span>
          </h1>
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin text-indigo-600 h-5 w-5" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Initializing Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
