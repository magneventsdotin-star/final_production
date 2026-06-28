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

export default function ArtistRequestsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>}>
      <ArtistRequestsContent />
    </Suspense>
  );
}

function ArtistRequestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const replyId = searchParams?.get('reply');
  const actionType = searchParams?.get('action');
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
  const [emailActionStatus, setEmailActionStatus] = useState('pending');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;
  const { toast } = useToast();

  const fetchRequests = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {

      let query = (supabase
        .from('bookings') as any)
        .select('*, artists(id, name, alias, category, city, price_min, price_max, is_trending, is_artist_of_month, artist_images!fk_artist_id(image_url))')
        .eq('booking_source', 'client')
        .eq('event_type', 'Artist Registration')
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
        
        if (!actionType) {
          // Button 7: Just open details in dashboard
          setDetailOpen(true);
          router.replace('/dashboard/requests', { scroll: false });
          return;
        }

        let subject = 'Update on your Magnevents Request';
        let msg = '';
        let newActionStatus = 'pending';
        const artistName = req.artists?.name ? ` for ${req.artists.name}` : '';

        if (actionType === 'confirm' || actionType === 'approve') {
          subject = 'Your Magnevents Booking is Confirmed!';
          msg = `Great news! Your booking request${artistName} has been approved and confirmed by our team. We will reach out shortly with the final contract and next steps.`;
          newActionStatus = 'confirmed';
          if (req.event_type === 'Artist Registration') {
            subject = 'Welcome to Magnevents!';
            msg = `Your artist registration has been reviewed and approved by our team. Welcome aboard!`;
          }
        } else if (actionType === 'more_info') {
          subject = 'Magnevents - Action Required for your Request';
          msg = `Thank you for reaching out to Magnevents! We are reviewing your request, but we need a few more details to proceed. One of our specialists will call you shortly to discuss your specific needs.`;
        } else if (actionType === 'unavailable') {
          subject = 'Update regarding your Magnevents Booking';
          msg = `Thank you for your interest! Unfortunately, the requested artist is unavailable on your selected dates. However, we have several amazing alternative artists that fit your vibe and budget. Let us know when is a good time to call you to discuss options!`;
        } else if (actionType === 'reject') {
          subject = 'Update regarding your Magnevents Request';
          msg = `Thank you for reaching out to Magnevents. Unfortunately, we are unable to fulfill your request at this time. We apologize for the inconvenience and wish you the best for your event.`;
          newActionStatus = 'cancelled';
        } else if (actionType === 'custom') {
          subject = '';
          msg = '';
        }

        setEmailSubject(subject);
        setEmailMessage(msg);
        setEmailActionStatus(newActionStatus);
        
        if (['approve', 'unavailable', 'reject'].includes(actionType)) {
          setConfirmModalOpen(true);
        } else {
          setEmailModalOpen(true);
        }

        // Clean up the URL
        router.replace('/dashboard/requests', { scroll: false });
      }
    }
  }, [replyId, actionType, requests, router]);

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

  const handleInitiateSend = () => {
    if (!selectedRequest || !emailSubject || !emailMessage) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill in both subject and message.' });
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleSendCustomEmail = async () => {
    if (!selectedRequest || !emailSubject || !emailMessage) return;
    
    setSendingEmail(true);
    setConfirmModalOpen(false);
    try {
      const res = await fetch('/api/send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedRequest.id,
          to: selectedRequest.client_email,
          subject: emailSubject,
          message: emailMessage,
          newStatus: emailActionStatus,
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to send email');
      }

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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Artist Requests</h1>
            <p className="text-sm font-medium text-slate-500">Manage incoming artist registrations and onboarding requests.</p>
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

                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 sm:px-12 sm:border-x sm:border-slate-100 flex-1">
                    <div className="w-full sm:min-w-[220px]">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Registration Info</p>
                       <p className="text-[16px] font-black text-slate-900 truncate mb-1.5 tracking-tight">
                         {request.notes ? request.notes.split('\n').find((l: string) => l.startsWith('Category:'))?.split(': ')[1] || 'General' : 'General'}
                       </p>
                       <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
                            New Talent
                          </span>
                       </div>
                    </div>
                    <div className="w-full sm:min-w-[140px]">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Location</p>
                       <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                         <span className="text-[14px] font-bold text-slate-700 flex items-center gap-2"><MapPin size={14} /> {request.venue || 'TBD'}</span>
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
                 <DialogTitle className="text-2xl font-black mb-1">Artist Application Details</DialogTitle>
                 <DialogDescription className="text-slate-400 font-medium font-display">Review information submitted by the artist during registration.</DialogDescription>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 sm:col-span-1 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={14} /> Personal Information</p>
                       <div className="flex items-center gap-4 mb-4">
                         <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                           <User size={24} />
                         </div>
                         <div>
                           <p className="text-lg font-black text-slate-900">{selectedRequest.client_name}</p>
                           <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                             {selectedRequest.notes ? selectedRequest.notes.split('\n').find((l: string) => l.startsWith('Category:'))?.split(': ')[1] || 'Artist' : 'Artist'}
                           </p>
                         </div>
                       </div>
                       <div className="space-y-2">
                         <p className="text-xs text-slate-600 flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {selectedRequest.client_email}</p>
                         <p className="text-xs text-slate-600 flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {selectedRequest.client_phone || 'N/A'}</p>
                         <p className="text-xs text-slate-600 flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {selectedRequest.venue || 'N/A'}</p>
                       </div>
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Star size={14} /> Professional Information</p>
                       <div className="space-y-4">
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Portfolio / Website</p>
                           <a href={selectedRequest.notes ? selectedRequest.notes.split('\n').find((l: string) => l.startsWith('Portfolio:'))?.split(': ')[1] || '#' : '#'} target="_blank" className="text-sm font-bold text-sky-600 hover:underline truncate block">
                             {selectedRequest.notes ? selectedRequest.notes.split('\n').find((l: string) => l.startsWith('Portfolio:'))?.split(': ')[1] || 'Not Provided' : 'Not Provided'}
                           </a>
                         </div>
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bio / Experience</p>
                           <p className="text-xs text-slate-600 line-clamp-3">
                             {selectedRequest.notes ? selectedRequest.notes.split('\n').find((l: string) => l.startsWith('Bio:'))?.split(': ')[1] || 'No bio provided' : 'No bio provided'}
                           </p>
                         </div>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 border-dashed">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Uploaded Documents</p>
                      <p className="text-xs text-slate-500 italic">No documents uploaded with this request.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 border-dashed">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pricing & Availability</p>
                      <p className="text-xs text-slate-500 italic">Pricing details not provided during initial registration.</p>
                    </div>
                 </div>

                 <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Verification Section</p>
                    <textarea 
                      placeholder="Add internal notes about this artist verification..."
                      className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm text-slate-700 resize-none h-24 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    ></textarea>
                 </div>

                 <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEmailSubject('Magnevents - Action Required for your Request');
                        setEmailMessage('Thank you for reaching out to Magnevents! We are reviewing your registration, but we need a few more details to proceed.');
                        setDetailOpen(false);
                        setEmailModalOpen(true);
                      }}
                      className="px-6 h-11 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      <Mail size={16} /> <span>Request More Info</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'confirmed')}
                      className="px-6 h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all"
                    >
                      ✅ Approve Artist
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'cancelled')}
                      className="px-6 h-11 rounded-xl bg-white border border-rose-200 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition-all"
                    >
                      ❌ Reject
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
                  <button onClick={handleInitiateSend} disabled={sendingEmail} className="px-6 h-11 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    {sendingEmail ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Mail size={16} /> Send Email</>}
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white relative text-center">
            <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-amber-500" />
            </div>
            <DialogTitle className="text-2xl font-black mb-2">Confirm Action</DialogTitle>
            <DialogDescription className="text-slate-300 font-medium">
              Are you sure you want to send this email to {selectedRequest?.client_email}?
            </DialogDescription>
          </div>
          <div className="p-8 bg-slate-50 flex justify-center gap-4">
            <button onClick={() => setConfirmModalOpen(false)} className="px-6 h-11 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
              Cancel
            </button>
            <button onClick={handleSendCustomEmail} disabled={sendingEmail} className="px-6 h-11 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {sendingEmail ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Mail size={16} /> Yes, Send Email</>}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

