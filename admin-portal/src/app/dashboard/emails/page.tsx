"use client";

import { useConfirm } from '@/components/ui/ConfirmProvider';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { supabase } from '@database/connection/supabase-admin';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Search, RefreshCw, Eye, Calendar, Clock, X, Trash2, AlertCircle, Download , ArrowLeft, CalendarCheck, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const formatExportData = (data: any[]) => {
  return data.map((e: any, index: number) => {
    // Replace <br> and <p> with newlines before stripping other HTML to preserve structure
    let bodyText = e.body ? e.body.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n') : '';
    bodyText = bodyText.replace(/<[^>]*>?/gm, '');
    
    // Clean up excessive newlines for the Email Body column
    const formattedEmailBody = bodyText.replace(/\n\s*\n/g, '\n\n').trim();
    
    let extractedName = '';
    let extractedPhone = '';
    let extractedEmail = '';
    let extractedCategory = '';
    let extractedPrice = '';
    let extractedPortfolio = '';
    let extractedBio = '';
    
    let eventType = '';
    let eventDate = '';
    let location = '';
    let requestedType = '';
    let budget = '';
    let message = '';
    
    const nameMatch = bodyText.match(/(?:Artist Name|Name)[\s]+([^\n\r]+)/i);
    if (nameMatch) extractedName = nameMatch[1].trim();
    
    const phoneMatch = bodyText.match(/Phone[\s]+([^\n\r]+)/i);
    if (phoneMatch) extractedPhone = phoneMatch[1].trim();
    
    const emailMatch = bodyText.match(/Email[\s]+([^\n\r]+)/i);
    if (emailMatch) extractedEmail = emailMatch[1].trim();
    
    const categoryMatch = bodyText.match(/Category[\s]+([^\n\r]+)/i);
    if (categoryMatch) extractedCategory = categoryMatch[1].trim();
    
    const priceMatch = bodyText.match(/Price[\s]+([^\n\r]+)/i);
    if (priceMatch) extractedPrice = priceMatch[1].trim();
    
    // Use negative lookahead so we don't match the "Portfolio & Socials" header
    // Also look for "Link" which was used in the previous email template
    const portfolioMatch = bodyText.match(/(?<!Request\s*)(?:Portfolio|Link)(?!\s*&)\s+([^\n\r]+)/i);
    if (portfolioMatch) {
      const val = portfolioMatch[1].trim();
      if (!val.includes('Custom Reply') && !val.includes('Portfolio')) {
        extractedPortfolio = val;
      }
    }
    
    const bioMatch = bodyText.match(/Bio\s*&\s*Experience[\s]+([\s\S]*?)(?=\s*(?:ARTIST REVIEW|QUICK ACTIONS|This email was generated|Sent securely|$))/i);
    if (bioMatch) extractedBio = bioMatch[1].trim().replace(/\s+/g, ' ');
    
    const eventTypeMatch = bodyText.match(/Event Type[\s]+([^\n\r]+)/i);
    if (eventTypeMatch) eventType = eventTypeMatch[1].trim();
    
    const eventDateMatch = bodyText.match(/Event Date[\s]+([^\n\r]+)/i);
    if (eventDateMatch) eventDate = eventDateMatch[1].trim();
    
    const locMatch = bodyText.match(/Location[\s]+([^\n\r]+)/i);
    if (locMatch) location = locMatch[1].trim();
    
    const reqTypeMatch = bodyText.match(/Requested Type[\s]+([^\n\r]+)/i);
    if (reqTypeMatch) requestedType = reqTypeMatch[1].trim();
    
    const budgetMatch = bodyText.match(/Budget[\s]+([^\n\r]+)/i);
    if (budgetMatch) budget = budgetMatch[1].trim();
    
    const msgMatch = bodyText.match(/(?:Additional Message|Message)[\s]+([\s\S]*?)(?=\s*(?:ARTIST REVIEW|QUICK ACTIONS|✨|📝|This email was generated|Sent securely|$))/i);
    if (msgMatch) message = msgMatch[1].trim().replace(/\s+/g, ' ');

    return {
      'S.No': index + 1,
      'Subject': e.subject || 'N/A',
      'Recipient': e.recipient_email || 'N/A',
      'Client': e.bookings?.client_name || 'N/A',
      'Type': e.email_type || 'N/A',
      'Status': e.status || 'N/A',
      'Sent At': e.sent_at ? new Date(e.sent_at).toLocaleString('en-IN') : 'N/A',
      'Extracted Name': extractedName,
      'Extracted Phone': extractedPhone,
      'Extracted Email': extractedEmail,
      'Extracted Category': extractedCategory,
      'Extracted Price': extractedPrice,
      'Extracted Portfolio': extractedPortfolio,
      'Extracted Bio': extractedBio,
      'Extracted Event Type': eventType,
      'Extracted Event Date': eventDate,
      'Extracted Location': location,
      'Extracted Requested Type': requestedType,
      'Extracted Budget': budget,
      'Extracted Message': message,
      'Full Email Body': formattedEmailBody.substring(0, 32000) || 'N/A',
    };
  });
};

export default function EmailsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>}>
      <EmailsContent />
    </Suspense>
  );
}

function EmailsContent() {
  const { confirmAction } = useConfirm();
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterType, setFilterType] = useState('all');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState<'select' | 'range' | 'single' | 'today' | 'all'>('select');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportSingleDate, setExportSingleDate] = useState('');
  const [exportFilterType, setExportFilterType] = useState('all');
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
      const { error } = await supabase.from('emails').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
      if (error) throw error;
      toast({ title: 'Cleared', description: 'All email logs have been deleted.' });
      setDeleteModalOpen(false);
      setModalOpen(false);
      fetchEmails();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDownloadSingle = () => {
    if (!selectedEmail) return;
    const plainTextBody = selectedEmail.body ? selectedEmail.body.replace(/<[^>]*>?/gm, '').replace(/\n\s*\n/g, '\n\n') : 'No Content';
    
    const content = `Subject: ${selectedEmail.subject}
To: ${selectedEmail.recipient_email}
Date: ${new Date(selectedEmail.sent_at).toLocaleString()}
Type: ${selectedEmail.email_type}
Status: ${selectedEmail.status || 'sent'}
Client: ${selectedEmail.bookings?.client_name || 'N/A'}

--------------------------------------------------
EMAIL CONTENT
--------------------------------------------------

${plainTextBody}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Email_${selectedEmail.subject.substring(0,30).replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(selectedEmail.sent_at), 'yyyyMMdd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: 'Downloaded!', description: 'Email details downloaded successfully.' });
  };

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
      
      let query = supabase
        .from('emails')
        .select(`*, bookings(client_name)`)
        .gte('sent_at', start.toISOString())
        .lte('sent_at', end.toISOString())
        .order('sent_at', { ascending: false });
        
      if (exportFilterType !== 'all') {
        query = query.eq('email_type', exportFilterType);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: 'No emails found in this date range.' });
        return;
      }

      const { exportToExcel } = await import('@/lib/exportExcel');
      const exportData = formatExportData(data);
      
      await exportToExcel(exportData, `Emails_${exportStartDate}_to_${exportEndDate}`, 'Emails');
      toast({ title: 'Downloaded!', description: "Today's emails exported successfully." });
      setExportModalOpen(false);
      setExportMode('select');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export Error', description: err.message });
    }
  };

  const handleExportDay = async (dateStr: string, typeFilter = 'all') => {
    try {
      const dateObj = new Date(dateStr);
      const start = new Date(dateObj);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateObj);
      end.setHours(23, 59, 59, 999);
      
      let query = supabase
        .from('emails')
        .select(`*, bookings(client_name)`)
        .gte('sent_at', start.toISOString())
        .lte('sent_at', end.toISOString())
        .order('sent_at', { ascending: false });
        
      if (typeFilter !== 'all') {
        query = query.eq('email_type', typeFilter);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: 'No emails found for this date.' });
        return;
      }

      const { exportToExcel } = await import('@/lib/exportExcel');
      const exportData = formatExportData(data);
      
      const formattedDate = format(dateObj, 'yyyy-MM-dd');
      await exportToExcel(exportData, `Emails_${formattedDate}`, `Emails_${formattedDate}`);
      toast({ title: 'Downloaded!', description: `Emails for ${dateStr} exported successfully.` });
      setExportModalOpen(false);
      setExportMode('select');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export Error', description: err.message });
    }
  };

  const handleExportAllData = async () => {
    try {
      let query = supabase
        .from('emails')
        .select(`*, bookings(client_name)`)
        .order('sent_at', { ascending: false });
        
      if (exportFilterType !== 'all') {
        query = query.eq('email_type', exportFilterType);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: 'No emails found.' });
        return;
      }

      const { exportToExcel } = await import('@/lib/exportExcel');
      const exportData = formatExportData(data);
      
      await exportToExcel(exportData, `All_Emails_${new Date().toISOString().split('T')[0]}`, `All_Emails`);
      toast({ title: 'Downloaded!', description: `All emails exported successfully.` });
      setExportModalOpen(false);
      setExportMode('select');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export Error', description: err.message });
    }
  };

  const handleExportTodayData = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    await handleExportDay(todayStr, exportFilterType);
    setExportModalOpen(false);
    setExportMode('select');
  };

  const getEmailTypeColor = (type: string) => {
    switch (type) {
      case 'custom': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'confirm':
      case 'approve': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'reject': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'unavailable': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'more_info': return 'bg-sky-50 text-sky-600 border-sky-200';
      case 'artist_registration_inquiry': return 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200';
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
              <option value="artist_registration_inquiry">Artist Registration</option>
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
            onClick={() => { setExportMode('select'); setExportModalOpen(true); }}
            className="group h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-400 text-white text-[11px] font-black uppercase tracking-[0.1em] hover:shadow-lg hover:shadow-emerald-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
          >
            Export XLS
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
                    <div className="bg-slate-100/80 backdrop-blur-sm px-6 py-2 text-xs font-bold text-slate-600 uppercase tracking-widest sticky top-0 z-10 shadow-sm border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {dateStr}
                      </div>
                      <button 
                        onClick={() => handleExportDay(dateStr, filterType)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-emerald-600 transition-colors text-[10px] shadow-sm text-slate-500"
                      >
                        <Download size={12} />
                        Download XLS
                      </button>
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
          {exportMode !== 'select' && (
            <button 
              onClick={() => setExportMode('select')}
              className="absolute left-6 top-6 p-2 rounded-full hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
          )}

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
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadSingle}
                    className="px-6 py-2 bg-emerald-600 border border-emerald-500 rounded-xl text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Download size={16} /> Download Details
                  </button>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                  >
                    Close
                  </button>
                </div>
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
            <button onClick={async () => { if(await confirmAction('Admin Verification Required', 'Are you absolutely sure you want to delete ALL email logs? This cannot be undone.', 'danger')) handleDeleteAll(); }} className="w-full h-11 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              <AlertCircle size={16} /> Clear All Logs
            </button>
            <button onClick={() => setDeleteModalOpen(false)} className="mt-2 w-full h-11 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={exportModalOpen} onOpenChange={(open) => { setExportModalOpen(open); if(!open) setExportMode('select'); }}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-emerald-600 p-8 text-white relative text-center">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Download size={32} className="text-white" />
            </div>
            <DialogTitle className="text-2xl font-black mb-2">Export Emails</DialogTitle>
            <DialogDescription className="text-emerald-100 font-medium">
              {exportMode === 'select' ? 'Select how you want to export email data.' : 'Select the dates to download email details.'}
            </DialogDescription>
          </div>
          <div className="p-8 bg-slate-50 flex flex-col gap-4">
            {exportMode === 'select' ? (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setExportMode('single')}
                  className="w-full h-14 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Calendar size={18} /> Date Wise
                </button>
                <button 
                  onClick={() => setExportMode('range')}
                  className="w-full h-14 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Clock size={18} /> Date Range Wise
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Or</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
                  <input 
                    type="date" 
                    value={exportStartDate} 
                    onChange={e => setExportStartDate(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-2 mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Date</label>
                  <input 
                    type="date" 
                    value={exportEndDate} 
                    onChange={e => setExportEndDate(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Type Filter</label>
                  <select
                    value={exportFilterType}
                    onChange={(e) => setExportFilterType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="client_inquiry">Client Inquiry</option>
                    <option value="artist_registration_inquiry">Artist Registration</option>
                    <option value="confirm">Confirmed</option>
                    <option value="approve">Approved</option>
                    <option value="reject">Rejected</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="more_info">More Info</option>
                    <option value="custom">Custom</option>
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
                <div className="flex flex-col gap-2 mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Date</label>
                  <input 
                    type="date" 
                    value={exportSingleDate} 
                    onChange={e => setExportSingleDate(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Type Filter</label>
                  <select
                    value={exportFilterType}
                    onChange={(e) => setExportFilterType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="client_inquiry">Client Inquiry</option>
                    <option value="artist_registration_inquiry">Artist Registration</option>
                    <option value="confirm">Confirmed</option>
                    <option value="approve">Approved</option>
                    <option value="reject">Rejected</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="more_info">More Info</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <button 
                  onClick={() => {
                    if(!exportSingleDate) {
                       toast({ variant: 'destructive', title: 'Error', description: 'Please select a date.' });
                       return;
                    }
                    handleExportDay(exportSingleDate, exportFilterType);
                  }}
                  className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  <Download size={16} /> Download Date
                </button>
              </>
            ) : exportMode === 'today' ? (
              <>
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Type Filter</label>
                  <select
                    value={exportFilterType}
                    onChange={(e) => setExportFilterType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="client_inquiry">Client Inquiry</option>
                    <option value="artist_registration_inquiry">Artist Registration</option>
                    <option value="confirm">Confirmed</option>
                    <option value="approve">Approved</option>
                    <option value="reject">Rejected</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="more_info">More Info</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <button 
                  onClick={handleExportTodayData}
                  className="w-full h-11 rounded-xl bg-sky-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25"
                >
                  <Download size={16} /> Download Today
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Type Filter</label>
                  <select
                    value={exportFilterType}
                    onChange={(e) => setExportFilterType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="client_inquiry">Client Inquiry</option>
                    <option value="artist_registration_inquiry">Artist Registration</option>
                    <option value="confirm">Confirmed</option>
                    <option value="approve">Approved</option>
                    <option value="reject">Rejected</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="more_info">More Info</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <button 
                  onClick={handleExportAllData}
                  className="w-full h-11 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
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
              className="mt-1 w-full h-11 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              {exportMode === 'select' ? 'Cancel' : <><ArrowLeft size={16} /> Back to Options</>}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
