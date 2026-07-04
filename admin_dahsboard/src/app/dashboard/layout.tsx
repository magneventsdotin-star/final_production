"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Sidebar, navSections } from '@/components/dashboard/Sidebar';
import { Loader2, LogOut, Menu } from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('admin');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);

          const userEmail = session.user.email?.toLowerCase();
          const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL?.toLowerCase();
          const isHardcodedSuper = userEmail && superAdminEmail && userEmail === superAdminEmail;

          const metaRole = session.user.user_metadata?.role || '';
          const isMetaSuper = metaRole === 'superadmin' || metaRole === 'super_admin';

          if (isHardcodedSuper || isMetaSuper) {
            setUserRole('super_admin');
          } else {
            const { data: profile } = await (supabase
              .from('profiles') as any)
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUserRole(profile.role === 'super_admin' ? 'super_admin' : 'admin');
            } else {
              setUserRole('admin');
            }
          }
        } else {
          router.replace('/login');
        }
      } catch (error: any) {

        if (
          error?.message?.includes('refresh_token') ||
          error?.message?.includes('Refresh token') ||
          error?.name === 'AuthApiError'
        ) {
          await supabase.auth.signOut();
        }
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.replace('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
      document.documentElement.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
      document.documentElement.classList.remove('sidebar-open');
    }
    return () => {
      document.body.classList.remove('sidebar-open');
      document.documentElement.classList.remove('sidebar-open');
    };
  }, [sidebarOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-primary-gradient flex items-center justify-center" style={{ boxShadow: 'var(--shadow-button)' }}>
            <Loader2 className="animate-spin text-white h-6 w-6" />
          </div>
          <span className="text-caption font-semibold">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden relative">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[240px] transition-all duration-300 ease-in-out border-r border-slate-200 bg-[#0F172A] flex flex-col shadow-2xl lg:shadow-none",
          sidebarOpen
            ? "translate-x-0 opacity-100 visible pointer-events-auto"
            : "-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100 invisible lg:visible pointer-events-none lg:pointer-events-auto"
        )}
        style={{
          overscrollBehavior: 'none'
        }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} userRole={userRole} />
      </aside>

      <div className="flex flex-col min-h-screen lg:pl-[240px] overflow-x-hidden relative">

        <header className="lg:hidden h-16 bg-[#BAE6FD] border-b border-sky-300/50 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-auto flex-shrink-0">
               <NextImage
                src="/logo.webp"
                alt="Logo"
                width={64}
                height={40}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
            <span className="font-black text-[17px] tracking-tighter text-slate-900 leading-none">TalentTrack</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 rounded-2xl bg-white border border-sky-300 text-[#0284c7] hover:bg-sky-50 transition-all active:scale-90 shadow-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main
          className={cn(
            "flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 transition-all duration-300",
            sidebarOpen ? "opacity-60" : "opacity-100"
          )}
        >
          {children}
        </main>
        
        <footer className="p-4 text-center border-t border-slate-200 mt-auto">
          <span className="text-[12px] font-medium text-slate-400 tracking-wider">v0.1.2</span>
        </footer>
      </div>
    </div>
  );
}
