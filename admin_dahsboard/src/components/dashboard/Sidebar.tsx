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
  X
} from 'lucide-react';
import NextImage from 'next/image';

export const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { 
    name: 'Edit', 
    icon: PencilLine,
    isExpandable: true,
    subItems: [
      { name: 'Categories', href: '/dashboard/categories' },
      { name: 'Pricing', href: '/dashboard/pricing' },
      { name: 'Blog Editing', href: '/dashboard/slider' },
      { name: 'Service Videos', href: '/dashboard/service-videos' },
      { name: 'fourths', href: '#' },
      { name: 'five', href: '#' },
    ]
  },
  { name: 'Artists', href: '/dashboard/artists', icon: Mic2 },
  { name: 'Client Request', href: '/dashboard/requests', icon: Users },
  { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
  { name: 'Browse', href: '/dashboard/browse', icon: Eye },
  { name: 'Admins', href: '/dashboard/admins', icon: ShieldAlert },
];

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function Sidebar({ onClose, userRole = 'admin' }: { onClose?: () => void; userRole?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(true);

  // ... (auth useEffect remains same)

  useEffect(() => {
    const getAuthUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;
      setUser(user);

      if (user?.email) {
        const { data: profile } = await (supabase
          .from('profiles') as any)
          .select('full_name') // only fetch name, role comes from prop
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
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
               <NextImage 
                  src="/logo.png" 
                  alt="Logo" 
                  width={56} 
                  height={36} 
                  className="h-full w-auto object-contain"
                  priority
                />
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

      <div className="px-6 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Navigation</span>
      </div>
      <nav className="px-3 space-y-1 flex-1">
        {navItems
          .filter(item => item.name !== 'Admins' || userRole === 'super_admin')
          .map((item) => {
            if (item.isExpandable) {
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => setIsEditOpen(!isEditOpen)}
                    className={cn(
                      "nav-item group w-full flex justify-between",
                      isEditOpen && "bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="text-white/40 group-hover:text-white" />
                      <span className="font-medium text-white/60 group-hover:text-white/80">
                        {item.name}
                      </span>
                    </div>
                    <ChevronDown 
                      size={14} 
                      className={cn("text-white/20 transition-transform", isEditOpen && "rotate-180")} 
                    />
                  </button>
                  
                  {isEditOpen && (
                    <div className="pl-4 space-y-1">
                      {item.subItems?.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all",
                              isSubActive 
                                ? "bg-white/10 text-white shadow-lg" 
                                : "text-white/30 hover:text-white/60 hover:bg-white/5"
                            )}
                          >
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full transition-all",
                              isSubActive ? "bg-indigo-400" : "bg-white/10"
                            )} />
                            {sub.name}
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
                  "nav-item group",
                  isActive && "active"
                )}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn(
                  "nav-icon transition-colors",
                  isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                )} />
                <span className={cn(isActive ? "font-bold text-white" : "font-medium text-white/60 group-hover:text-white/80")}>
                  {item.name}
                </span>
              </Link>
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
      </div>
    </div>
  );
}
