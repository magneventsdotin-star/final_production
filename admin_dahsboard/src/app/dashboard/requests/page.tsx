"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  CalendarCheck,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  MapPin,
  Calendar,
  User,
  Mic2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  SortAsc,
  SortDesc,
  Phone,
  Mail,
  Clock,
  Star,
  Trophy,
  Music
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-50 text-amber-600' },
  { value: 'cancelled', label: 'Archived', color: 'bg-rose-50 text-rose-600' },
];

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: CheckCircle2 };
    case 'pending':
      return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200/50', icon: AlertCircle };
    case 'cancelled':
      return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200/50', icon: XCircle };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200/50', icon: AlertCircle };
  }
};

export default function ClientRequestsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>}>
      <ClientRequestsContent />
    </Suspense>
  );
}

function ClientRequestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const replyId = searchParams?.get('reply');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Custom Email State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('Update on your Magnevents Request');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const ITEMS_PER_PAGE = 10;
  const { toast } = useToast();

  const fetchRequests = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {

      let query = (supabase
        .from('bookings') as any)
        .select('*, artists(id, name, alias, category, city, price_min, price_max, is_trending, is_artist_of_month, artist_images!fk_artist_id(image_url))')
        .eq('booking_source', 'client')

        .not('status', 'in', '("confirmed","completed")');

      if (searchQuery) {
        query = query.or(
          `client_name.ilike.%${searchQuery}%,client_email.ilike.%${searchQuery}%,event_type.ilike.%${searchQuery}%,venue.ilike.%${searchQuery}%`
        );
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load requests.',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, sortBy, sortOrder, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchRequests]);

  // Auto-open email modal if reply param is present
  useEffect(() => {
    if (replyId && requests.length > 0) {
      const req = requests.find(r => r.id === replyId);
      if (req) {
        setSelectedRequest(req);
        setEmailSubject('Update on your Magnevents Request');
        setEmailMessage('');
        setEmailModalOpen(true);
        // Clean up the URL
        router.replace('/dashboard/requests', { scroll: false });
      }
    }
  }, [replyId, requests, router]);

  const totalPages = Math.max(1, Math.ceil(requests.length / ITEMS_PER_PAGE));
  const paginatedRequests = requests.slice(
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

      if (newStatus === 'confirmed' || newStatus === 'completed') {

        toast({ title: '✅ Confirmed!', description: 'Request acknowledged and moved to Bookings.' });
        setDetailOpen(false);
        setSelectedRequest(null);
      } else {
        toast({ title: 'Updated', description: `Request status updated to ${newStatus}.` });
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest({ ...selectedRequest, status: newStatus });
        }
      }
      fetchRequests();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleSendCustomEmail = async () => {
    if (!selectedRequest || !emailSubject || !emailMessage) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill in both subject and message.' });
      return;
    }
    
    setSendingEmail(true);
    try {
      const res = await fetch('/api/send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedRequest.id,
          to: selectedRequest.client_email,
          subject: emailSubject,
          message: emailMessage,
        })
      });

      if (!res.ok) throw new Error('Failed to send email');

      toast({ title: 'Email Sent!', description: 'Your custom reply has been dispatched to the client.' });
      setEmailModalOpen(false);
      setDetailOpen(false);
      fetchRequests();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Send Failed', description: err.message });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      const { error } = await (supabase.from('bookings') as any).delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Request has been removed.' });
      setDetailOpen(false);
      fetchRequests();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-10 -mt-4 sm:-mt-6 lg:-mt-8 xl:-mt-10 px-4 sm:px-6 lg:px-8 xl:px-10 pt-8 pb-8 bg-gradient-to-b from-slate-50 to-transparent border-b border-white mb-2 text-center sm:text-left">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Client Inquiries</h1>
            <p className="text-sm font-medium text-slate-500">Incoming requests from the client website. Acknowledge to move them to Bookings.</p>
          </div>

        <div className="flex flex-col space-y-3">
          <div className="relative group w-full">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400 group-focus-within:text-sky-600 transition-colors" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Search by client name, email, or artist..."
              className="w-full pl-16 pr-14 h-14 rounded-[22px] border border-slate-100 bg-white shadow-sm text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-8 focus:ring-sky-600/5 focus:border-sky-200 transition-all"
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
                      ? "bg-white text-sky-600 shadow-sm border border-slate-100"
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
                  className="text-[12px] font-black text-slate-700 bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-sky-600 transition-colors uppercase pr-6"
                >
                  <option value="created_at">Submission</option>
                  <option value="event_date">Event Date</option>
                  <option value="budget">Budget</option>
                  <option value="client_name">Client</option>
                </select>
              </div>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-10 h-10 rounded-[16px] flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-sky-600 hover:border-sky-100 transition-all shadow-sm active:scale-90"
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
             <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Inquiries...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <CalendarCheck size={48} className="text-slate-200" />
            <p className="text-lg font-bold text-slate-400">No inquiries found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedRequests.map((request) => {
              const status = getStatusBadge(request.status);
              const SIcon = status.icon;
              return (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 hover:bg-white hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 cursor-pointer group rounded-[20px] mb-2 border border-transparent hover:border-slate-100"
                  onClick={() => { setSelectedRequest(request); setDetailOpen(true); }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100 shadow-inner flex-shrink-0">
                       <User size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-black text-slate-900 text-[15px] truncate tracking-tight">{request.client_name}</p>
                          <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border", status.bg, status.text, status.border || "border-transparent")}>
                            {request.status}
                          </span>
                       </div>
                       <p className="text-[12px] font-bold text-slate-400 flex items-center gap-2 truncate">
                         {request.client_email}
                       </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-10 sm:px-12 sm:border-x sm:border-slate-100">
                    <div className="min-w-[220px]">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Artist</p>
                       <p className="text-[16px] font-black text-slate-900 truncate mb-1.5 tracking-tight">{request.artists?.name || 'Any Artist'}</p>
                       <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
                            {request.artists?.category || 'General'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {request.artists?.is_artist_of_month && (
                              <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-sm" title="Artist of the Month">
                                <Music size={12} />
                              </div>
                            )}
                            {request.artists?.is_trending ? (
                              <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-sm" title="Popular Artist">
                                <Star size={12} fill="currentColor" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center shadow-sm" title="Standard Artist">
                                <User size={12} />
                              </div>
                            )}
                          </div>
                       </div>
                    </div>
                    <div className="min-w-[140px]">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Budget Evaluation</p>
                       <div className="flex items-center gap-3">
                         <span className="text-[16px] font-black text-slate-900 tracking-tight">₹{request.budget?.toLocaleString()}</span>
                         {request.artists && (
                            (() => {
                              const inRange = request.budget >= (request.artists.price_min || 0) && request.budget <= (request.artists.price_max || Infinity);
                              return (
                                <span className={cn(
                                   "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider",
                                   inRange ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                )}>
                                  {inRange ? "Fit" : "Low"}
                                </span>
                              );
                            })()
                         )}
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-sky-600 hover:border-sky-200 transition-all shadow-sm">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          {selectedRequest && (
            <>
              <div className="bg-slate-900 p-8 text-white relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                 <DialogTitle className="text-2xl font-black mb-1">Inquiry Details</DialogTitle>
                 <DialogDescription className="text-slate-400 font-medium font-display">Manage the client's direct booking request.</DialogDescription>
              </div>

              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Client Contact</p>
                       <p className="text-sm font-bold text-slate-900 mb-1">{selectedRequest.client_name}</p>
                       <p className="text-xs text-slate-500 flex items-center gap-2 mb-1"><Mail size={12} /> {selectedRequest.client_email}</p>
                       <p className="text-xs text-slate-500 flex items-center gap-2"><Phone size={12} /> {selectedRequest.client_phone || 'N/A'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Artist Selection</p>
                       <p className="text-sm font-bold text-slate-900 mb-1">{selectedRequest.artists?.name || 'Any Available'}</p>
                       <p className="text-xs text-sky-600 font-bold uppercase tracking-wider">{selectedRequest.artists?.category || 'General'}</p>
                    </div>
                 </div>

                 <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Calendar size={14} /> Event Info</h3>
                    <div className="grid grid-cols-2 gap-y-4">
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Type</p>
                          <p className="text-sm font-bold text-slate-700">{selectedRequest.event_type || 'N/A'}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date & Time</p>
                          <p className="text-sm font-bold text-slate-700">{selectedRequest.event_date} {selectedRequest.event_time}</p>
                       </div>
                       <div className="col-span-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Venue</p>
                          <p className="text-xs font-medium text-slate-600 flex items-center gap-2"><MapPin size={12} /> {selectedRequest.venue || 'TBD'}</p>
                       </div>
                    </div>
                 </div>

                 {selectedRequest.notes && (
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                       <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Client Message</p>
                       <p className="text-[13px] text-slate-700 font-medium leading-relaxed italic">"{selectedRequest.notes}"</p>
                    </div>
                 )}

                 <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEmailSubject('Update on your Magnevents Request');
                        setEmailMessage('');
                        setDetailOpen(false);
                        setEmailModalOpen(true);
                      }}
                      className="px-6 h-11 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      <Mail size={16} /> <span>Custom Reply</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'confirmed')}
                      className="px-6 h-11 rounded-xl bg-sky-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-sky-700 transition-all"
                    >
                      ✅ Confirm &amp; Move to Bookings
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'cancelled')}
                      className="px-6 h-11 rounded-xl bg-white border border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-rose-500 hover:border-rose-200 transition-all"
                    >
                      Archive / Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(selectedRequest.id)}
                      className="ml-auto p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          {selectedRequest && (
            <>
              <div className="bg-indigo-900 p-8 text-white relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                 <DialogTitle className="text-2xl font-black mb-1">Custom Reply</DialogTitle>
                 <DialogDescription className="text-indigo-200 font-medium font-display">Send a custom email directly to {selectedRequest.client_name}.</DialogDescription>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">To</label>
                  <input type="text" disabled value={selectedRequest.client_email} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Subject</label>
                  <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Message</label>
                  <textarea rows={6} value={emailMessage} onChange={e => setEmailMessage(e.target.value)} placeholder="Type your custom email here..." className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button onClick={() => setEmailModalOpen(false)} className="px-6 h-11 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSendCustomEmail} disabled={sendingEmail} className="px-6 h-11 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    {sendingEmail ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Mail size={16} /> Send Email</>}
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

