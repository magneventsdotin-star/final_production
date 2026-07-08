"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArtistFilters, ArtistFilterState, INITIAL_FILTER_STATE } from '@/components/artists/ArtistFilters';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Loader2, Mic2, Star, Info, ChevronLeft, ChevronRight, Pencil, Eye, EyeOff, Trash2, Image as ImageIcon, Share2, PlayCircle, MapPin, Music, User, ChevronDown, Layers, Calendar, CalendarCheck, Download, ArrowLeft } from 'lucide-react';
import { CreateArtistModal } from '@/components/artists/CreateArtistModal';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function ArtistManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<any>(null);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ArtistFilterState>(INITIAL_FILTER_STATE);
  const [activeTab, setActiveTab] = useState<'all' | 'original' | 'duplicate' | 'date' | 'live' | 'hidden'>('all');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  // Export State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState<'select' | 'range' | 'single' | 'today' | 'all'>('select');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportSingleDate, setExportSingleDate] = useState('');
  const [exportFilterType, setExportFilterType] = useState('all');

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
          const profileData = data as any;
          const isSuperAdmin = profileData?.role === 'super_admin' || session.user.email?.toLowerCase() === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL?.toLowerCase();
          setCurrentUser({ id: session.user.id, canViewAll: !!(isSuperAdmin || profileData?.can_view_all_artists) });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, []);

  const { originalArtists, duplicateGroups, liveArtists, hiddenArtists, dateGroups } = useMemo(() => {
    const groups = new Map<string, any[]>();
    const original: any[] = [];
    const duplicates: any[][] = [];
    const dates = new Map<string, any[]>();

    artists.forEach(artist => {
      const phone = artist.phone_no;
      if (!phone) {
        original.push(artist);
      } else {
        if (!groups.has(phone)) groups.set(phone, []);
        groups.get(phone)!.push(artist);
      }

      if (artist.created_at) {
        const dateStr = new Date(artist.created_at).toISOString().split('T')[0];
        if (!dates.has(dateStr)) dates.set(dateStr, []);
        dates.get(dateStr)!.push(artist);
      }
    });

    groups.forEach(group => {
      if (group.length === 1) {
        original.push(group[0]);
      } else {
        duplicates.push(group);
      }
    });

    const dateGroupsArr = Array.from(dates.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, arr]) => ({ date, artists: arr }));

    const live = artists.filter(a => a.is_live);
    const hidden = artists.filter(a => !a.is_live);

    return { originalArtists: original, duplicateGroups: duplicates, liveArtists: live, hiddenArtists: hidden, dateGroups: dateGroupsArr };
  }, [artists]);

  const currentList = activeTab === 'all' ? artists : activeTab === 'original' ? originalArtists : activeTab === 'duplicate' ? duplicateGroups : activeTab === 'date' ? dateGroups : activeTab === 'live' ? liveArtists : hiddenArtists;
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
        let searchFilter = `name.ilike.%${filters.search}%,alias.ilike.%${filters.search}%,category.ilike.%${filters.search}%,sub_category.ilike.%${filters.search}%,city.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone_no.ilike.%${filters.search}%`;
        const searchAsNum = parseInt(filters.search.replace(/^#+/, ''));
        if (!isNaN(searchAsNum)) {
           searchFilter += `,artist_no.eq.${searchAsNum}`;
        }
        query = query.or(searchFilter);
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
      
      if (filters.registrationDate && filters.registrationDate !== 'all') {
        const now = new Date();
        let startDate;
        if (filters.registrationDate === 'today') {
          startDate = new Date(now.setHours(0,0,0,0));
        } else if (filters.registrationDate === 'this_week') {
          startDate = new Date(now.setDate(now.getDate() - now.getDay()));
          startDate.setHours(0,0,0,0);
        } else if (filters.registrationDate === 'this_month') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        if (startDate) {
          query = query.gte('created_at', startDate.toISOString());
        }
      }

      let orderBy = 'artist_no';
      let ascending = true;
      switch (filters.sortBy) {
        case 'artist_no_desc': ascending = false; break;
        case 'name_asc': orderBy = 'name'; break;
        case 'name_desc': orderBy = 'name'; ascending = false; break;
        case 'date_desc': orderBy = 'created_at'; ascending = false; break;
        case 'date_asc': orderBy = 'created_at'; break;
      }
      
      const { data, count, error } = await query.order(orderBy, { ascending });
      if (error) throw error;
      setArtists(data || []);
      setTotalCount(count || 0);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  }, [filters, currentUser]);

  const handleExportRange = async () => {
    try {
      if (!exportStartDate || !exportEndDate) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select both start and end dates.' });
        return;
      }
      const start = new Date(exportStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(exportEndDate);
      end.setHours(23, 59, 59, 999);
      
      let query = (supabase.from('artists') as any)
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false });

      if (exportFilterType === 'live') query = query.eq('is_live', true);
      else if (exportFilterType === 'hidden') query = query.eq('is_live', false);
      
      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: 'No artists found in this range.' });
        return;
      }
      const { exportToExcel } = await import('@/lib/exportExcel');
      const exportData = data.map((a: any, index: number) => ({
        'S.No': index + 1,
        'Artist No': a.artist_no || 'N/A',
        'Artist Name': a.name || 'N/A',
        'Alias': a.alias || 'N/A',
        'Category': a.category || 'N/A',
        'Contact Person': a.contact_person || 'N/A',
        'Phone No': a.phone_no || 'N/A',
        'Email': a.email || 'N/A',
        'City': a.city || 'N/A',
        'State': a.state || 'N/A',
        'Price Range': a.price_range || (a.price_min && a.price_max ? `${a.price_min}-${a.price_max}` : 'N/A'),
        'Language': a.performing_language || 'N/A',
        'Trending': a.is_trending ? 'Yes' : 'No',
        'Artist of Month': a.is_artist_of_month ? 'Yes' : 'No',
        'Status': a.is_live ? 'Live' : 'Hidden',
        'Added On': a.created_at ? new Date(a.created_at).toLocaleString('en-IN') : 'N/A',
      }));
      await exportToExcel(exportData, `TalentTrack_Artists_${exportStartDate}_to_${exportEndDate}`, 'Artists');
      setExportModalOpen(false);
      setExportMode('select');
      toast({ title: 'Downloaded!', description: 'Artists exported successfully.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export Error', description: err.message });
    }
  };

  const handleExportTodayData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      let query = (supabase.from('artists') as any)
        .select('*')
        .gte('created_at', today.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (exportFilterType === 'live') query = query.eq('is_live', true);
      else if (exportFilterType === 'hidden') query = query.eq('is_live', false);
      
      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: "No artists found for today." });
        return;
      }
      const { exportToExcel } = await import('@/lib/exportExcel');
      const exportData = data.map((a: any, index: number) => ({
        'S.No': index + 1,
        'Artist No': a.artist_no || 'N/A',
        'Artist Name': a.name || 'N/A',
        'Alias': a.alias || 'N/A',
        'Category': a.category || 'N/A',
        'Contact Person': a.contact_person || 'N/A',
        'Phone No': a.phone_no || 'N/A',
        'Email': a.email || 'N/A',
        'City': a.city || 'N/A',
        'State': a.state || 'N/A',
        'Price Range': a.price_range || (a.price_min && a.price_max ? `${a.price_min}-${a.price_max}` : 'N/A'),
        'Language': a.performing_language || 'N/A',
        'Trending': a.is_trending ? 'Yes' : 'No',
        'Artist of Month': a.is_artist_of_month ? 'Yes' : 'No',
        'Status': a.is_live ? 'Live' : 'Hidden',
        'Added On': a.created_at ? new Date(a.created_at).toLocaleString('en-IN') : 'N/A',
      }));
      const dateStr = today.toISOString().split('T')[0];
      await exportToExcel(exportData, `TalentTrack_Artists_Today_${dateStr}`, 'Artists');
      setExportModalOpen(false);
      setExportMode('select');
      toast({ title: 'Downloaded!', description: "Today's artists exported successfully." });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export Error', description: err.message });
    }
  };

  const handleExportAllData = async () => {
    try {
      let query = (supabase.from('artists') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (exportFilterType === 'live') query = query.eq('is_live', true);
      else if (exportFilterType === 'hidden') query = query.eq('is_live', false);
      
      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: 'No artists to export.' });
        return;
      }
      const { exportToExcel } = await import('@/lib/exportExcel');
      const exportData = data.map((a: any, index: number) => ({
        'S.No': index + 1,
        'Artist No': a.artist_no || 'N/A',
        'Artist Name': a.name || 'N/A',
        'Alias': a.alias || 'N/A',
        'Category': a.category || 'N/A',
        'Contact Person': a.contact_person || 'N/A',
        'Phone No': a.phone_no || 'N/A',
        'Email': a.email || 'N/A',
        'City': a.city || 'N/A',
        'State': a.state || 'N/A',
        'Price Range': a.price_range || (a.price_min && a.price_max ? `${a.price_min}-${a.price_max}` : 'N/A'),
        'Language': a.performing_language || 'N/A',
        'Trending': a.is_trending ? 'Yes' : 'No',
        'Artist of Month': a.is_artist_of_month ? 'Yes' : 'No',
        'Status': a.is_live ? 'Live' : 'Hidden',
        'Added On': a.created_at ? new Date(a.created_at).toLocaleString('en-IN') : 'N/A',
      }));
      await exportToExcel(exportData, `TalentTrack_Artists_All_Data`, 'Artists');
      setExportModalOpen(false);
      setExportMode('select');
      toast({ title: 'Downloaded!', description: 'All artists exported successfully.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export Error', description: err.message });
    }
  };

  const handleExportDay = async (dateStr: string) => {
    try {
      const start = new Date(dateStr);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateStr);
      end.setHours(23, 59, 59, 999);
      
      let query = (supabase.from('artists') as any)
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false });

      if (exportFilterType === 'live') query = query.eq('is_live', true);
      else if (exportFilterType === 'hidden') query = query.eq('is_live', false);
      
      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: `No artists found for ${dateStr}.` });
        return;
      }
      const { exportToExcel } = await import('@/lib/exportExcel');
      const exportData = data.map((a: any, index: number) => ({
        'S.No': index + 1,
        'Artist No': a.artist_no || 'N/A',
        'Artist Name': a.name || 'N/A',
        'Alias': a.alias || 'N/A',
        'Category': a.category || 'N/A',
        'Contact Person': a.contact_person || 'N/A',
        'Phone No': a.phone_no || 'N/A',
        'Email': a.email || 'N/A',
        'City': a.city || 'N/A',
        'State': a.state || 'N/A',
        'Price Range': a.price_range || (a.price_min && a.price_max ? `${a.price_min}-${a.price_max}` : 'N/A'),
        'Language': a.performing_language || 'N/A',
        'Trending': a.is_trending ? 'Yes' : 'No',
        'Artist of Month': a.is_artist_of_month ? 'Yes' : 'No',
        'Status': a.is_live ? 'Live' : 'Hidden',
        'Added On': a.created_at ? new Date(a.created_at).toLocaleString('en-IN') : 'N/A',
      }));
      await exportToExcel(exportData, `TalentTrack_Artists_${dateStr}`, 'Artists');
      setExportModalOpen(false);
      setExportMode('select');
      toast({ title: 'Downloaded!', description: `Artists for ${dateStr} exported successfully.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export Error', description: err.message });
    }
  };

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

  const handleDeleteBatch = async (dateStr: string, artistsInBatch: any[]) => {
    if (!confirm(`Are you sure you want to delete all ${artistsInBatch.length} profiles uploaded on ${dateStr}? This action cannot be undone.`)) return;
    try {
      setLoading(true);
      const artistIds = artistsInBatch.map(a => a.id);
      
      // Delete images first
      await (supabase.from('artist_images') as any).delete().in('artist_id', artistIds);
      
      // Delete artists
      const { error } = await (supabase.from('artists') as any).delete().in('id', artistIds);
      if (error) throw error;
      
      toast({ title: 'Batch Deleted', description: `Successfully removed ${artistsInBatch.length} profiles.` });
      fetchArtists();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete batch.' });
      setLoading(false);
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

  const renderArtistRow = (artist: any, index: number, isChild: boolean = false) => (
    <TableRow key={artist.id} className={`group border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer ${isChild ? 'bg-amber-50/40' : ''}`} onClick={() => handleEditArtist(artist)}>
      <TableCell className={`py-5 ${isChild ? 'pl-12 relative' : 'pl-8'}`}>
        {isChild && <div className="absolute left-6 top-1/2 w-4 h-px bg-amber-200" />}
        {isChild && <div className="absolute left-6 top-0 w-px h-1/2 bg-amber-200" />}
        <div className="flex flex-col gap-1 items-start">
          <span className="text-[12px] font-black text-slate-900 bg-slate-100/80 px-2 py-1 rounded border border-slate-200/60 whitespace-nowrap text-center" title="Artist Number">
            #{artist.artist_no ? artist.artist_no.toString().padStart(4, '0') : 'TBD'}
          </span>
        </div>
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
              {artist.created_at && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-bold text-sky-600 flex items-center gap-1">
                    Added: {new Date(artist.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0">
        <div className="section-header">
          <span className="section-label">Management</span>
          <h1 className="section-title text-slate-900">
            Artists Registry
          </h1>
          <p className="text-body mt-1 max-w-2xl font-medium">Manage and view all registered talent profiles.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200/50 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2"
            onClick={() => { setEditingArtist(null); setIsModalOpen(true); }}
          >
            <Plus size={16} strokeWidth={3} />
            Add Artist
          </button>
          <button
            onClick={() => { setExportMode('select'); setExportModalOpen(true); }}
            className="group flex-1 sm:flex-none h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-400 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-emerald-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 shadow-sm"
          >
            <Download size={16} strokeWidth={3} className="text-white" />
            Export XLS
          </button>
        </div>
      </div>
      <CreateArtistModal
        key={editingArtist?.id || 'new'}
        open={isModalOpen}
        onOpenChange={handleModalChange}
        onSuccess={fetchArtists}
        initialData={editingArtist}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Artists</p>
            <p className="text-2xl font-black text-slate-900">{artists.length}</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Eye size={20} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Active Profiles</p>
            <p className="text-2xl font-black text-slate-900">{liveArtists.length}</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star size={20} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Trending</p>
            <p className="text-2xl font-black text-slate-900">{artists.filter(a => a.is_trending).length}</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">New Today</p>
            <p className="text-2xl font-black text-slate-900">
              {artists.filter(a => a.created_at && new Date(a.created_at) >= new Date(new Date().setHours(0,0,0,0))).length}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <ArtistFilters onFilterChange={setFilters} />
        
        <div className="flex bg-slate-100/60 p-1.5 rounded-2xl w-fit max-w-full overflow-x-auto shadow-inner scrollbar-hide gap-1">
          <button 
            className={`px-4 py-2 rounded-xl flex items-center gap-2.5 transition-all whitespace-nowrap border border-transparent ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'}`}
            onClick={() => { setActiveTab('all'); setCurrentPage(1); setExpandedGroupId(null); }}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'all' ? 'bg-sky-100 text-sky-600' : 'bg-slate-200/70 text-slate-400'}`}>
              <User size={14} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold">All Profiles</span>
            <span className={`text-[11px] font-black ${activeTab === 'all' ? 'text-slate-900' : 'text-slate-400'}`}>
              {artists.length}
            </span>
          </button>

          <button 
            className={`px-4 py-2 rounded-xl flex items-center gap-2.5 transition-all whitespace-nowrap border border-transparent ${activeTab === 'original' ? 'bg-white text-slate-900 shadow-sm border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'}`}
            onClick={() => { setActiveTab('original'); setCurrentPage(1); setExpandedGroupId(null); }}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'original' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200/70 text-slate-400'}`}>
              <Mic2 size={14} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold">Originals</span>
            <span className={`text-[11px] font-black ${activeTab === 'original' ? 'text-slate-900' : 'text-slate-400'}`}>
              {originalArtists.length}
            </span>
          </button>

          <button 
            className={`px-4 py-2 rounded-xl flex items-center gap-2.5 transition-all whitespace-nowrap border border-transparent ${activeTab === 'duplicate' ? 'bg-white text-slate-900 shadow-sm border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'}`}
            onClick={() => { setActiveTab('duplicate'); setCurrentPage(1); setExpandedGroupId(null); }}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'duplicate' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200/70 text-slate-400'}`}>
              <Layers size={14} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold">Duplicates</span>
            <span className={`text-[11px] font-black ${activeTab === 'duplicate' ? 'text-slate-900' : 'text-slate-400'}`}>
              {duplicateGroups.length}
            </span>
          </button>

          <button 
            className={`px-4 py-2 rounded-xl flex items-center gap-2.5 transition-all whitespace-nowrap border border-transparent ${activeTab === 'date' ? 'bg-white text-slate-900 shadow-sm border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'}`}
            onClick={() => { setActiveTab('date'); setCurrentPage(1); setExpandedGroupId(null); }}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'date' ? 'bg-purple-100 text-purple-600' : 'bg-slate-200/70 text-slate-400'}`}>
              <Calendar size={14} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold">By Date</span>
            <span className={`text-[11px] font-black ${activeTab === 'date' ? 'text-slate-900' : 'text-slate-400'}`}>
              {dateGroups.length}
            </span>
          </button>

          <button 
            className={`px-4 py-2 rounded-xl flex items-center gap-2.5 transition-all whitespace-nowrap border border-transparent ${activeTab === 'live' ? 'bg-white text-slate-900 shadow-sm border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'}`}
            onClick={() => { setActiveTab('live'); setCurrentPage(1); setExpandedGroupId(null); }}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'live' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200/70 text-slate-400'}`}>
              <Eye size={14} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold">Live</span>
            <span className={`text-[11px] font-black ${activeTab === 'live' ? 'text-slate-900' : 'text-slate-400'}`}>
              {liveArtists.length}
            </span>
          </button>

          <button 
            className={`px-4 py-2 rounded-xl flex items-center gap-2.5 transition-all whitespace-nowrap border border-transparent ${activeTab === 'hidden' ? 'bg-white text-slate-900 shadow-sm border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'}`}
            onClick={() => { setActiveTab('hidden'); setCurrentPage(1); setExpandedGroupId(null); }}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'hidden' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200/70 text-slate-400'}`}>
              <EyeOff size={14} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold">Hidden</span>
            <span className={`text-[11px] font-black ${activeTab === 'hidden' ? 'text-slate-900' : 'text-slate-400'}`}>
              {hiddenArtists.length}
            </span>
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
                ) : activeTab === 'duplicate' ? (
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
                          {isExpanded && group.map((artist, idx) => renderArtistRow(artist, idx, true))}
                        </React.Fragment>
                      );
                    })
                ) : activeTab === 'date' ? (
                  dateGroups
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((group, idx) => {
                      const isExpanded = expandedGroupId === group.date;
                      const dateFormatted = new Date(group.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                      return (
                        <React.Fragment key={`date-${group.date}`}>
                          <TableRow 
                            className={`group border-b border-slate-100 cursor-pointer transition-colors ${isExpanded ? 'bg-purple-50/30' : 'hover:bg-slate-50'}`} 
                            onClick={() => setExpandedGroupId(isExpanded ? null : group.date)}
                          >
                            <TableCell colSpan={7} className="py-5 px-8">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                  <div className="w-12 h-12 rounded-2xl bg-purple-100/50 text-purple-600 flex items-center justify-center shadow-sm border border-purple-200/50">
                                    <Calendar size={20} strokeWidth={2.5} />
                                  </div>
                                  <div>
                                    <p className="font-black text-slate-900 flex items-center gap-2">
                                      Upload Date: <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{dateFormatted}</span>
                                    </p>
                                    <p className="text-[13px] font-medium text-slate-500 mt-1">
                                      Contains <span className="font-bold text-slate-700">{group.artists.length} profiles</span> 
                                      <span className="mx-2 text-slate-300">|</span>
                                      {group.artists.map((a: any) => a.name).join(', ')}
                                    </p>
                                  </div>
                                </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleDeleteBatch(dateFormatted, group.artists); }}
                                      className="h-10 px-3 rounded-xl flex items-center justify-center bg-white text-slate-400 shadow-sm border border-slate-200 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-all z-10 relative group/btn"
                                      title="Delete entire batch"
                                    >
                                      <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                                      <span className="text-[11px] font-bold ml-1.5 hidden group-hover/btn:inline-block">Delete Batch</span>
                                    </button>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-400 shadow-sm border border-slate-200 group-hover:border-purple-400 group-hover:text-purple-500'}`}>
                                      <ChevronDown size={20} strokeWidth={3} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                          </TableRow>
                          {isExpanded && group.artists.map((artist: any, idx: number) => renderArtistRow(artist, idx, true))}
                        </React.Fragment>
                      );
                    })
                ) : (
                  (currentList as any[])
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((artist, idx) => renderArtistRow(artist, idx))
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
               <div className="flex items-center gap-1 hidden sm:flex">
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                   <button
                     key={page}
                     onClick={() => setCurrentPage(page)}
                     className={`w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold transition-all shadow-sm ${currentPage === page ? 'bg-sky-600 text-white shadow-sky-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-400 hover:text-sky-600'}`}
                   >
                     {page}
                   </button>
                 ))}
               </div>
               <div className="sm:hidden px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
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
      
      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={(open) => { setExportModalOpen(open); if(!open) setExportMode('select'); }}>
        <DialogContent className="max-w-md w-full p-8 rounded-[24px] bg-white border border-slate-100 shadow-2xl">
          {exportMode !== 'select' && (
            <button 
              onClick={() => setExportMode('select')}
              className="absolute left-6 top-6 p-2 rounded-full hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
              <Download size={32} strokeWidth={2.5} className="text-emerald-500" />
            </div>
            <DialogTitle className="text-2xl font-black mb-2">Export Artists</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mb-8">
              {exportMode === 'select' ? 'Select how you want to export artist data.' : 'Select the dates to download artist details.'}
            </DialogDescription>
            
            {exportMode === 'select' ? (
              <div className="w-full space-y-3">
                <button 
                  onClick={() => setExportMode('single')}
                  className="w-full h-14 rounded-xl border-2 border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/50 transition-all flex items-center justify-between px-6 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <Calendar size={16} strokeWidth={3} />
                    </div>
                    <span className="font-bold text-sm text-slate-700">Date Wise</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" strokeWidth={3} />
                </button>
                <button 
                  onClick={() => setExportMode('range')}
                  className="w-full h-14 rounded-xl border-2 border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/50 transition-all flex items-center justify-between px-6 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <CalendarCheck size={16} strokeWidth={3} />
                    </div>
                    <span className="font-bold text-sm text-slate-700">Range Wise</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" strokeWidth={3} />
                </button>
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => setExportMode('today')}
                    className="w-full h-11 rounded-xl bg-sky-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    Today's Data
                  </button>
                  <button 
                    onClick={() => setExportMode('all')}
                    className="w-full h-11 rounded-xl bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    All Data
                  </button>
                </div>
              </div>
            ) : exportMode === 'range' ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">Start Date</label>
                  <input 
                    type="date" 
                    value={exportStartDate} 
                    onChange={e => setExportStartDate(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-2 mb-2 w-full mt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">End Date</label>
                  <input 
                    type="date" 
                    value={exportEndDate} 
                    onChange={e => setExportEndDate(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-2 mb-4 w-full mt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">Status Filter</label>
                  <select
                    value={exportFilterType}
                    onChange={(e) => setExportFilterType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">All Artists</option>
                    <option value="live">Live</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                <button 
                  onClick={handleExportRange}
                  className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  <Download size={16} /> Download Range
                </button>
              </>
            ) : exportMode === 'single' ? (
              <>
                <div className="flex flex-col gap-2 mb-2 w-full">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">Select Date</label>
                  <input 
                    type="date" 
                    value={exportSingleDate} 
                    onChange={e => setExportSingleDate(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-2 mb-4 w-full mt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">Status Filter</label>
                  <select
                    value={exportFilterType}
                    onChange={(e) => setExportFilterType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">All Artists</option>
                    <option value="live">Live</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                <button 
                  onClick={() => {
                    if(!exportSingleDate) {
                       toast({ variant: 'destructive', title: 'Error', description: 'Please select a date.' });
                       return;
                    }
                    handleExportDay(exportSingleDate);
                  }}
                  className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 mt-2"
                >
                  <Download size={16} /> Download Date
                </button>
              </>
            ) : exportMode === 'today' ? (
              <>
                <div className="flex flex-col gap-2 mb-4 w-full">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">Status Filter</label>
                  <select
                    value={exportFilterType}
                    onChange={(e) => setExportFilterType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">All Artists</option>
                    <option value="live">Live</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                <button 
                  onClick={handleExportTodayData}
                  className="w-full h-11 rounded-xl bg-sky-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 mt-2"
                >
                  <Download size={16} /> Download Today
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-4 w-full">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">Status Filter</label>
                  <select
                    value={exportFilterType}
                    onChange={(e) => setExportFilterType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">All Artists</option>
                    <option value="live">Live</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                <button 
                  onClick={handleExportAllData}
                  className="w-full h-11 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 mt-2"
                >
                  <Download size={16} /> Download All
                </button>
              </>
            )}

            <button 
              onClick={() => {
                if (exportMode !== 'select') setExportMode('select');
                else setExportModalOpen(false);
              }} 
              className="mt-3 w-full h-11 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
            >
              {exportMode === 'select' ? 'Cancel' : <><ArrowLeft size={16} /> Back to Options</>}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
