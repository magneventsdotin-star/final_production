"use client";
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, Mic2, Star, MapPin,
  ChevronLeft, ChevronRight, Globe,
  Image as ImageIcon, IndianRupee, Trash2, Eye, Share2, PlayCircle, User, Mail, Phone, Music, Pencil
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArtistFilters, ArtistFilterState, INITIAL_FILTER_STATE } from '@/components/artists/ArtistFilters';
import { ManualBookingModal } from '@/components/bookings/ManualBookingModal';
import { CreateArtistModal } from '@/components/artists/CreateArtistModal';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

function BrowseArtistsContent() {
  const { confirmAction } = useConfirm();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [filteredArtists, setFilteredArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string, canViewAll: boolean } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase.from('profiles').select('role, can_view_all_artists').eq('id', session.user.id).single();
          const isSuperAdmin = data?.role === 'super_admin' || session.user.email?.toLowerCase() === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL?.toLowerCase();
          setCurrentUser({ id: session.user.id, canViewAll: !!(isSuperAdmin || data?.can_view_all_artists) });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, []);
  const [filters, setFilters] = useState<ArtistFilterState>({
    ...INITIAL_FILTER_STATE,
    search: initialSearch
  });
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const ITEMS_PER_PAGE = 9;
  const { toast } = useToast();

  useEffect(() => {
    if (detailOpen) {
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
  }, [detailOpen]);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search !== null && search !== filters.search) {
      setFilters(prev => ({ ...prev, search }));
    }
  }, [searchParams]);

  const fetchArtists = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let query = (supabase
        .from('artists') as any)
        .select('*, artist_images!fk_artist_id(image_url)');

      if (!currentUser.canViewAll) {
        query = query.eq('created_by', currentUser.id);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,alias.ilike.%${filters.search}%,category.ilike.%${filters.search}%,sub_category.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }

      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.subcategories && filters.subcategories.length > 0) {
        const orClauses = filters.subcategories.map(sub => `sub_category.ilike.%${sub}%`).join(',');
        query = query.or(orClauses);
      }

      if (filters.languages && filters.languages.length > 0) {
        // Intersection Type Filter: Artist must satisfy ALL selected languages
        filters.languages.forEach(lang => {
          query = query.ilike('performing_language', `%${lang}%`);
        });
      }

      if (filters.state !== 'all') query = query.eq('state', filters.state);
      if (filters.city !== 'all') query = query.eq('city', filters.city);
      
      // Strict Budget Satisfaction Logic: 
      // Show artist if: artist.price_min <= user_budget <= artist.price_max
      if (filters.budget) {
        const userBudget = parseInt(filters.budget);
        query = query.lte('price_min', userBudget);
        query = query.gte('price_max', userBudget);
      }
      
      // Strict Member Satisfaction Logic:
      // Show artist if: artist.members_min <= user_count <= artist.members_max
      if (filters.memberCount) {
        const userCount = parseInt(filters.memberCount);
        query = query.lte('members_min', userCount);
        query = query.gte('members_max', userCount);
      }

      if (filters.isStandard) {
        query = query.eq('is_trending', false).eq('is_artist_of_month', false);
      }
      if (filters.isPopular) query = query.eq('is_trending', true);
      if (filters.isArtistOfMonth) query = query.eq('is_artist_of_month', true);

      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;
      setFilteredArtists(data || []);
    } catch (error: any) {
      console.error('CRITICAL: Artist Fetch Failure', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        filters
      });
      toast({
        variant: 'destructive',
        title: 'Query Failed',
        description: error.message || 'The database rejected this query.',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, currentUser, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArtists();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchArtists]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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
      fetchArtists();
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
  const openDetail = (artist: any) => {
    setSelectedArtist(artist);
    setDetailOpen(true);
  };

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="section-header flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
        <div>
          <span className="section-label">Discover</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-display">
            Browse Artists
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Discover and explore all registered talent profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsBookingModalOpen(true)}
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-400 to-sky-600 border border-sky-300 shadow-lg shadow-sky-200/50 hover:shadow-sky-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-white font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Plus size={16} strokeWidth={3} className="text-white" />
            Manual Booking
          </button>
        </div>
      </div>

      <ArtistFilters onFilterChange={setFilters} />

      <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        <span className="font-semibold">{filteredArtists.length}</span> artists found
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center shadow-sm">
            <Loader2 className="animate-spin text-white h-5 w-5" />
          </div>
          <span className="text-caption font-semibold text-slate-400">Loading artists...</span>
        </div>
      ) : filteredArtists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-50">
          <Mic2 size={40} style={{ color: 'var(--text-muted)' }} />
          <p className="text-body">No artists match your filters.</p>
          <Button 
            variant="ghost" 
            className="text-xs font-bold uppercase tracking-widest hover:bg-slate-50"
            onClick={() => { setFilters(INITIAL_FILTER_STATE); }}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedArtists.map((artist, idx) => (
              <div
                key={artist.id}
                onClick={() => openDetail(artist)}
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
                      <div className="w-16 h-16 rounded-[22px] bg-white flex items-center justify-center text-2xl font-black shadow-card text-sky-600 border border-slate-100">
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
                      <ImageIcon size={11} />
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
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200/50 animate-in slide-in-from-left-2 duration-500">
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
                    <h3 className="font-semibold text-[15px] leading-tight group-hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--text-primary)' }}>{artist.name}</h3>
                    {artist.alias && (
                      <p className="text-[12px] font-medium mt-0.5" style={{ color: 'var(--color-primary)' }}>@{artist.alias}</p>
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
                  <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-default)' }}>
                    <div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
                      {artist.city && (
                        <>
                          <MapPin size={12} />
                          <span>{artist.city}</span>
                        </>
                      )}
                    </div>
                    {artist.price_range && (
                      <div className="flex items-center gap-1 text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>
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
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary h-9 px-4 text-[12px] font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-9 h-9 rounded-[8px] text-[12px] font-bold transition-all",
                    currentPage === page ? "text-white" : "text-[var(--text-secondary)]"
                  )}
                  style={currentPage === page ? {
                    background: 'var(--color-primary-gradient)',
                    boxShadow: 'var(--shadow-button)',
                  } : {
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary h-9 px-4 text-[12px] font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] lg:max-w-[90vw] p-0 overflow-hidden border-none bg-transparent shadow-none">
          <DialogTitle className="sr-only">Artist Details - {selectedArtist?.name}</DialogTitle>
          <DialogDescription className="sr-only">Detailed profile and gallery for {selectedArtist?.name}</DialogDescription>
          <div
            className="bg-white rounded-[24px] w-full max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-300 relative"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
          >
            <div className="relative h-[320px] overflow-hidden bg-slate-900 flex items-center justify-center">
              {selectedArtist?.artist_images?.[0]?.image_url && (
                <img
                  src={selectedArtist.artist_images[0].image_url}
                  alt={selectedArtist.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
                />
              )}
              {selectedArtist?.artist_images?.[0]?.image_url ? (
                <img
                  src={selectedArtist.artist_images[0].image_url}
                  alt={selectedArtist.name}
                  className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <div className="w-20 h-20 rounded-[16px] bg-white flex items-center justify-center text-3xl font-bold shadow-card" style={{ color: 'var(--color-primary)', border: '1px solid var(--border-default)' }}>
                    {selectedArtist?.name?.[0] || <Mic2 size={26} />}
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 items-start">
                {selectedArtist?.is_trending && (
                  <div className="px-3 py-1.5 rounded-full bg-amber-400 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-amber-300/50 shadow-lg shadow-amber-900/10">
                    <Star size={12} fill="white" />
                    Popular Artist
                  </div>
                )}
                {selectedArtist?.is_artist_of_month && (
                  <div className="px-3 py-1.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-indigo-500/50 shadow-lg shadow-indigo-900/10 animate-in slide-in-from-left-2 duration-500">
                    <Music size={12} />
                    Artist of Month
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 space-y-4">
              {selectedArtist && (
                <>
                  <div>
                    <h2 className="text-display mb-1" style={{ fontSize: '24px' }}>{selectedArtist.name}</h2>
                    {selectedArtist.alias && (
                      <p className="text-[13px] font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>@{selectedArtist.alias}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-primary text-[11px] px-3 py-1.5">
                        {selectedArtist.category}
                      </span>
                      {selectedArtist.sub_category && (
                        <span className="badge badge-neutral text-[11px] px-3 py-1.5">
                          {selectedArtist.sub_category}
                        </span>
                      )}
                      {selectedArtist.performing_language && (
                        <span className="badge badge-success text-[11px] px-3 py-1.5">
                          <Globe size={11} />
                          {selectedArtist.performing_language}
                        </span>
                      )}
                    </div>
                  </div>
                  {/**/}
                  <div className="space-y-2.5">
                    <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 border-l-[2px] border-amber-400 pl-2.5">Performance & Stats</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl space-y-1 bg-slate-50/50 border border-slate-100 group hover:border-amber-200 hover:bg-white transition-all">
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Rating & Trust</p>
                        <p className="text-[12px] font-bold flex items-center gap-1.5 text-slate-900">
                          <Star size={12} className="text-amber-500" fill="currentColor" />
                          {selectedArtist.rating || '4.5'}/5
                        </p>
                      </div>
                      <div className="p-3 rounded-xl space-y-1 bg-slate-50/50 border border-slate-100 group hover:border-sky-200 hover:bg-white transition-all">
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Successful Shows</p>
                        <p className="text-[12px] font-bold flex items-center gap-1.5 text-slate-900">
                          <Plus size={12} className="text-sky-600" />
                          {selectedArtist.successful_bookings || '50'}+ Bookings
                        </p>
                      </div>
                      <div className="p-3 rounded-xl space-y-1 bg-slate-50/50 border border-slate-100 group hover:border-indigo-200 hover:bg-white transition-all">
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Band Size</p>
                        <p className="text-[12px] font-bold flex items-center gap-1.5 text-slate-900">
                          <User size={12} className="text-indigo-600" />
                          {selectedArtist.members_min ? `${selectedArtist.members_min}${selectedArtist.members_max ? ` - ${selectedArtist.members_max}` : ''} Members` : 'Solo Artist'}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl space-y-1 bg-slate-50/50 border border-slate-100 group hover:border-rose-200 hover:bg-white transition-all">
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Typical Set</p>
                        <p className="text-[12px] font-bold flex items-center gap-1.5 text-slate-900">
                          <PlayCircle size={12} className="text-rose-600" />
                          {selectedArtist.performance_duration || '90-120'} Mins
                        </p>
                      </div>
                    </div>
                  </div>

                  {/*  */}
                  <div className="space-y-3">
                    <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 border-l-[2px] border-sky-400 pl-3">Location & Booking</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl space-y-1 bg-slate-50/50 border border-slate-100 group hover:border-sky-200 hover:bg-white transition-all">
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Base Location</p>
                        <p className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5 underline underline-offset-4 decoration-sky-100/50 decoration-2">
                           <MapPin size={12} className="text-sky-600" />
                           {selectedArtist.city}, {selectedArtist.state}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl space-y-1 bg-slate-50/50 border border-slate-100 group hover:border-sky-200 hover:bg-white transition-all lg:col-span-2">
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Full Address & Locality</p>
                        <p className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5 truncate">
                           <MapPin size={12} className="text-slate-300" />
                           {selectedArtist.locality ? `${selectedArtist.locality}, ` : ''}{selectedArtist.address || 'Address on file'}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl space-y-1 bg-gradient-to-br from-sky-50 to-white border border-sky-100 group hover:shadow-sm hover:border-sky-200 transition-all sm:col-span-2 lg:col-span-1">
                        <p className="text-[8px] font-black uppercase tracking-wider text-sky-600">Investment Range</p>
                        <p className="text-[14px] font-black flex items-center gap-1.5 text-slate-900">
                          <IndianRupee size={14} className="text-sky-600" />
                          {selectedArtist.price_min ? (
                            `₹${Math.min(Number(selectedArtist.price_min), Number(selectedArtist.price_max || selectedArtist.price_min)).toLocaleString()} - ₹${Math.max(Number(selectedArtist.price_min), Number(selectedArtist.price_max || selectedArtist.price_min)).toLocaleString()}`
                          ) : (selectedArtist.price_range || 'Contact')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* */}
                  <div className="space-y-3">
                    <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 border-l-[2px] border-emerald-400 pl-3">Management & Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl space-y-1 bg-slate-50/50 border border-slate-100 group hover:border-emerald-200 hover:bg-white transition-all">
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Primary Contact</p>
                        <p className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5">
                           <User size={12} className="text-emerald-600" />
                           {selectedArtist.contact_person}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl space-y-1 bg-slate-50/50 border border-slate-100 group hover:border-emerald-200 hover:bg-white transition-all">
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">WhatsApp / Phone</p>
                        <p className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors">
                           <Phone size={12} className="text-emerald-600" />
                           {selectedArtist.phone_no} {selectedArtist.phone_no_alt && <span className="text-slate-500 font-medium text-[10px]">/ {selectedArtist.phone_no_alt}</span>}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl space-y-1 bg-slate-50/50 border border-slate-100 group hover:border-emerald-200 hover:bg-white transition-all">
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Business Email</p>
                        <p className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5 truncate hover:text-emerald-600 transition-colors">
                           <Mail size={12} className="text-emerald-600" />
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
                        <ImageIcon size={14} className="text-sky-600" />
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
                        setIsEditModalOpen(true);
                      }}
                      className="h-9 px-5 rounded-[10px] text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2 transition-all bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-600 hover:text-white"
                    >
                      <Pencil size={13} />
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

      <ManualBookingModal 
        open={isBookingModalOpen} 
        onOpenChange={setIsBookingModalOpen}
        initialArtistId={selectedArtist?.id}
      />
      <CreateArtistModal
        key={editingArtist?.id || 'edit-browse'}
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setTimeout(() => setEditingArtist(null), 200);
        }}
        onSuccess={() => {
          fetchArtists();
          setDetailOpen(false); // Optionally close details, or keep it open and re-fetch to show new details
        }}
        initialData={editingArtist}
      />
    </div>
  );
}
export default function BrowseArtists() {
  const { confirmAction } = useConfirm();
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center shadow-sm">
          <Loader2 className="animate-spin text-white h-5 w-5" />
        </div>
        <span className="text-caption font-semibold text-slate-400">Initializing...</span>
      </div>
    }>
      <BrowseArtistsContent />
    </Suspense>
  );
}
