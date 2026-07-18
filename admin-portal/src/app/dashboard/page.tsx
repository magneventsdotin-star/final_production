"use client";
import { useConfirm } from '@/components/ui/ConfirmProvider';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Mic2, 
  Star, 
  Loader2, 
  Globe,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Plus,
  Calendar,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  Search,
  X,
  MapPin,
  Phone,
  Mail,
  Music,
  Wand2,
  Users,
  Guitar,
  Disc3,
  Image as ImageIcon,
  IndianRupee,
  Trash2,
  Share2,
  PlayCircle,
  Eye,
  User,
  PencilLine,
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { CreateArtistModal } from '@/components/artists/CreateArtistModal';
import { ManualBookingModal } from '@/components/bookings/ManualBookingModal';
import { supabase } from '@database/connection/supabase-admin';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getDashboardCache, setDashboardCache } from '@/lib/cache';

const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const CATEGORIES: Record<string, { label: string; icon: any; subCategories: string[] }> = {
  'Singer': {
    label: 'Singer',
    icon: Mic2,
    subCategories: ['Bollywood', 'Bollywood Retro', 'Sufi', 'Punjabi', 'Western Rock', 'Western Pop', 'Western Retro', 'Gazals', 'English Jazz/Blues', 'Rap'],
  },
  'Live band': {
    label: 'Live Band',
    icon: Music,
    subCategories: ['Bollywood', 'Bollywood Retro', 'Sufi', 'Punjabi', 'Western Rock', 'Western Pop', 'Western Retro', 'Gazals', 'English Jazz/Blues', 'Hip-Hop/Rap'],
  },
  'Magician': {
    label: 'Magician',
    icon: Wand2,
    subCategories: ['Close Up', 'Kids', 'Illusionist', 'Mentalist', 'Stage'],
  },
  'Anchor': {
    label: 'Anchor',
    icon: Users,
    subCategories: ['Private Events', 'Birthday', 'Corporate', 'Wedding', 'Celebrity'],
  },
  'Comedian': {
    label: 'Comedian',
    icon: Mic2,
    subCategories: ['Standup Shows', 'Private Events', 'Corporate Events', 'Mimicry Artist'],
  },
  'Instrumentalist': {
    label: 'Instrumentalist',
    icon: Guitar,
    subCategories: ['Saxophonist', 'Pianist', 'Violinist', 'Cellist', 'Flutist', 'Percussionist'],
  },
  'Djs': {
    label: 'DJs',
    icon: Disc3,
    subCategories: ['Bollywood', 'EDM', 'Techno', 'Western', 'Hip-Hop'],
  },
};

export default function DashboardOverview() {
  const { confirmAction } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [stats, setStats] = useState([
    { label: 'Total Artists', value: '0', icon: Mic2, color: 'indigo', trend: '+12%' },
    { label: 'Popular Artists', value: '0', icon: Star, color: 'amber', trend: '+5%' },
    { label: 'Languages', value: '0', icon: Globe, color: 'cyan', trend: 'Global' },
    { label: 'Active Admins', value: '0', icon: ShieldCheck, color: 'emerald', trend: 'Verified' },
  ]);
  const [recentArtists, setRecentArtists] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState<{ id: string, canViewAll: boolean } | null>(null);
  const [spotlightArtists, setSpotlightArtists] = useState<any[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<any[]>([]);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSpotlightIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  /* Removed auto-scroll interval to save system resources and prevent unintended start-up tasks */
  const nextSlide = () => emblaApi?.scrollNext();
  const prevSlide = () => emblaApi?.scrollPrev();

  const fetchDashboardData = async () => {
    /* Cache bypassed to ensure real-time consistency for 'Artist of the Month' settings */
    setLoading(true);
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        if (authError?.message?.includes('Refresh token is not valid')) {
          localStorage.removeItem('sb-lgtmmvztmelrmlzjppzx-auth-token');
        }
        window.location.href = '/login';
        return;
      }

      const user = session.user;
      let currentUserRole = 'admin';
      let canViewAll = false;
      let currentUserId = '';
      if (user) {
        currentUserId = user.id;
        const email = user.email?.toLowerCase();
        const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL?.toLowerCase();
        if (email && superAdminEmail && email === superAdminEmail) {
          currentUserRole = 'super_admin';
          canViewAll = true;
        } else {
          const { data: profile } = await supabase.from('profiles').select('role, can_view_all_artists').eq('id', user.id).single();
          currentUserRole = (profile as any)?.role || 'admin';
          canViewAll = currentUserRole === 'super_admin' || !!(profile as any)?.can_view_all_artists;
        }
        setUserRole(currentUserRole);
        setCurrentUserData({ id: currentUserId, canViewAll });
      }

      const shouldFilter = !canViewAll && currentUserId;

      let countQuery = supabase.from('artists').select('*', { count: 'exact', head: true });
      if (shouldFilter) countQuery = countQuery.eq('created_by', currentUserId);
      const { count: artistCount } = await countQuery;
      
      const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
      const { count: adminCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');

      const newStats: any[] = [
        { label: 'Total Artists', value: artistCount?.toString() || '0', icon: Mic2, color: 'sky', trend: 'Verified' },
        { label: 'Total Bookings', value: bookingCount?.toString() || '0', icon: CalendarCheck, color: 'indigo', trend: 'Active' },
      ];

      if (currentUserRole === 'super_admin') {
        newStats.push({ label: 'Active Admins', value: adminCount?.toString() || '0', icon: ShieldCheck, color: 'emerald', trend: 'Verified' });
      }

      setStats(newStats);

      // Fetch Recent Artists - Sorted by "First Come" (ASC)
      let recentQuery = supabase
        .from('artists')
        .select('*, artist_images!fk_artist_id(image_url)')
        .order('created_at', { ascending: true }) // Oldest first as requested
        .limit(20);
      if (shouldFilter) recentQuery = recentQuery.eq('created_by', currentUserId);
      const { data: recent } = await recentQuery;

      let aomQuery = supabase
        .from('artists')
        .select('*, artist_images!fk_artist_id(image_url)')
        .eq('is_artist_of_month', true)
        .order('created_at', { ascending: true })
        .limit(5);
      if (shouldFilter) aomQuery = aomQuery.eq('created_by', currentUserId);
      const { data: aomData } = await aomQuery;

      let popularQuery = supabase
        .from('artists')
        .select('*, artist_images!fk_artist_id(image_url)')
        .eq('is_trending', true)
        .order('created_at', { ascending: true })
        .limit(5);
      if (shouldFilter) popularQuery = popularQuery.eq('created_by', currentUserId);
      const { data: popularData } = await popularQuery;

      // Build the dynamic pool strictly from DB results
      const dbAll: any[] = [...(aomData || []), ...(popularData || []), ...(recent || [])];
      const uniquePool = Array.from(new Map(dbAll.map(item => [item.id, item])).values());
      const top20 = uniquePool.slice(0, 20);
      
      // Spotlight strictly from DB - Limit to exactly ONE profile as requested
      const aomSelection = (uniquePool.filter(a => a.is_artist_of_month) || []).slice(0, 1);
      
      let spotlightItems = aomSelection;

      // If no AOMs are selected, fallback to ONLY ONE popular artist or recent one
      if (spotlightItems.length === 0) {
        spotlightItems = (uniquePool.filter(a => a.is_trending) || []).slice(0, 1);
      }
      if (spotlightItems.length === 0) {
        spotlightItems = uniquePool.slice(0, 1);
      }
      
      // Final enforcement of single-profile rule for Admin Dashboard
      setSpotlightArtists(spotlightItems.slice(0, 1));
      setRecentArtists(top20);

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, artists(name, category)')
        .order('created_at', { ascending: false })
        .limit(5);

      const recentBookingsList = bookings || [];
      setRecentBookings(recentBookingsList);

      // Store in memory cache
      setDashboardCache({
        stats: newStats,
        recentArtists: top20,
        spotlightArtists: spotlightItems,
        recentBookings: recentBookingsList,
        userRole: currentUserRole
      });

    } catch (error) {
      // Failed to load dashboard data
    } finally {
      setLoading(false);
    }
  };



  const fetchBrowseArtists = useCallback(async () => {
    if (!currentUserData) return;
    setBrowseLoading(true);
    try {
      let query = supabase
        .from('artists')
        .select('*, artist_images!fk_artist_id(image_url)');

      if (!currentUserData.canViewAll) {
        query = query.eq('created_by', currentUserData.id);
      }

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,alias.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`
        );
      }

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.ilike('category', selectedCategory);
      }

      if (selectedSubCategories.length > 0) {
        const orClauses = selectedSubCategories.map(sub => `sub_category.ilike.%${sub}%`).join(',');
        query = query.or(orClauses);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) {
        console.error('SUPABASE_ERROR:', error);
        throw error;
      }
      setFilteredArtists(data || []);
    } catch (error: any) {
      // Error in artist fetch
    } finally {
      setBrowseLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSubCategories, currentUserData]);

  useEffect(() => {
    if (detailOpen || isModalOpen) {
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
  }, [detailOpen, isModalOpen]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBrowseArtists();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchBrowseArtists]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedSubCategories]);

  const totalPages = Math.ceil(filteredArtists.length / ITEMS_PER_PAGE);
  const paginatedArtists = filteredArtists.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeleteArtist = async (id: string, name: string) => {
    if (!await confirmAction('Admin Verification Required', `Are you sure you want to delete ${name}? This will also remove all their images from storage.`, 'danger')) return;
    try {
      // 1. Fetch all image URLs for this artist before deleting
      const { data: images } = await (supabase
        .from('artist_images') as any)
        .select('image_url')
        .eq('artist_id', id);

      // 2. Delete images from Cloudflare R2
      if (images && images.length > 0) {
        const imageUrls = images.map((img: any) => img.image_url).filter(Boolean);
        await fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrls }),
        });
      }

      // 3. Delete artist_images rows from Supabase
      await (supabase.from('artist_images') as any).delete().eq('artist_id', id);

      // 4. Delete the artist record
      const { error } = await (supabase.from('artists') as any).delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'Deleted', description: `${name} and all their images have been removed.` });
      setDetailOpen(false);
      fetchBrowseArtists();
      fetchDashboardData();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleShare = (artistId: string) => {
    const url = `${window.location.origin}/share/${artistId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied",
        description: "Profile link has been copied to your clipboard.",
      });
    }).catch(() => {
      // Fallback
      window.open(url, '_blank');
    });
    window.open(url, '_blank');
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubCategories([]);
    setSearchQuery('');
  };

  const subCategories = selectedCategory ? CATEGORIES[selectedCategory]?.subCategories || [] : [];

  const refreshAll = () => {
    fetchDashboardData();
    fetchBrowseArtists();
  };

  const getIconConfig = (color: string) => {
    switch (color) {
      case 'indigo': return { bg: 'bg-sky-50', text: 'text-sky-600' };
      case 'amber': return { bg: 'bg-amber-50', text: 'text-amber-500' };
      case 'cyan': return { bg: 'bg-indigo-50', text: 'text-indigo-500' };
      case 'emerald': return { bg: 'bg-emerald-50', text: 'text-emerald-500' };
      case 'sky': return { bg: 'bg-sky-50', text: 'text-sky-600' };
      default: return { bg: 'bg-sky-50', text: 'text-sky-600' };
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <CreateArtistModal 
        key={editingArtist?.id || 'new'}
        open={isModalOpen} 
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setTimeout(() => setEditingArtist(null), 200);
        }} 
        onSuccess={refreshAll} 
        initialData={editingArtist}
      />
      <ManualBookingModal open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen} />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 sm:gap-0">
        <div className="section-header">
           <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent mb-1 font-display">
            Dashboard Overview
          </h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-lg shadow-sky-200/50 hover:shadow-sky-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Plus size={16} strokeWidth={3} />
            Add Artist
          </button>
          <button 
            onClick={() => setIsBookingModalOpen(true)}
            className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-white shadow-lg shadow-sky-100/50 hover:shadow-sky-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Calendar size={16} strokeWidth={3} />
            Manual Booking
          </button>
        </div>
      </div>

      {spotlightArtists.length > 0 && (
          <div className="relative mb-12">
            <div className="overflow-hidden rounded-[40px] bg-[#0F172A] border border-white/5 shadow-2xl" ref={emblaRef}>
              <div className="flex">
                {spotlightArtists.map((artist, idx) => (
                  <div key={artist.id} className="flex-[0_0_100%] min-w-0 relative">
                    {/* Floating 3D Accents */}
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] aspect-square bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
                    
                    <div className="px-8 py-10 sm:px-14 sm:py-16 relative z-10">
                      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                        {/* Left Content */}
                        <div className={cn(
                          "flex-1 space-y-6 transition-all duration-1000",
                          spotlightIndex === idx ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                        )}>
                          <div className="flex flex-col gap-2 items-start">
                             {artist.is_artist_of_month && (
                               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 border border-indigo-400/50 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-900/40">
                                 <Music size={10} />
                                 Artist of Month
                               </div>
                             )}
                             {artist.is_trending && (
                               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-amber-400 text-[9px] font-black uppercase tracking-[0.2em]">
                                 <Star size={10} fill="currentColor" />
                                 Popular Selection
                               </div>
                             )}
                          </div>
                          
                          <div className="space-y-3">
                            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-[0.9]">
                              {artist.is_artist_of_month ? (
                                <>Artist Of <br/> The <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Month.</span></>
                              ) : (
                                <>Featured <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Talent.</span></>
                              )}
                            </h2>
                            <p className="text-slate-400 text-lg font-medium max-w-lg leading-snug h-[54px] overflow-hidden opacity-70 border-l border-sky-500/20 pl-5">
                              Check out {artist.alias || artist.name}, leading the category with exceptional performances.
                            </p>
                          </div>

                          <div className="flex items-center gap-4 pt-2">
                            <button 
                              onClick={() => { setSelectedArtist(artist); setDetailOpen(true); }}
                              className="group/btn relative rounded-full bg-white px-8 h-12 font-black text-slate-900 text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
                            >
                              <span className="relative z-10">View Profile</span>
                              <div className="relative z-10 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                                <ChevronRight size={12} />
                              </div>
                            </button>
                          </div>
                        </div>
                        
                        {/* Right Image */}
                        <div className={cn(
                          "relative group/card w-full lg:w-[380px] aspect-[4/5] transition-all duration-[1000ms]",
                          spotlightIndex === idx ? "opacity-100 scale-100" : "opacity-0 scale-95"
                        )}>
                          <div className="w-full h-full rounded-[40px] overflow-hidden bg-slate-800 border-[8px] border-white/5 relative shadow-2xl transition-all duration-700 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            {artist.artist_images?.[0]?.image_url ? (
                              <img 
                                src={artist.artist_images[0].image_url} 
                                className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000" 
                                alt=""
                              />
                            ) : (
                              <Mic2 size={60} className="text-white/5" />
                            )}
                            
                            <div className="absolute inset-x-6 bottom-6 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white">
                              <p className="text-lg font-black tracking-tight">{artist.alias || artist.name}</p>
                              <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">{artist.category}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Minimized Circular Navigation */}
            {spotlightArtists.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/5 shadow-xl">
                  <button onClick={prevSlide} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90">
                    <ChevronLeft size={14} />
                  </button>
                  <div className="flex gap-1.5 px-2">
                    {spotlightArtists.map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => emblaApi?.scrollTo(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300", 
                          (spotlightIndex % spotlightArtists.length) === i 
                            ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] scale-125" 
                            : "bg-white/20 hover:bg-white/40"
                        )} 
                      />
                    ))}
                  </div>
                  <button onClick={nextSlide} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90">
                    <ChevronRight size={14} />
                  </button>
              </div>
            )}
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const config = getIconConfig(stat.color);
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", config.bg)}>
                  <stat.icon size={20} className={config.text} />
                </div>
              </div>
              <div className="space-y-1 mt-auto">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-200" /> : stat.value}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="luxe-card p-6 border-white/40">
           <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                 <CalendarCheck size={20} strokeWidth={2.5} />
               </div>
               <div>
                 <h3 className="font-black text-slate-900 text-lg">Inquiries & Bookings</h3>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client requests & manual entries</p>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-200/50 hover:bg-sky-600 transition-all hover:scale-110"
                title="Quick Manual Booking"
               >
                 <Plus size={16} strokeWidth={3} />
               </button>
               <Link 
                 href="/dashboard/bookings" 
                 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:text-sky-600 transition-colors"
               >
                 View All
               </Link>
             </div>
           </div>
           
           <div className="space-y-4">
             {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-50 animate-pulse" />
                ))
             ) : recentBookings.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-bold uppercase text-[11px] tracking-widest bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  No pending requests
                </div>
             ) : (
                recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-sky-200 hover:shadow-md transition-all cursor-default group">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors border border-slate-100 shadow-sm font-black text-[13px] flex-shrink-0">
                        {b.artists?.name?.[0] || 'A'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-[13px] truncate">{b.artists?.name}</p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {b.artists?.is_trending && (
                              <Star size={11} className="text-amber-500" fill="currentColor" />
                            )}
                            {b.artists?.is_artist_of_month && (
                              <Music size={11} className="text-indigo-600" />
                            )}
                          </div>
                          {b.status === 'confirmed' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="text-slate-400">by</span> {b.client_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <span className={cn(
                          "inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider mb-1",
                          b.status === 'confirmed' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                          b.status === 'pending' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          "bg-slate-50 text-slate-500 border border-slate-100"
                        )}>
                          {b.status}
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 tabular-nums">
                          {b.event_date ? new Date(b.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'TBD'}
                        </p>
                      </div>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); window.location.href = `/dashboard/bookings?id=${b.id}`; }}
                        className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 border border-slate-100 transition-all flex items-center justify-center"
                        title="Manage Booking"
                      >
                        <CalendarCheck size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))
             )}
           </div>
        </div>

        <div className="luxe-card p-6 border-white/40">
           <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                 <Mic2 size={20} strokeWidth={2.5} />
               </div>
               <div>
                 <h3 className="font-black text-slate-900 text-lg">Quick View</h3>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recently registered artists</p>
               </div>
             </div>
             <Link 
               href="/dashboard/artists" 
               className="text-[11px] font-black text-sky-600 uppercase tracking-widest hover:text-indigo-600 transition-colors"
             >
               Explore
             </Link>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-3">
             {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-slate-50 animate-pulse" />
                ))
             ) : (
                recentArtists.map((a) => (
                  <div 
                    key={a.id} 
                    onClick={() => { setSelectedArtist(a); setDetailOpen(true); }}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/50 cursor-pointer"
                  >
                    {a.artist_images?.[0]?.image_url ? (
                      <img src={a.artist_images[0].image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-sky-600 text-white font-black text-sm">
                        {a.name?.[0]}
                      </div>
                    )}
                    <div className="absolute top-1.5 right-1.5 z-10 flex flex-col gap-1 items-end">
                      {a.is_trending && (
                        <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-lg border border-white/20">
                          <Star size={10} fill="currentColor" />
                        </div>
                      )}
                      {a.is_artist_of_month && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg border border-white/20">
                          <Music size={10} />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                      <p className="text-[9px] font-black text-white truncate">{a.name}</p>
                      <p className="text-[8px] font-bold text-sky-300 uppercase leading-none">{a.category}</p>
                    </div>
                  </div>
                ))
             )}
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
          <div className="section-header">
            <span className="section-label">Discover</span>
            <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">Browse Artists</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Discover and explore all registered talent profiles.</p>
          </div>
          <Link href="/dashboard/browse" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 transition-colors">
            Full View <ChevronRight size={14} />
          </Link>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, alias, category, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 h-12 rounded-xl text-[13.5px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm bg-white border border-slate-200 text-slate-900"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              onClick={clearFilters}
              className={cn(
                "px-4 py-2 rounded-[10px] text-[12px] font-semibold transition-all whitespace-nowrap",
                !selectedCategory
                  ? "bg-sky-600 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:text-sky-600"
              )}
            >
              All
            </button>
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const Icon = cat.icon;
              return (
                <button
                  key={key}
                  onClick={() => { setSelectedCategory(key); setSelectedSubCategories([]); }}
                  className={cn(
                    "px-4 py-2 rounded-[10px] text-[12px] font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
                    selectedCategory === key
                      ? "bg-sky-600 text-white shadow-md"
                      : "bg-white text-slate-600 border border-slate-200 hover:text-sky-600"
                  )}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {selectedCategory && subCategories.length > 0 && (
            <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap mr-2">Sub-type:</span>
              {subCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    const current = selectedSubCategories;
                    if (current.includes(sub)) {
                      setSelectedSubCategories(current.filter(s => s !== sub));
                    } else {
                      setSelectedSubCategories([...current, sub]);
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-[8px] text-[11px] font-semibold transition-all whitespace-nowrap",
                    selectedSubCategories.includes(sub)
                      ? "bg-slate-900 text-white border border-slate-900"
                      : "bg-slate-50 text-slate-600 border border-slate-200"
                  )}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-[13px] text-slate-500">
          <span className="font-semibold">{filteredArtists.length}</span> artists found
          {(selectedCategory || selectedSubCategories.length > 0 || searchQuery) && (
            <button onClick={clearFilters} className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-sky-600 hover:underline">
              Clear all filters
            </button>
          )}
        </div>

        {browseLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center shadow-sm">
              <Loader2 className="animate-spin text-white h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-slate-400">Loading artists...</span>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-50">
            <Mic2 size={40} className="text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No artists match your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedArtists.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => { setSelectedArtist(artist); setDetailOpen(true); }}
                  className="group cursor-pointer premium-card overflow-hidden bg-white border border-slate-100 hover:border-sky-200 hover:shadow-luxe transition-all duration-500"
                >
                  <div className="h-56 relative overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/30">
                    {artist.artist_images?.[0]?.image_url ? (
                      <img
                        src={artist.artist_images[0].image_url}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-[22px] bg-white flex items-center justify-center text-2xl font-black shadow-sm text-sky-600 border border-slate-100">
                          {artist.name?.[0] || <Mic2 size={24} />}
                        </div>
                      </div>
                    )}
                    

                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                       <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-sky-600 scale-75 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                          <Eye size={20} strokeWidth={2.5} />
                       </div>
                    </div>

                    {artist.artist_images?.length > 0 && (
                      <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black text-white bg-black/60 border border-white/10">
                        <ImageIcon size={11}  />
                        {artist.artist_images.length}
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                      {artist.is_trending ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-200/50">
                          <Star size={10} fill="currentColor" />
                          Popular
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-600 border border-slate-200 text-[9px] font-black uppercase tracking-widest shadow-sm">
                          <User size={10} />
                          Standard
                        </div>
                      )}

                      {artist.is_artist_of_month && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200/50">
                          <Music size={10} />
                          Artist Of Month
                        </div>
                      )}
                    </div>

                    {artist.video_url && (
                      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white bg-rose-500/90 shadow-lg shadow-rose-200/50">
                        <PlayCircle size={12} />
                      </div>
                    )}
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleShare(artist.id); }}
                      className="absolute bottom-4 right-4 w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-600 hover:text-sky-600 shadow-luxe-soft transition-all active:scale-90"
                      title="Share Profile"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-semibold text-[15px] leading-tight text-slate-900 group-hover:text-sky-600 transition-colors">{artist.name}</h3>
                      {artist.alias && (
                        <p className="text-[12px] font-medium mt-0.5 text-sky-600">@{artist.alias}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge badge-primary text-[10px]">
                        {artist.category}
                      </span>
                      {artist.sub_category && (
                        <span className="badge badge-neutral text-[10px]">
                          {artist.sub_category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
                        {artist.city && (
                          <>
                            <MapPin size={12} />
                            <span>{artist.city}</span>
                          </>
                        )}
                      </div>
                      {artist.price_range && (
                        <div className="flex items-center gap-1 text-[12px] font-bold text-slate-900">
                          <IndianRupee size={12} />
                          {artist.price_range}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-sky-600 hover:text-sky-600 transition-all shadow-sm"
                >
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>
                <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center h-10">
                  <p className="text-[13px] font-bold text-slate-900">Page <span className="text-sky-600">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span></p>
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-sky-600 hover:text-sky-600 transition-all shadow-sm"
                >
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="section-header">
              <span className="section-label">Live Updates</span>
              <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">Recent Talent</h2>
            </div>
            <Link href="/dashboard/artists" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 hover:text-sky-700 transition-colors">
              Full Registry <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="luxe-card p-2">
             {loading ? (
               <div className="flex flex-col items-center justify-center py-24 gap-4">
                 <Loader2 className="animate-spin text-indigo-400 h-8 w-8" strokeWidth={2.5} />
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hydrating data...</p>
               </div>
             ) : recentArtists.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
                 <BarChart3 size={40} className="text-slate-300" />
                 <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No recent data</p>
               </div>
             ) : (
               <div className="divide-y divide-slate-50">
                 {recentArtists.map((artist) => (
                   <div 
                     key={artist.id} 
                     onClick={() => { setSelectedArtist(artist); setDetailOpen(true); }}
                     className="p-4 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer"
                   >
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors relative">
                        {artist.artist_images?.[0]?.image_url && (
                          <img 
                            src={artist.artist_images[0].image_url} 
                            alt="" 
                            className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-0 transition-opacity duration-300"
                            onLoad={(e) => (e.target as HTMLImageElement).style.opacity = '1'}
                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                          />
                        )}
                         <Mic2 size={18} />
                       </div>
                       <div className="flex flex-col">
                                                   <div className="flex items-center gap-2">
                             <span className="text-[15px] font-bold text-slate-900 tracking-tight">{artist.name}</span>
                             <div className="flex items-center gap-1.5 flex-shrink-0">
                               {artist.is_trending && <Star size={11} className="text-amber-500" fill="currentColor" />}
                               {artist.is_artist_of_month && <Music size={11} className="text-indigo-600" />}
                             </div>
                          </div>

                         <div className="flex items-center gap-2">
                           <span className="text-[12px] font-bold text-slate-400">{artist.category}</span>
                           {artist.video_url && <PlayCircle size={10} className="text-rose-500" />}
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                          <span className="text-[13px] font-bold text-slate-900">{artist.performing_language || 'English'}</span>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {artist.created_at ? formatDistanceToNow(new Date(artist.created_at), { addSuffix: true }) : 'just now'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleShare(artist.id); }}
                             className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                             title="Share Profile"
                           >
                             <Share2 size={14} />
                           </button>
                           <ChevronRight size={16} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="section-header px-1">
            <span className="section-label">Shortcuts</span>
            <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">System Controls</h2>
          </div>
          <div className="bg-white rounded-[28px] p-8 space-y-7 shadow-sm border border-slate-100">
            <div className="space-y-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-sky-50 hover:border-sky-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shadow-sm">
                    <Plus size={18} strokeWidth={3} />
                  </div>
                  <span className="text-[13px] font-bold text-slate-700 uppercase tracking-widest">Add New Artist</span>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" strokeWidth={3} />
              </button>

              {(userRole === 'super_admin' || userRole === 'admin') && (
                <Link 
                  href="/dashboard/admins"
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-emerald-50 hover:border-emerald-100 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                      <UserPlus size={18} strokeWidth={3} />
                    </div>
                    <span className="text-[13px] font-bold text-slate-700 uppercase tracking-widest">Manage Team</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" strokeWidth={3} />
                </Link>
              )}

              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                    <BarChart3 size={18} strokeWidth={3} />
                  </div>
                  <span className="text-[13px] font-bold text-slate-700 uppercase tracking-widest">Manual Booking</span>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] lg:max-w-[90vw] p-0 overflow-hidden border-none bg-transparent shadow-none">
          <DialogTitle className="sr-only">Artist Details - {selectedArtist?.name}</DialogTitle>
          <DialogDescription className="sr-only">Comprehensive overview and statistics for {selectedArtist?.name}</DialogDescription>
          <div
            className="bg-white rounded-[24px] w-full max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-300"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
          >
            <div className="relative h-[320px] overflow-hidden bg-slate-900 flex items-center justify-center">
              {selectedArtist?.artist_images?.[0]?.image_url && (
                <div 
                  className="absolute inset-0 opacity-30 scale-125"
                  style={{ 
                    backgroundImage: `url(${selectedArtist.artist_images[0].image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              )}
              {selectedArtist?.artist_images?.[0]?.image_url ? (
                <img
                  src={selectedArtist.artist_images[0].image_url}
                  alt={selectedArtist.name}
                  className="relative z-10 w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <div className="w-20 h-20 rounded-[20px] bg-white flex items-center justify-center text-3xl font-bold shadow-card border border-slate-100 text-sky-600">
                    {selectedArtist?.name?.[0] || <Mic2 size={32} />}
                  </div>
                </div>
              )}
              <div className="absolute top-5 left-5 inline-flex flex-col gap-2 items-start z-20">
                {selectedArtist?.is_trending && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-200/50">
                    <Star size={10} fill="currentColor" />
                    Popular Artist
                  </div>
                )}
                {selectedArtist?.is_artist_of_month && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200/50 animate-in slide-in-from-left-2 duration-500">
                    <Music size={10} />
                    Artist of Month
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {selectedArtist && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 line-clamp-2">{selectedArtist.name}</h2>
                      {selectedArtist.alias && (
                        <p className="text-[15px] font-bold text-sky-600 mt-1">@{selectedArtist.alias}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-sky-50 text-sky-600 border border-sky-100">
                          {selectedArtist.category}
                        </span>
                        {selectedArtist.sub_category && (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200">
                            {selectedArtist.sub_category}
                          </span>
                        )}
                        {selectedArtist.performing_language && (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 gap-1.5">
                            <Globe size={11} />
                            {selectedArtist.performing_language}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/*  */}
                  <div className="space-y-4">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 border-l-2 border-amber-400 pl-3">Performance & Stats</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-4 rounded-xl space-y-2 bg-slate-50/50 border border-slate-100 group hover:border-amber-100 transition-colors">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Rating & Trust</p>
                        <p className="text-[12px] font-bold flex items-center gap-1.5 text-slate-900">
                          <Star size={12} className="text-amber-500" fill="currentColor" />
                          {selectedArtist.rating || '4.5'}/5
                        </p>
                      </div>
                      <div className="p-4 rounded-xl space-y-2 bg-slate-50/50 border border-slate-100 group hover:border-sky-100 transition-colors">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Successful Shows</p>
                        <p className="text-[12px] font-bold flex items-center gap-1.5 text-slate-900">
                          <Plus size={12} className="text-sky-600" />
                          {selectedArtist.successful_bookings || '50'}+ Bookings
                        </p>
                      </div>
                      <div className="p-4 rounded-xl space-y-2 bg-slate-50/50 border border-slate-100 group hover:border-indigo-100 transition-colors">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Band Size</p>
                        <p className="text-[12px] font-bold flex items-center gap-1.5 text-slate-900">
                          <Users size={12} className="text-indigo-600" />
                          {selectedArtist.members_min ? `${selectedArtist.members_min}${selectedArtist.members_max ? ` - ${selectedArtist.members_max}` : ''} Member(s)` : 'Solo Performance'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl space-y-2 bg-slate-50/50 border border-slate-100 group hover:border-rose-100 transition-colors">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Typical Set</p>
                        <p className="text-[12px] font-bold flex items-center gap-1.5 text-slate-900">
                          <PlayCircle size={12} className="text-rose-600" />
                          {selectedArtist.performance_duration || '90-120'} Mins
                        </p>
                      </div>
                    </div>
                  </div>

                  {/*  */}
                  <div className="space-y-4">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 border-l-2 border-sky-400 pl-3">Location & Booking</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl space-y-2 bg-slate-50/50 border border-slate-100 group hover:border-sky-100 transition-colors">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Base Location</p>
                        <p className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5 underline underline-offset-4 decoration-sky-100 decoration-2">
                           <MapPin size={12} className="text-sky-600" />
                           {selectedArtist.city}, {selectedArtist.state}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl space-y-2 bg-slate-50/50 border border-slate-100 group hover:border-sky-100 transition-colors lg:col-span-2">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Full Address & Locality</p>
                        <p className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5 truncate">
                           <MapPin size={12} className="text-slate-300" />
                           {selectedArtist.locality ? `${selectedArtist.locality}, ` : ''}{selectedArtist.address || 'Address on file'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl space-y-2 bg-white border border-sky-200 group hover:shadow-md transition-all sm:col-span-2 lg:col-span-1 shadow-sm">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-sky-600">Investment Range</p>
                        <p className="text-[15px] font-black flex items-center gap-1.5 text-slate-900">
                          <IndianRupee size={16} className="text-sky-600" />
                          {selectedArtist.price_min ? (
                            `₹${Math.min(Number(selectedArtist.price_min), Number(selectedArtist.price_max || selectedArtist.price_min)).toLocaleString()} - ₹${Math.max(Number(selectedArtist.price_min), Number(selectedArtist.price_max || selectedArtist.price_min)).toLocaleString()}`
                          ) : (selectedArtist.price_range || 'Contact')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/*  */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-l-2 border-emerald-400 pl-3">Management & Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl space-y-2 bg-slate-50/50 border border-slate-100 group hover:border-emerald-100 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Primary Contact</p>
                        <p className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                           <UserPlus size={14} className="text-emerald-600" />
                           {selectedArtist.contact_person}
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl space-y-2 bg-slate-50/50 border border-slate-100 group hover:border-emerald-100 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">WhatsApp / Phone</p>
                        <p className="text-[14px] font-bold text-slate-900 flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                           <Phone size={14} className="text-emerald-600" />
                           {selectedArtist.phone_no} {selectedArtist.phone_no_alt && <span className="text-slate-500 font-medium">/ {selectedArtist.phone_no_alt}</span>}
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl space-y-2 bg-slate-50/50 border border-slate-100 group hover:border-emerald-100 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Business Email</p>
                        <p className="text-[14px] font-bold text-slate-900 flex items-center gap-2 truncate hover:text-emerald-600 transition-colors">
                           <Mail size={14} className="text-emerald-600" />
                           {selectedArtist.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedArtist.bio && (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-l-2 border-slate-300 pl-3">The Narrative</h3>
                      <p className="text-[14px] leading-relaxed p-8 rounded-[32px] text-slate-600 bg-slate-50/80 border border-slate-200/50 relative overflow-hidden shadow-sm">
                        <span className="absolute top-4 left-4 text-4xl text-slate-100 font-serif opacity-50">"</span>
                        {selectedArtist.bio}
                      </p>
                    </div>
                  )}

                  {selectedArtist.video_url && (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <PlayCircle size={14} className="text-sky-600" />
                        Video Showcase
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedArtist.video_url.split(',').map((url: string, i: number) => {
                          const vId = getYoutubeId(url.trim());
                          if (!vId) return null;
                          return (
                            <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-luxe bg-slate-900">
                              <iframe
                                className="absolute inset-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${vId}`}
                                title={`${selectedArtist.name} Performance Video ${i+1}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedArtist.artist_images?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <ImageIcon size={14} className="text-sky-600"  />
                        Gallery ({selectedArtist.artist_images.length} photos)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedArtist.artist_images.map((img: any, i: number) => (
                          <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group transition-transform hover:scale-[1.02] duration-300">
                            <img
                              src={img.image_url}
                              alt={`${selectedArtist.name} photo ${i + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://via.placeholder.com/400?text=Invalid+Image+URL`;
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="h-9 px-5 rounded-[10px] bg-white/40 backdrop-blur-md border border-white shadow-sm hover:shadow-md hover:bg-white/60 hover:border-sky-300 transition-all text-slate-700 font-bold text-[11px] uppercase tracking-wider flex items-center gap-2"
                    >
                      <Plus size={13} strokeWidth={2.5} className="text-sky-500" />
                      Book Now
                    </button>
                    <button
                      onClick={() => handleShare(selectedArtist.id)}
                      className="h-9 px-5 rounded-[10px] text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2 transition-all bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-600 hover:text-white"
                    >
                      <Share2 size={13} />
                      Share Profile
                    </button>
                    <button
                      onClick={() => {
                        setEditingArtist(selectedArtist);
                        setIsModalOpen(true);
                      }}
                      className="h-9 px-5 rounded-[10px] text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2 transition-all bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-600 hover:text-white"
                    >
                      <PencilLine size={13} />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => handleDeleteArtist(selectedArtist.id, selectedArtist.name)}
                      className="h-9 px-5 rounded-[10px] text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2 transition-all"
                      style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: '1px solid #FECDD3' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = '#FECDD3'; }}
                    >
                      <Trash2 size={13} />
                      Delete Artist
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
