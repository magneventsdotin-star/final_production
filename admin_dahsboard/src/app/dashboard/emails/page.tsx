"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Search, RefreshCw, Eye, Calendar, Clock, X, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function EmailsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>}>
      <EmailsContent />
    </Suspense>
  );
}

function EmailsContent() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterType, setFilterType] = useState('all');
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('emails')
        .select('*, bookings(client_name)')
        .order('sent_at', { ascending: sortOrder === 'asc' });

      if (filterType !== 'all') {
        query = query.eq('email_type', filterType);
      }

      if (searchQuery) {
        query = query.or(`recipient_email.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,email_type.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEmails(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load emails.',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortOrder, filterType, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmails();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchEmails]);

  const handleDeleteSingle = async () => {
    if (!selectedEmail) return;
    try {
      const { error } = await supabase.from('emails').delete().eq('id', selectedEmail.id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Email log has been removed.' });
      setDeleteModalOpen(false);
      setModalOpen(false);
      fetchEmails();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDeleteAll = async () => {
    try {
      const { error } = await supabase.from('emails').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // hack to delete all since without a filter it might fail RLS or standard deletes sometimes
      if (error) throw error;
      toast({ title: 'Cleared', description: 'All email logs have been deleted.' });
      setDeleteModalOpen(false);
      setModalOpen(false);
      fetchEmails();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const getEmailTypeColor = (type: string) => {
    switch (type) {
      case 'custom': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'confirm':
      case 'approve': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'reject': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'unavailable': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'more_info': return 'bg-sky-50 text-sky-600 border-sky-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Email Logs</h1>
          <p className="text-sm font-medium text-slate-500">View all automated and custom emails sent by the system.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 cursor-pointer outline-none"
            >
              <option value="all">All Types</option>
              <option value="client_inquiry">Client Inquiry</option>
              <option value="confirm">Confirmed</option>
              <option value="approve">Approved</option>
              <option value="reject">Rejected</option>
              <option value="unavailable">Unavailable</option>
              <option value="more_info">More Info</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="text-xs font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 cursor-pointer outline-none"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
          <button
            onClick={fetchEmails}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="relative group w-full max-w-md">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by email, subject, or type..."
          className="w-full pl-12 pr-4 h-11 rounded-xl border border-slate-200 bg-white shadow-sm text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="luxe-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Logs...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <Mail size={48} className="text-slate-300" />
            <p className="text-lg font-bold text-slate-400">No emails found</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {emails.map((email, index) => {
              const dateStr = format(new Date(email.sent_at), 'MMM d, yyyy');
              const prevDateStr = index > 0 ? format(new Date(emails[index - 1].sent_at), 'MMM d, yyyy') : null;
              const showHeader = dateStr !== prevDateStr;

              return (
                <div key={email.id} className="flex flex-col">
                  {showHeader && (
                    <div className="bg-slate-100/80 backdrop-blur-sm px-6 py-2 text-xs font-bold text-slate-600 uppercase tracking-widest sticky top-0 z-10 shadow-sm border-b border-slate-200 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      {dateStr}
                    </div>
                  )}
                  <div
                    onClick={() => { setSelectedEmail(email); setModalOpen(true); }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors bg-white border-b border-slate-100 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                      <Mail size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {email.subject}
                        </p>
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", getEmailTypeColor(email.email_type))}>
                          {email.email_type}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", 
                          email.status === 'failed' ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"
                        )}>
                          {email.status || 'sent'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                        <span className="truncate">To: {email.recipient_email}</span>
                        {email.bookings?.client_name && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="truncate">Client: {email.bookings.client_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-500 flex items-center justify-end gap-1.5 font-medium">
                        <Clock size={12} className="text-slate-400" />
                        {format(new Date(email.sent_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl rounded-[24px] shadow-2xl p-0 overflow-hidden bg-slate-50 border-none">
          {selectedEmail && (
            <div className="flex flex-col h-[80vh]">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-start flex-shrink-0">
                <div>
                  <DialogTitle className="text-xl font-black mb-2">{selectedEmail.subject}</DialogTitle>
                  <DialogDescription className="text-slate-400 text-sm font-medium flex flex-wrap items-center gap-3">
                    <span>To: <span className="text-white">{selectedEmail.recipient_email}</span></span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>Sent: <span className="text-white">{format(new Date(selectedEmail.sent_at), 'PPP at p')}</span></span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", getEmailTypeColor(selectedEmail.email_type))}>
                      {selectedEmail.email_type}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", 
                      selectedEmail.status === 'failed' ? "bg-red-500/20 text-red-200 border-red-500/30" : "bg-green-500/20 text-green-200 border-green-500/30"
                    )}>
                      {selectedEmail.status || 'sent'}
                    </span>
                  </DialogDescription>
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-white">
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {/* Using dangerouslySetInnerHTML because we store the raw HTML of the email */}
                  <div 
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }} 
                    className="w-full"
                    style={{ minHeight: '300px' }}
                  />
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between flex-shrink-0">
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white relative text-center">
            <div className="mx-auto w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={32} className="text-rose-500" />
            </div>
            <DialogTitle className="text-2xl font-black mb-2">Delete Options</DialogTitle>
            <DialogDescription className="text-slate-300 font-medium">
              Would you like to delete just this email log or clear all logs entirely?
            </DialogDescription>
          </div>
          <div className="p-8 bg-slate-50 flex flex-col gap-3">
            <button onClick={handleDeleteSingle} className="w-full h-11 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
              <Trash2 size={16} /> Delete This Log
            </button>
            <button onClick={() => { if(confirm('Are you absolutely sure you want to delete ALL email logs? This cannot be undone.')) handleDeleteAll(); }} className="w-full h-11 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              <AlertCircle size={16} /> Clear All Logs
            </button>
            <button onClick={() => setDeleteModalOpen(false)} className="mt-2 w-full h-11 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
