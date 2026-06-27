"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArtistFilters, ArtistFilterState, INITIAL_FILTER_STATE } from '@/components/artists/ArtistFilters';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Loader2, Mic2, Star, Info, ChevronLeft, ChevronRight, Pencil, Eye, Trash2, Image as ImageIcon, Share2, PlayCircle, MapPin, Music, User, ChevronDown, Layers } from 'lucide-react';
import { CreateArtistModal } from '@/components/artists/CreateArtistModal';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function ArtistManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<any>(null);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ArtistFilterState>(INITIAL_FILTER_STATE);
  const [activeTab, setActiveTab] = useState<'all' | 'original' | 'duplicate'>('all');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;
  const { toast } = useToast();
  const router = useRouter();

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

  const { originalArtists, duplicateGroups } = useMemo(() => {
    const groups = new Map<string, any[]>();
    const original: any[] = [];
    const duplicates: any[][] = [];

    artists.forEach(artist => {
      const phone = artist.phone_no;
      if (!phone) {
        original.push(artist);
      } else {
        if (!groups.has(phone)) groups.set(phone, []);
        groups.get(phone)!.push(artist);
      }
    });

    groups.forEach(group => {
      if (group.length === 1) {
        original.push(group[0]);
      } else {
        duplicates.push(group);
      }
    });

    return { originalArtists: original, duplicateGroups: duplicates };
  }, [artists]);

  const currentList = activeTab === 'all' ? artists : activeTab === 'original' ? originalArtists : duplicateGroups;
  const totalPages = Math.max(1, Math.ceil(currentList.length / ITEMS_PER_PAGE));

  const fetchArtists = useCallback(async (showLoading = true) => {
    if (!currentUser) return;
    if (showLoading) setLoading(true);
    try {
      let query = (supabase
        .from('artists') as any)
        .select('*, artist_images!fk_artist_id(image_url)', { count: 'exact' });
        
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
        filters.languages.forEach(lang => {
          query = query.ilike('performing_language', `%${lang}%`);
        });
      }
      if (filters.state !== 'all') query = query.eq('state', filters.state);
      if (filters.city !== 'all') query = query.eq('city', filters.city);

      if (filters.budget) {
        const budgetVal = parseInt(filters.budget);
        query = query.lte('price_min', budgetVal).gte('price_max', budgetVal);
      }

      if (filters.memberCount) {
        const mCount = parseInt(filters.memberCount);
        query = query.lte('members_min', mCount).gte('members_max', mCount);
      }

      if (filters.isStandard) {
        query = query.eq('is_trending', false).eq('is_artist_of_month', false);
      }
      if (filters.isPopular) {
        query = query.eq('is_trending', true);
      }
      if (filters.isArtistOfMonth) {
        query = query.eq('is_artist_of_month', true);
      }
      const { data, count, error } = await query
        .order('name', { ascending: true });
      if (error) throw error;
      setArtists(data || []);
      setTotalCount(count || 0);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  }, [filters, currentUser]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    if (isModalOpen) {
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
  }, [isModalOpen]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will also remove all their images.`)) return;
    try {
      await (supabase.from('artist_images') as any).delete().eq('artist_id', id);
      const { error } = await (supabase.from('artists') as any).delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: `${name} has been removed from the registry.` });
      fetchArtists();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete artist.' });
    }
  };

  const handleToggleArtistOfMonth = async (artist: any) => {
    try {
      if (artist.is_artist_of_month) {
        // Toggle off
        const { error } = await (supabase.from('artists') as any)
          .update({ is_artist_of_month: false })
          .eq('id', artist.id);
        if (error) throw error;
        toast({ title: 'Updated', description: `${artist.name} is no longer the Artist of the Month.` });
      } else {
        // Toggle on: first turn off all others
        const { data: currentAOMs } = await (supabase.from('artists') as any)
          .select('id')
          .eq('is_artist_of_month', true);
        
        if (currentAOMs && currentAOMs.length > 0) {
          const idsToTurnOff = currentAOMs.map((a: any) => a.id).filter((id: string) => id !== artist.id);
          if (idsToTurnOff.length > 0) {
            const { error: error1 } = await (supabase.from('artists') as any)
              .update({ is_artist_of_month: false })
              .in('id', idsToTurnOff);
            if (error1) throw error1;
          }
        }

        // Set this one to true
        const { error: error2 } = await (supabase.from('artists') as any)
          .update({ is_artist_of_month: true })
          .eq('id', artist.id);
        if (error2) throw error2;
        
        toast({ title: 'Updated', description: `${artist.name} is now the Artist of the Month.` });
      }
      fetchArtists(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to update artist of the month.' });
    }
  };

  const handleViewDetails = (artistName: string) => {
    router.push(`/dashboard/browse?search=${encodeURIComponent(artistName)}`);
  };
  const handleShare = (artistId: string) => {
    const url = `${window.location.origin}/share/${artistId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied",
        description: "Profile link has been copied to your clipboard.",
      });
    }).catch(() => {
      window.open(url, '_blank');
    });
    window.open(url, '_blank');
  };
  const handleEditArtist = (artist: any) => {
    setIsModalOpen(false);
    setEditingArtist(null);
    setTimeout(() => {
      setEditingArtist(artist);
      setIsModalOpen(true);
    }, 100);
  };
  const handleModalChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setTimeout(() => setEditingArtist(null), 200);
    }
  };

  const renderArtistRow = (artist: any, isChild: boolean = false) => (
    <TableRow key={artist.id} className={`group border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer ${isChild ? 'bg-amber-50/40' : ''}`} onClick={() => handleEditArtist(artist)}>
      <TableCell className={`py-5 ${isChild ? 'pl-12 relative' : 'pl-8'}`}>
        {isChild && <div className="absolute left-6 top-1/2 w-4 h-px bg-amber-200" />}
        {isChild && <div className="absolute left-6 top-0 w-px h-1/2 bg-amber-200" />}
        <span className="text-[13px] font-black text-slate-900 bg-slate-100/60 px-2.5 py-1.5 rounded-lg border border-slate-200/50 whitespace-nowrap">
          #{artist.artist_no || 'TBD'}
        </span>
      </TableCell>
      <TableCell className="py-5">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0 group/img">
            {artist.artist_images?.[0]?.image_url ? (
              <div className="w-16 h-16 rounded-[20px] overflow-hidden border-2 border-white shadow-md group-hover/img:shadow-lg transition-shadow">
                <img
                  src={artist.artist_images[0].image_url}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = "w-full h-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg";
                      fallback.innerText = artist.name?.[0] || 'A';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-[20px] bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white">
                {artist.name?.[0] || <Mic2 size={24} />}
              </div>
            )}
            {artist.artist_images?.length > 1 && (
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-slate-900 text-white text-[11px] font-black rounded-xl flex items-center justify-center border-2 border-white shadow-lg z-20">
                +{artist.artist_images.length - 1}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-slate-900 text-[15px] leading-tight truncate active:text-sky-600 transition-colors cursor-pointer" title={artist.name}>{artist.name}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {artist.is_live === false ? (
                  <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md mr-1 border border-slate-200">Hidden</span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md mr-1 border border-emerald-200">Live</span>
                )}
                {artist.is_trending && <Star size={12} className="text-amber-500" fill="currentColor" />}
                {artist.is_artist_of_month && <Music size={12} className="text-indigo-600" />}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              <p className="text-[11px] font-medium text-slate-400 whitespace-nowrap">Contact: {artist.contact_person || 'N/A'}</p>
              <span className="w-1 h-1 rounded-full bg-slate-200 hidden sm:block" />
              <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-tight whitespace-nowrap group-hover:text-sky-600 transition-colors">
                <MapPin size={10} strokeWidth={3} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
                {artist.city}, {artist.state}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 pt-2 border-t border-slate-50">
              <span className="text-[11px] font-black text-slate-900/60 uppercase tracking-wider">
                @{artist.alias || 'anonymous'}
              </span>
              {artist.artist_images?.length > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 italic">
                    <ImageIcon size={11} strokeWidth={2.5} />
                    {artist.artist_images.length} Photos
                  </span>
                </>
              )}
              {artist.video_url && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1.5 active:scale-95 transition-transform">
                    <PlayCircle size={11} strokeWidth={2.5} />
                    {artist.video_url.includes(',') ? `${artist.video_url.split(',').length} Videos` : 'Video'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200/50">
          {artist.category}
        </span>
      </TableCell>
      <TableCell className="text-[14px] font-bold text-slate-600">
        {artist.performing_language || <span className="text-slate-300 italic font-medium">Any</span>}
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex flex-col items-end gap-1">
          <span className="text-[14px] font-black text-slate-900 bg-slate-100/60 px-3 py-1.5 rounded-xl border border-slate-200/50 whitespace-nowrap min-w-[80px] text-center">
            {artist.price_range || (artist.price_min && artist.price_max ? `${artist.price_min}-${artist.price_max}` : <span className="text-slate-300 font-medium">—</span>)}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex flex-col gap-1.5 items-center">
          {artist.is_artist_of_month && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200/50 shadow-sm whitespace-nowrap">
              <Music size={10} />
              Artist of Month
            </span>
          )}
          {artist.is_trending && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold bg-amber-50/50 text-amber-600 border border-amber-200/50 shadow-sm">
              <Star size={10} fill="currentColor" />
              Trending
            </span>
          )}
          {!artist.is_trending && !artist.is_artist_of_month && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 text-slate-500 border border-slate-200 shadow-sm opacity-60">
              <User size={10} />
              Standard
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="pr-8">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleToggleArtistOfMonth(artist); }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors shadow-sm relative z-10 ${
              artist.is_artist_of_month 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-white hover:border-slate-100 hover:text-slate-400' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-600 hover:text-indigo-600'
            }`}
            title={artist.is_artist_of_month ? "Remove Artist of Month" : "Make Artist of Month"}
          >
            <Music size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleEditArtist(artist); }}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-slate-100 hover:border-sky-600 hover:text-sky-600 text-slate-400 transition-colors shadow-sm relative z-10"
            title="Edit Artist"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleViewDetails(artist.name); }}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-slate-100 hover:border-sky-600 hover:text-sky-600 text-slate-400 transition-colors shadow-sm relative z-10"
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleShare(artist.id); }}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-slate-100 hover:border-indigo-600 hover:text-indigo-600 text-slate-400 transition-colors shadow-sm relative z-10"
            title="Share Profile"
          >
            <Share2 size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDelete(artist.id, artist.name); }}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-slate-100 hover:border-rose-500 hover:text-rose-500 text-slate-400 transition-colors shadow-sm relative z-10"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div className="section-header">
          <span className="section-label">Management</span>
          <h1 className="section-title text-slate-900">
            Artists Registry
          </h1>
          <p className="text-body mt-1 max-w-2xl font-medium">Manage and view all registered talent profiles.</p>
        </div>
        <button
          className="h-11 px-6 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200/50 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2"
          onClick={() => { setEditingArtist(null); setIsModalOpen(true); }}
        >
          <Plus size={16} strokeWidth={3} />
          Add Artist
        </button>
      </div>
      <CreateArtistModal
        key={editingArtist?.id || 'new'}
        open={isModalOpen}
        onOpenChange={handleModalChange}
        onSuccess={fetchArtists}
        initialData={editingArtist}
      />

      <div className="space-y-6">
        <ArtistFilters onFilterChange={setFilters} />
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit shadow-inner">
          <button 
            className={`px-8 py-3 rounded-xl text-[13px] font-black transition-all flex items-center gap-2 ${activeTab === 'all' ? 'bg-white text-slate-800 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            onClick={() => { setActiveTab('all'); setCurrentPage(1); setExpandedGroupId(null); }}
          >
            <User size={16} />
            All Profiles
            <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${activeTab === 'all' ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'}`}>{artists.length}</span>
          </button>
          <button 
            className={`px-8 py-3 rounded-xl text-[13px] font-black transition-all flex items-center gap-2 ${activeTab === 'original' ? 'bg-white text-indigo-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            onClick={() => { setActiveTab('original'); setCurrentPage(1); setExpandedGroupId(null); }}
          >
            <Mic2 size={16} />
            Original Profiles 
            <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${activeTab === 'original' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>{originalArtists.length}</span>
          </button>
          <button 
            className={`px-8 py-3 rounded-xl text-[13px] font-black transition-all flex items-center gap-2 ${activeTab === 'duplicate' ? 'bg-white text-rose-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            onClick={() => { setActiveTab('duplicate'); setCurrentPage(1); setExpandedGroupId(null); }}
          >
            <Layers size={16} />
            Duplicate Groups
            <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${activeTab === 'duplicate' ? 'bg-rose-50 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>{duplicateGroups.length}</span>
          </button>
        </div>

        <div className="luxe-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="pl-8 h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[8%]">No.</TableHead>
                  <TableHead className="h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[27%]">Artist Profile</TableHead>
                  <TableHead className="h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[12%]">Category</TableHead>
                  <TableHead className="h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[15%]">Language</TableHead>
                  <TableHead className="h-14 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[12%]">Price Range</TableHead>
                  <TableHead className="h-14 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[10%]">Status</TableHead>
                  <TableHead className="h-14 pr-8 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[16%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-72 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-sky-600 flex items-center justify-center shadow-sm">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Scanning Registry...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : artists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-72 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Mic2 size={32} className="text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-400">No matching talent found</p>
                        <Button variant="ghost" onClick={() => setFilters(INITIAL_FILTER_STATE)} className="text-xs font-bold uppercase tracking-widest hover:bg-slate-50">Clear Filters</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : activeTab === 'all' || activeTab === 'original' ? (
                  currentList
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((artist) => renderArtistRow(artist))
                ) : (
                  duplicateGroups
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((group, idx) => {
                      const primary = group[0];
                      const isExpanded = expandedGroupId === primary.phone_no;
                      return (
                        <React.Fragment key={`group-${primary.phone_no || idx}`}>
                          <TableRow 
                            className={`group border-b border-slate-100 cursor-pointer transition-colors ${isExpanded ? 'bg-amber-50/30' : 'hover:bg-slate-50'}`} 
                            onClick={() => setExpandedGroupId(isExpanded ? null : primary.phone_no)}
                          >
                            <TableCell colSpan={7} className="py-5 px-8">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                  <div className="w-12 h-12 rounded-2xl bg-amber-100/50 text-amber-600 flex items-center justify-center shadow-sm border border-amber-200/50">
                                    <Layers size={20} strokeWidth={2.5} />
                                  </div>
                                  <div>
                                    <p className="font-black text-slate-900 flex items-center gap-2">
                                      Phone Number: <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">{primary.phone_no}</span>
                                    </p>
                                    <p className="text-[13px] font-medium text-slate-500 mt-1">
                                      Contains <span className="font-bold text-slate-700">{group.length} profiles</span> 
                                      <span className="mx-2 text-slate-300">|</span>
                                      {group.map(a => a.name).join(', ')}
                                    </p>
                                  </div>
                                </div>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-slate-400 shadow-sm border border-slate-200 group-hover:border-amber-400 group-hover:text-amber-500'}`}>
                                  <ChevronDown size={20} strokeWidth={3} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && group.map(artist => renderArtistRow(artist, true))}
                        </React.Fragment>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-8 py-5 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-200/50 shadow-sm">
                 <Info size={14} className="text-sky-600" strokeWidth={2.5} />
               </div>
               <p className="text-[13px] font-bold text-slate-500">
                 Showing <span className="text-slate-900 font-black">{currentList.length} items</span>
               </p>
            </div>
            <div className="flex items-center gap-2">
               <button
                 disabled={currentPage === 1}
                 onClick={() => setCurrentPage(prev => prev - 1)}
                 className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-sky-600 hover:text-sky-600 transition-all shadow-sm"
               >
                 <ChevronLeft size={18} strokeWidth={2.5} />
               </button>
               <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                 <p className="text-[13px] font-bold text-slate-900">Page <span className="text-sky-600">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span></p>
               </div>
               <button
                 disabled={currentPage === totalPages}
                 onClick={() => setCurrentPage(prev => prev + 1)}
                 className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-sky-600 hover:text-sky-600 transition-all shadow-sm"
               >
                 <ChevronRight size={18} strokeWidth={2.5} />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
