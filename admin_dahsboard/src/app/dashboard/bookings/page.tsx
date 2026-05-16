"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  CalendarCheck,
  Search,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  User,
  Mic2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  FileSpreadsheet,
  Eye,
  Trash2,
  Plus,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  ChevronUp,
  ChevronDown,
  Star,
  Trophy
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ManualBookingModal } from '@/components/bookings/ManualBookingModal';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Bookings', color: 'bg-slate-100 text-slate-600' },
  { value: 'pending', label: 'Pending', color: 'bg-amber-50 text-amber-600' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-emerald-50 text-emerald-600' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-50 text-blue-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-rose-50 text-rose-600' },
];

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: CheckCircle2 };
    case 'pending':
      return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200/50', icon: AlertCircle };
    case 'completed':
      return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200/50', icon: CheckCircle2 };
    case 'cancelled':
      return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200/50', icon: XCircle };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200/50', icon: AlertCircle };
  }
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const ITEMS_PER_PAGE = 10;
  const { toast } = useToast();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      // Bookings shows:
      // 1. All manual bookings (any status) — created by admin
      // 2. Client bookings that have been confirmed/completed/cancelled
      //    (pending client requests stay in Client Requests section)
      let query = (supabase
        .from('bookings') as any)
        .select('*, artists(id, name, alias, category, city, contact_person, phone_no, email, is_popular, is_artist_of_month, artist_images!fk_artist_id(image_url))');

      // Build the source filter
      // We want: booking_source = 'manual' OR (booking_source = 'client' AND status != 'pending')
      query = query.or(
        `booking_source.eq.manual,and(booking_source.eq.client,status.neq.pending)`
      );

      if (searchQuery) {
        query = query.or(
          `client_name.ilike.%${searchQuery}%,client_email.ilike.%${searchQuery}%,event_type.ilike.%${searchQuery}%,venue.ilike.%${searchQuery}%`
        );
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query.order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      if (error?.message?.includes('relation') || error?.code === '42P01') {
        setBookings([]);
        toast({
          variant: 'destructive',
          title: 'Table Not Found',
          description: 'The bookings table does not exist yet. Please create it in Supabase.',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const { count: total } = await (supabase.from('bookings') as any).select('*', { count: 'exact', head: true });
      const { count: pending } = await (supabase.from('bookings') as any).select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { count: confirmed } = await (supabase.from('bookings') as any).select('*', { count: 'exact', head: true }).eq('status', 'confirmed');
      const { count: completed } = await (supabase.from('bookings') as any).select('*', { count: 'exact', head: true }).eq('status', 'completed');
      const { count: cancelled } = await (supabase.from('bookings') as any).select('*', { count: 'exact', head: true }).eq('status', 'cancelled');
      setStats({
        total: total || 0,
        pending: pending || 0,
        confirmed: confirmed || 0,
        completed: completed || 0,
        cancelled: cancelled || 0,
      });
    } catch (error) {
       // Failed to fetch stats
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
    const timer = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchBookings, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

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

  const totalPages = Math.max(1, Math.ceil(bookings.length / ITEMS_PER_PAGE));
  const paginatedBookings = bookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await (supabase
        .from('bookings') as any)
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Updated', description: `Booking status changed to ${newStatus}.` });
      fetchBookings();
      fetchStats();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      const { error } = await (supabase.from('bookings') as any).delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Booking has been removed.' });
      setDetailOpen(false);
      fetchBookings();
      fetchStats();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDownloadXLS = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, artists(name, alias, category, city, contact_person, phone_no, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: 'No bookings to export.' });
        return;
      }

      const XLSX = await import('xlsx');

      const exportData = data.map((b: any, index: number) => ({
        'S.No': index + 1,
        'Artist Name': b.artists?.name || 'N/A',
        'Artist Alias': b.artists?.alias || 'N/A',
        'Category': b.artists?.category || 'N/A',
        'Client Name': b.client_name || 'N/A',
        'Client Email': b.client_email || 'N/A',
        'Client Phone': b.client_phone || 'N/A',
        'Event Type': b.event_type || 'N/A',
        'Event Date': b.event_date ? new Date(b.event_date).toLocaleDateString('en-IN') : 'N/A',
        'Event Time': b.event_time || 'N/A',
        'Venue': b.venue || 'N/A',
        'City': b.artists?.city || b.city || 'N/A',
        'Budget': b.budget || 'N/A',
        'Status': b.status || 'N/A',
        'Notes': b.notes || '',
        'Booked On': b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN') : 'N/A',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);

      const colWidths = [
        { wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
        { wch: 20 }, { wch: 25 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 10 },
        { wch: 25 }, { wch: 15 }, { wch: 12 },
        { wch: 12 }, { wch: 30 }, { wch: 15 },
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `TalentTrack_Bookings_${today}.xlsx`);

      toast({ title: 'Downloaded!', description: 'Bookings exported as XLS file.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Export Error', description: error.message });
    }
  };

  const statCards = [
    { label: 'Total', value: stats.total, color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-50', textColor: 'text-indigo-600' },
    { label: 'Pending', value: stats.pending, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', textColor: 'text-amber-600' },
    { label: 'Confirmed', value: stats.confirmed, color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'Completed', value: stats.completed, color: 'from-blue-400 to-cyan-500', bg: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Cancelled', value: stats.cancelled, color: 'from-rose-400 to-pink-500', bg: 'bg-rose-50', textColor: 'text-rose-600' },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-10 -mt-4 sm:-mt-6 lg:-mt-8 xl:-mt-10 px-4 sm:px-6 lg:px-8 xl:px-10 pt-8 pb-8 bg-gradient-to-b from-slate-50 to-transparent border-b border-white mb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Bookings</h1>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-100 shadow-sm">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{stats.total} Total</span>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-100 shadow-sm">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{stats.pending} Pending</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-400 to-sky-600 border border-sky-300 shadow-lg shadow-sky-200/50 hover:shadow-sky-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-white font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Plus size={16} strokeWidth={3} className="text-white" />
              Manual Booking
            </button>
            <button
              onClick={handleDownloadXLS}
              className="group h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-400 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-emerald-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 shadow-sm"
            >
              <Download size={16} strokeWidth={3} className="text-white" />
              Export XLS
            </button>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="relative group w-full">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Search bookings by client, artist, venue or event profile..."
              className="w-full pl-16 pr-14 h-14 rounded-[22px] border border-slate-100 bg-white shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-200 transition-all font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex p-1 bg-slate-200/50 backdrop-blur-md rounded-[20px] border border-white items-center overflow-x-auto scrollbar-hide">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    "px-5 py-2 rounded-[16px] text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap",
                    statusFilter === opt.value
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 bg-white/70 backdrop-blur-md p-1.5 rounded-[22px] border border-white shadow-sm ml-auto">
              <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50/50 rounded-[18px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-[12px] font-black text-slate-700 bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-indigo-600 transition-colors uppercase pr-6"
                >
                  <option value="created_at">Submission</option>
                  <option value="event_date">Event Date</option>
                  <option value="budget">Budget</option>
                  <option value="client_name">Client</option>
                </select>
              </div>

              <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-10 h-10 rounded-[16px] flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-90"
              >
                {sortOrder === 'asc' ? <SortAsc size={16} strokeWidth={2.5} /> : <SortDesc size={16} strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="luxe-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-lg bg-sky-600 flex items-center justify-center shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <CalendarCheck size={32} className="text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-400">No bookings found</p>
            <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedBookings.map((booking) => {
              const status = getStatusBadge(booking.status);
              const StatusIcon = status.icon;
              const artistImg = booking.artists?.artist_images?.[0]?.image_url;

              return (
                <div
                  key={booking.id}
                  className="relative flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-6 py-5 sm:py-4 hover:bg-slate-50/50 transition-colors cursor-pointer group border-b border-slate-100 last:border-0"
                  onClick={() => { setSelectedBooking(booking); setDetailOpen(true); }}
                >
                  <div className="absolute top-4 right-4 sm:static sm:order-last">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold border whitespace-nowrap",
                      status.bg, status.text, status.border
                    )}>
                      <StatusIcon size={12} className="hidden sm:inline" />
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {artistImg ? (
                        <img src={artistImg} alt={booking.artists?.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                          {booking.artists?.name?.[0] || <Mic2 size={18} />}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-16 sm:pr-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1.5">
                        <p className="font-black text-slate-900 text-[15px] sm:text-[16px] truncate leading-tight">
                          {booking.artists?.name || 'Unknown Artist'}
                        </p>
                        <span className="inline-flex h-fit px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[9px] sm:text-[10px] font-black uppercase tracking-wider w-fit">
                          {booking.artists?.category}
                        </span>
                        {booking.artists?.is_artist_of_month && (
                          <span className="inline-flex h-fit px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[9px] sm:text-[10px] font-black uppercase tracking-wider w-fit border border-rose-100 flex items-center gap-1">
                            <Trophy size={10} />
                            Month
                          </span>
                        )}
                        {booking.artists?.is_popular ? (
                          <span className="inline-flex h-fit px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[9px] sm:text-[10px] font-black uppercase tracking-wider w-fit border border-amber-100 flex items-center gap-1">
                            <Star size={10} fill="currentColor" />
                            Popular
                          </span>
                        ) : (
                          <span className="inline-flex h-fit px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider w-fit border border-slate-100">
                            Standard
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:flex sm:items-center gap-x-3 gap-y-1.5 text-[12px] sm:text-[13px] text-slate-500">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <User size={12} className="text-slate-400" strokeWidth={2.5} /> {booking.client_name || 'N/A'}
                        </span>
                        <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar size={12} className="text-slate-400" strokeWidth={2.5} /> {booking.event_date ? new Date(booking.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'}
                        </span>
                        <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1.5 font-medium truncate">
                          <MapPin size={12} className="text-slate-400" strokeWidth={2.5} /> {booking.artists?.city || booking.venue || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:flex flex-col items-end gap-1 px-4 border-l border-slate-100 min-w-[120px]">
                    <span className="text-[15px] font-black text-slate-900">
                      {booking.budget ? `₹${Number(booking.budget).toLocaleString('en-IN')}` : '—'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {booking.event_type || 'Event'}
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); setDetailOpen(true); }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 hover:border-indigo-600 hover:text-indigo-600 text-slate-400 transition-all shadow-sm active:scale-90"
                      title="View"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking.id); }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 hover:border-rose-500 hover:text-rose-500 text-slate-400 transition-all shadow-sm active:scale-90"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {bookings.length > 0 && (
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200/50 shadow-sm">
                <Info size={14} className="text-indigo-500" strokeWidth={2.5} />
              </div>
              <p className="text-[12px] sm:text-[13px] font-bold text-slate-500">
                Found <span className="text-slate-900 font-black">{bookings.length}</span> results
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="flex-1 sm:flex-none h-10 px-3 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              <div className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                <p className="text-[12px] sm:text-[13px] font-bold text-slate-900 whitespace-nowrap">
                  <span className="text-indigo-600 font-black">{currentPage}</span> / {totalPages}
                </p>
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="flex-1 sm:flex-none h-10 px-3 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setTimeout(() => setSelectedBooking(null), 200); }}>
        <DialogContent className="max-w-[95vw] w-[95vw] lg:max-w-[90vw] max-h-[95vh] overflow-y-auto p-0 border border-slate-200 rounded-[24px] sm:rounded-3xl shadow-2xl bg-white focus:outline-none">
          {selectedBooking ? (
            <>
              <div className="bg-slate-50 border-b border-slate-100 p-6 sm:p-8 relative">
                <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight mb-1 text-slate-900">
                  Booking <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Details</span>
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-sm font-medium">
                  Booking #{selectedBooking.id?.slice(0, 8)} • Created {selectedBooking.created_at ? new Date(selectedBooking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </DialogDescription>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/30 p-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <Mic2 size={14} className="text-sky-500" /> Artist
                  </h3>
                  <div className="flex items-center gap-4">
                    {selectedBooking.artists?.artist_images?.[0]?.image_url ? (
                      <img src={selectedBooking.artists.artist_images[0].image_url} alt={selectedBooking.artists?.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {selectedBooking.artists?.name?.[0] || 'A'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{selectedBooking.artists?.name || 'Unknown'}</p>
                      <p className="text-sm text-sky-500 font-bold">@{selectedBooking.artists?.alias || 'n/a'} • {selectedBooking.artists?.category}</p>
                      {selectedBooking.artists?.city && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={11} /> {selectedBooking.artists.city}</p>}
                    </div>
                  </div>
                  {(selectedBooking.artists?.contact_person || selectedBooking.artists?.phone_no || selectedBooking.artists?.email) && (
                    <div className="mt-4 pt-4 border-t border-slate-100/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Management Contact</p>
                      <div className="flex flex-wrap gap-4">
                        {selectedBooking.artists.contact_person && (
                          <div className="flex items-center gap-2">
                            <User size={12} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">{selectedBooking.artists.contact_person}</span>
                          </div>
                        )}
                        {selectedBooking.artists.phone_no && (
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">{selectedBooking.artists.phone_no}</span>
                          </div>
                        )}
                        {selectedBooking.artists.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={12} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">{selectedBooking.artists.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/30 p-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <User size={14} className="text-sky-500" /> Client Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Name</p>
                      <p className="text-sm font-bold text-slate-900">{selectedBooking.client_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email</p>
                      <p className="text-sm font-medium text-slate-700">{selectedBooking.client_email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</p>
                      <p className="text-sm font-medium text-slate-700">{selectedBooking.client_phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/30 p-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <Calendar size={14} className="text-sky-500" /> Event Details
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Type</p>
                      <p className="text-sm font-bold text-slate-900">{selectedBooking.event_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Date</p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedBooking.event_date ? new Date(selectedBooking.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Time</p>
                      <p className="text-sm font-bold text-slate-900">{selectedBooking.event_time || 'TBD'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Budget</p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedBooking.budget ? `₹${Number(selectedBooking.budget).toLocaleString('en-IN')}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Venue</p>
                    <p className="text-sm font-medium text-slate-700">{selectedBooking.venue || 'N/A'}</p>
                  </div>
                  {selectedBooking.notes && (
                    <div className="mt-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Notes</p>
                      <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/30 p-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-indigo-500" /> Status
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const si = getStatusBadge(selectedBooking.status);
                      const SI = si.icon;
                      return (
                        <span className={cn("inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold border", si.bg, si.text, si.border)}>
                          <SI size={14} />
                          {selectedBooking.status?.charAt(0).toUpperCase() + selectedBooking.status?.slice(1)}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Change Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleUpdateStatus(selectedBooking.id, s)}
                        disabled={selectedBooking.status === s}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all",
                          selectedBooking.status === s
                            ? "bg-sky-600 text-white border-sky-600 cursor-default"
                            : "bg-white text-slate-500 border-slate-200 hover:border-sky-300 hover:text-sky-600"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDetailOpen(false)}
                    className="px-6 py-2.5 text-sm font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBooking(selectedBooking.id)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 uppercase tracking-wider transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <DialogTitle className="sr-only">Booking Details</DialogTitle>
              <DialogDescription className="sr-only">Loading booking details</DialogDescription>
              <div className="p-12 text-center text-slate-400">Loading...</div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <ManualBookingModal 
        open={isBookingModalOpen} 
        onOpenChange={setIsBookingModalOpen} 
        onSuccess={() => {
          fetchBookings();
          fetchStats();
        }}
      />
    </div>
  );
}
