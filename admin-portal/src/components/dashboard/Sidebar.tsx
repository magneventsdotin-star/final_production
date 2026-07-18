"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  LayoutDashboard,
  LogOut,
  Mic2,
  ShieldAlert,
  Eye,
  CalendarCheck,
  Grid2X2,
  Sliders,
  CreditCard,
  PencilLine,
  ChevronDown,
  X,
  Server,
  GitPullRequest,
  Mail,
  Activity,
  Terminal,
  ClipboardList
} from 'lucide-react';

export const navSections = [
  {
    title: 'Main Menu',
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Artists', href: '/dashboard/artists', icon: Mic2 },
      { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
      {
        name: 'Requests',
        icon: GitPullRequest,
        isExpandable: true,
        subItems: [
          { name: 'Client Requests', href: '/dashboard/requests' },
          { name: 'Admin Approvals', href: '/dashboard/team-requests' },
          { name: 'Artist Requests', href: '/dashboard/artist-requests' },
        ]
      },
      { name: 'Emails', href: '/dashboard/emails', icon: Mail },
    ]
  },
  {
    title: 'Content Management',
    items: [
      { name: 'Custom Forms', href: '/dashboard/forms', icon: ClipboardList },
      {
        name: 'Edit',
        icon: PencilLine,
        isExpandable: true,
        subItems: [
          { name: 'Categories', href: '/dashboard/categories' },
          { name: 'Pricing', href: '/dashboard/pricing' },
          { name: 'Blog Editing', href: '/dashboard/slider' },
          { name: 'Service Videos', href: '/dashboard/service-videos' },
        ]
      },
      { name: 'Browse', href: '/dashboard/browse', icon: Eye },
    ]
  },
  {
    title: 'System Administration',
    items: [
      { name: 'Admins', href: '/dashboard/admins', icon: ShieldAlert },
      {
        name: 'Developer Options',
        icon: Terminal,
        isExpandable: true,
        subItems: [
          { name: 'API', href: '/dashboard/api' },
          { name: 'System Health', href: '/dashboard/health' },
        ]
      },
    ]
  }
];

import { useState, useEffect } from 'react';
import { supabase } from '@database/connection/supabase-admin';
import { useRouter } from 'next/navigation';

export function Sidebar({ onClose, userRole = 'admin' }: { onClose?: () => void; userRole?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [pendingClientCount, setPendingClientCount] = useState(0);
  const [pendingArtistCount, setPendingArtistCount] = useState(0);

  useEffect(() => {
    setExpandedMenus(prev => ({
      ...prev,
      'Edit': pathname.startsWith('/dashboard/categories') ||
              pathname.startsWith('/dashboard/pricing') ||
              pathname.startsWith('/dashboard/slider') ||
              pathname.startsWith('/dashboard/service-videos'),
      'Requests': pathname.startsWith('/dashboard/requests') ||
                  pathname.startsWith('/dashboard/team-requests') ||
                  pathname.startsWith('/dashboard/artist-requests'),
      'Developer Options': pathname.startsWith('/dashboard/api') ||
                           pathname.startsWith('/dashboard/health')
    }));
  }, [pathname]);

  useEffect(() => {
    const getAuthUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;
      setUser(user);

      if (user?.email) {
        const { data: profile } = await (supabase
          .from('profiles') as any)
          .select('full_name')
          .eq('email', user.email.toLowerCase())
          .single();

        if (profile) {
          setUser((prev: any) => ({
            ...prev,
            user_metadata: {
              ...prev?.user_metadata,
              full_name: profile.full_name || prev?.user_metadata?.full_name
            }
          }));
        }
      }
    };
    getAuthUser();

    const fetchPendingCount = async () => {
      try {
        const { data, error } = await (supabase
          .from('bookings') as any)
          .select('event_type')
          .eq('booking_source', 'client')
          .eq('status', 'pending');
          
        if (!error && data) {
          let clientCount = 0;
          let artistCount = 0;
          data.forEach((b: any) => {
            if (b.event_type === 'Artist Registration') artistCount++;
            else clientCount++;
          });
          setPendingClientCount(clientCount);
          setPendingArtistCount(artistCount);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchPendingCount();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });
    
    const channel = supabase.channel('bookings_changes_sidebar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchPendingCount();
      })
      .subscribe();

    const handleForceRefresh = () => fetchPendingCount();
    window.addEventListener('refresh_sidebar_counts', handleForceRefresh);

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
      window.removeEventListener('refresh_sidebar_counts', handleForceRefresh);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full sidebar-dark border-r border-white/5 overflow-y-auto select-none">
      <div className="px-6 py-8 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-9 rounded-lg overflow-hidden">
               <img
                  src="/logo.webp"
                  alt="Logo"
                  width={56}
                  height={36}
                  className="h-full w-auto object-contain"  />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xl tracking-tighter leading-none">Magnevents</span>
              <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-[0.2em] mt-1">Admin Portal</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <nav className="px-3 space-y-6 flex-1 pt-2 pb-6">
        {navSections.map((section, idx) => {
          const visibleItems = section.items.filter(item => {
            const restricted = ['Admins', 'Developer Options'];
            if (restricted.includes(item.name)) {
              return userRole === 'super_admin';
            }
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <div className="px-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">{section.title}</span>
              </div>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  if (item.isExpandable) {
                    const isOpen = expandedMenus[item.name];
                    return (
                      <div key={item.name} className="space-y-1">
                        <button
                          onClick={() => setExpandedMenus(prev => ({ ...prev, [item.name]: !isOpen }))}
                          className={cn(
                            "nav-item group w-full flex justify-between",
                            isOpen && "bg-white/5"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon size={18} className="text-white/40 group-hover:text-white" />
                            <span className="font-medium text-white/60 group-hover:text-white/80">
                              {item.name}
                            </span>
                          </div>
                          {item.name === 'Requests' && (pendingClientCount + pendingArtistCount) > 0 && !isOpen && (
                            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-rose-400 animate-pulse mr-2">
                              {pendingClientCount + pendingArtistCount}
                            </span>
                          )}
                          <ChevronDown
                            size={14}
                            className={cn("text-white/20 transition-transform", isOpen && "rotate-180")}
                          />
                        </button>

                        {isOpen && (
                          <div className="pl-4 space-y-1">
                            {item.subItems?.map((sub: any) => {
                              if (sub.restricted && userRole !== 'super_admin') return null;
                              
                              const isSubActive = pathname === sub.href;
                              
                              let displayName = sub.name;
                              if (sub.name === 'Admin Approvals' && userRole !== 'super_admin') {
                                displayName = 'Approved Requests';
                              }

                              return (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  onClick={onClose}
                                  className={cn(
                                    "flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all",
                                    isSubActive
                                      ? "bg-white/10 text-white shadow-lg"
                                      : "text-white/30 hover:text-white/60 hover:bg-white/5"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={cn(
                                      "w-1.5 h-1.5 rounded-full transition-all",
                                      isSubActive ? "bg-indigo-400" : "bg-white/10"
                                    )} />
                                    {displayName}
                                  </div>
                                  {sub.name === 'Client Requests' && pendingClientCount > 0 && (
                                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg border border-rose-400 animate-pulse">
                                      {pendingClientCount}
                                    </span>
                                  )}
                                  {sub.name === 'Artist Requests' && pendingArtistCount > 0 && (
                                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg border border-rose-400 animate-pulse">
                                      {pendingArtistCount}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href || item.name}
                      href={item.href || '#'}
                      onClick={onClose}
                      className={cn(
                        "nav-item group relative flex items-center justify-between",
                        isActive && "active"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn(
                          "nav-icon transition-colors",
                          isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                        )} />
                        <span className={cn(isActive ? "font-bold text-white" : "font-medium text-white/60 group-hover:text-white/80")}>
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5 bg-black/10">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-xs border border-white/10 shadow-lg">
              {user?.email?.[0].toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-white truncate leading-tight mb-1">
                {user?.user_metadata?.full_name || 'Admin User'}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black tracking-wider text-white/30 uppercase">Online</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-white/40 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all uppercase tracking-widest"
        >
          <LogOut size={14} />
          Sign Out
        </button>
        <div className="text-center mt-4 text-[10px] text-white/20 font-bold tracking-widest uppercase">
          v1.1.0
        </div>
      </div>
    </div>
  );
}
