"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Plus,
  MessageSquare,
  History,
  Info,
  Loader2,
  X,
  FileText,
  Trash2
, ArrowLeft, CalendarCheck, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// We will fetch requests from Supabase now

export default function TeamRequestsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [conflictingArtist, setConflictingArtist] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

  // New Request Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('Content Update');
  const [newPriority, setNewPriority] = useState('Medium');

  // Export State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState<'select' | 'range' | 'single' | 'today' | 'all'>('select');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportSingleDate, setExportSingleDate] = useState('');
  const [exportFilterType, setExportFilterType] = useState('all');

  // Comment State
  const [newComment, setNewComment] = useState('');
  
  // Reviewer State
  const [reviewerReply, setReviewerReply] = useState('');
  const [autoInsert, setAutoInsert] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('duplicate_approvals')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: pricingData, error: pricingError } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('pending_approval', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (pricingError) throw pricingError;

      let allFormatted: any[] = [];

      if (data) {
        const formatted = data.map((d: any) => ({
          id: d.id,
          title: `Duplicate ${d.field_name === 'phone_no' ? 'Phone' : 'Alias'} Approval`,
          description: `Requested to use ${d.field_name}: ${d.field_value}. Reason: ${d.reason}`,
          type: 'Validation Override',
          priority: 'High',
          status: d.status || 'pending',
          draft_data: d.draft_data,
          field_name: d.field_name,
          field_value: d.field_value,
          submittedBy: { name: d.requested_by, role: 'Editor', email: d.requested_by },
          createdAt: d.created_at,
          history: [
            { action: 'Created', user: d.requested_by, timestamp: d.created_at, comment: d.reason }
          ],
          comments: []
        }));
        allFormatted = [...allFormatted, ...formatted];
      }

      if (pricingData) {
         const pricingFormatted = pricingData.map((d: any) => ({
          id: `pricing-${d.id}`,
          originalId: d.id,
          isPricingPlan: true,
          title: `Pricing Plan Approval: ${d.name}`,
          description: `Requested to publish pricing plan: ${d.name} for ₹${d.price}.`,
          type: 'Content Update',
          priority: 'High',
          status: 'pending',
          draft_data: d,
          field_name: 'pricing_plan',
          field_value: d.name,
          submittedBy: { name: 'Editor', role: 'Editor', email: 'editor@magnevents.in' },
          createdAt: d.created_at,
          history: [
            { action: 'Submitted', user: 'Editor', timestamp: d.created_at, comment: 'Submitted pricing plan for review.' }
          ],
          comments: []
        }));
        allFormatted = [...allFormatted, ...pricingFormatted];
      }

      allFormatted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(allFormatted);
    } catch (err) {
      console.error('Error fetching duplicate approvals:', err);
    }
  };

  useEffect(() => {
    const fetchUserAndRequests = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (user) {
          setCurrentUser(user);
          const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL?.toLowerCase();
          if (user.email && superAdminEmail && user.email.toLowerCase() === superAdminEmail) {
            setUserRole('super_admin');
          } else {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, full_name')
              .eq('id', user.id)
              .single();
            setUserRole((profile as any)?.role || 'admin');
            setCurrentUser({ ...user, full_name: (profile as any)?.full_name });
          }
        }
        await fetchRequests();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndRequests();
  }, []);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'approved': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle2, label: 'Approved' };
      case 'rejected': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: XCircle, label: 'Rejected' };
      case 'in_review': return { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200', icon: Clock, label: 'In Review' };
      default: return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: AlertCircle, label: 'Pending' };
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      id: `REQ-${new Date().getFullYear()}-00${requests.length + 1}`,
      title: newTitle,
      description: newDesc,
      type: newType,
      priority: newPriority,
      status: 'pending',
      submittedBy: { 
        name: currentUser?.full_name || 'Current User', 
        role: userRole === 'super_admin' ? 'Super Admin' : 'Editor', 
        email: currentUser?.email 
      },
      createdAt: new Date().toISOString(),
      history: [
        { action: 'Created', user: currentUser?.full_name || 'Current User', timestamp: new Date().toISOString(), comment: '' }
      ],
      comments: []
    };

    setRequests([newReq, ...requests]);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewDesc('');
    toast({ title: 'Request Created', description: 'Your request has been submitted for review.' });

    // Send Email Notification
    try {
      await fetch('/api/send-approval-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newReq.id,
          type: 'duplicate_approval',
          title: newReq.title,
          description: newReq.description,
          submittedBy: newReq.submittedBy.name,
          previewLink: `${window.location.origin}/dashboard/team-requests`
        })
      });
    } catch (err) {
      console.error("Failed to send email notification", err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const userName = currentUser?.full_name || currentUser?.email || 'Super Admin';

      // Auto-insert artist if approved and draft data exists AND the user chose to auto-insert
      if (newStatus === 'approved' && selectedRequest?.draft_data && autoInsert) {
        const values = selectedRequest.draft_data;
        const artistData = {
          name: values.name,
          alias: values.alias,
          category: values.category,
          sub_category: values.sub_categories?.join(', '),
          sub_categories: values.sub_categories,
          performing_language: values.languages?.join(', '),
          languages: values.languages,
          bio: values.bio,
          price_min: parseInt(values.price_min),
          price_max: parseInt(values.price_max),
          original_price: values.original_price ? parseInt(values.original_price) : null,
          exclusive_price: values.exclusive_price ? parseInt(values.exclusive_price) : null,
          price_range: `${parseInt(values.price_min)}-${parseInt(values.price_max)}`,
          city: values.city,
          state: values.state,
          locality: values.locality,
          address: values.address,
          contact_person: values.contact_person,
          phone_no: values.phone_no,
          phone_no_alt: values.phone_no_alt || null,
          email: values.email,
          is_trending: values.spotlight_status === 'trending',
          is_featured: values.spotlight_status === 'featured',
          is_artist_of_month: values.is_artist_of_month,
          is_live: values.is_live,
          rating: parseFloat(values.rating || '5.0'),
          members_min: parseInt(values.members_min || '1'),
          members_max: parseInt(values.members_max || '1'),
          performance_duration: values.performance_duration || null,
          successful_bookings: parseInt(values.successful_bookings || '0'),
          video_url: values.video_urls?.filter(Boolean).join(', ') || null,
        };

        const { data: artist, error: artistError } = await (supabase
          .from('artists') as any)
          .insert([artistData])
          .select()
          .single();

        if (artistError) throw artistError;

        const images = values.images || [];
        if (images.length > 0) {
          let finalImages = [...images];
          if (values.cover_image_url && finalImages.includes(values.cover_image_url)) {
            finalImages = [
              values.cover_image_url,
              ...finalImages.filter((url: string) => url !== values.cover_image_url)
            ];
          }

          const imageEntries = finalImages.map((url: string) => ({
            artist_id: artist.id,
            image_url: url
          }));
          const { error: imageError } = await (supabase.from('artist_images') as any).insert(imageEntries);
          if (imageError) throw imageError;
        }
      }

      if (selectedRequest?.isPricingPlan) {
        const { error } = await (supabase
          .from('pricing_plans') as any)
          .update({
            is_live: newStatus === 'approved',
            pending_approval: false
          })
          .eq('id', selectedRequest.originalId);

        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from('duplicate_approvals') as any)
          .update({
            status: newStatus,
            approved_by: userName,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      }
      
      setRequests(prev => prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, status: newStatus };
          updated.history.push({
            action: `Status changed to ${getStatusConfig(newStatus).label}`,
            user: userName,
            timestamp: new Date().toISOString(),
            comment: reviewerReply || ''
          });
          if (reviewerReply) {
            updated.comments.push({
              user: userName,
              text: reviewerReply,
              timestamp: new Date().toISOString()
            });
          }
          if (selectedRequest?.id === id) setSelectedRequest(updated);
          return updated;
        }
        return r;
      }));
      setReviewerReply('');
      toast({ title: 'Status Updated', description: `Request has been marked as ${getStatusConfig(newStatus).label}.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
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
      
      let query = supabase.from('duplicate_approvals').select('*').gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
      if (exportFilterType !== 'all') {
         query = query.eq('status', exportFilterType);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: 'No approvals found for this range.' });
        return;
      }
      const { exportToExcel } = await import('@/lib/exportExcel');
      const exportData = data.map((r: any, index: number) => ({
        'S.No': index + 1,
        'Field Name': r.field_name || 'N/A',
        'Field Value': r.field_value || 'N/A',
        'Requested By': r.requested_by || 'N/A',
        'Reason': r.reason || 'N/A',
        'Status': r.status || 'N/A',
        'Approved By': r.approved_by || 'N/A',
        'Date': r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : 'N/A',
      }));
      await exportToExcel(exportData, `Admin_Approvals_${exportStartDate}_to_${exportEndDate}`, 'Admin Approvals');
      setExportModalOpen(false);
      setExportMode('select');
      toast({ title: 'Downloaded!', description: 'Approvals exported successfully.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export Error', description: err.message });
    }
  };

  const handleExportTodayData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let query = supabase.from('duplicate_approvals').select('*').gte('created_at', today.toISOString()).lt('created_at', tomorrow.toISOString());
      if (exportFilterType !== 'all') {
         query = query.eq('status', exportFilterType);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: 'No approvals found for today.' });
        return;
      }
      const { exportToExcel } = await import('@/lib/exportExcel');
      const exportData = data.map((r: any, index: number) => ({
        'S.No': index + 1,
        'Field Name': r.field_name || 'N/A',
        'Field Value': r.field_value || 'N/A',
        'Requested By': r.requested_by || 'N/A',
        'Reason': r.reason || 'N/A',
        'Status': r.status || 'N/A',
        'Approved By': r.approved_by || 'N/A',
        'Date': r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : 'N/A',
      }));
      const dateStr = format(today, 'yyyy-MM-dd');
      await exportToExcel(exportData, `Admin_Approvals_Today_${dateStr}`, 'Admin Approvals');
      setExportModalOpen(false);
      setExportMode('select');
      toast({ title: 'Downloaded!', description: "Today's approvals exported successfully." });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export Error', description: err.message });
    }
  };

  const handleExportAllData = async () => {
    try {
      let query = supabase.from('duplicate_approvals').select('*');
      if (exportFilterType !== 'all') {
         query = query.eq('status', exportFilterType);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: 'No approvals found.' });
        return;
      }
      const { exportToExcel } = await import('@/lib/exportExcel');
      const exportData = data.map((r: any, index: number) => ({
        'S.No': index + 1,
        'Field Name': r.field_name || 'N/A',
        'Field Value': r.field_value || 'N/A',
        'Requested By': r.requested_by || 'N/A',
        'Reason': r.reason || 'N/A',
        'Status': r.status || 'N/A',
        'Approved By': r.approved_by || 'N/A',
        'Date': r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : 'N/A',
      }));
      await exportToExcel(exportData, `Admin_Approvals_All_Data`, 'Admin Approvals');
      setExportModalOpen(false);
      setExportMode('select');
      toast({ title: 'Downloaded!', description: 'All approvals exported successfully.' });
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
      
      let query = supabase.from('duplicate_approvals').select('*').gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
      if (exportFilterType !== 'all') {
         query = query.eq('status', exportFilterType);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: 'No approvals found for this day.' });
        return;
      }
      const { exportToExcel } = await import('@/lib/exportExcel');
      const exportData = data.map((r: any, index: number) => ({
        'S.No': index + 1,
        'Field Name': r.field_name || 'N/A',
        'Field Value': r.field_value || 'N/A',
        'Requested By': r.requested_by || 'N/A',
        'Reason': r.reason || 'N/A',
        'Status': r.status || 'N/A',
        'Approved By': r.approved_by || 'N/A',
        'Date': r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : 'N/A',
      }));
      await exportToExcel(exportData, `Admin_Approvals_${format(start, 'yyyy-MM-dd')}`, 'Admin Approvals');
      toast({ title: 'Downloaded!', description: `Approvals for ${dateStr} exported successfully.` });
      setExportModalOpen(false);
      setExportMode('select');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export Error', description: err.message });
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this request? This action cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('duplicate_approvals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRequests(prev => prev.filter(r => r.id !== id));
      setIsDetailOpen(false);
      setSelectedRequest(null);
      toast({ title: 'Request Deleted', description: 'The request has been permanently deleted.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedRequest) return;
    const userName = currentUser?.full_name || (userRole === 'super_admin' ? 'Super Admin' : 'Editor');
    
    setRequests(prev => prev.map(r => {
      if (r.id === selectedRequest.id) {
        const updated = { ...r };
        updated.comments.push({
          user: userName,
          text: newComment,
          timestamp: new Date().toISOString()
        });
        updated.history.push({
          action: 'Added Comment',
          user: userName,
          timestamp: new Date().toISOString(),
          comment: newComment
        });
        setSelectedRequest(updated);
        return updated;
      }
      return r;
    }));
    setNewComment('');
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const baseRequests = userRole === 'super_admin' 
    ? requests 
    : requests.filter(r => r.submittedBy.email === currentUser?.email);

  const displayRequests = baseRequests.filter(r => {
    if (activeTab === 'All') return true;
    return r.status.toLowerCase() === activeTab.toLowerCase();
  });

  const pendingCount = baseRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0">
        <div className="section-header">
          <span className="section-label">Workflow Management</span>
          <h1 className="section-title text-slate-900">Admin Approvals</h1>
          <p className="text-body mt-1 max-w-2xl font-medium">Manage and track admin approval workflows.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => { setExportMode('select'); setExportModalOpen(true); }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-sm shadow-emerald-200"
          >
            Export XLS
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#5B5AF7] hover:bg-[#4338CA] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-sm shadow-indigo-200"
          >
            <Plus size={16} strokeWidth={2.5} /> Create Request
          </button>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm shadow-indigo-100/50">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <AlertCircle size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-black text-indigo-900">Action Required</h3>
            <p className="text-xs font-bold text-indigo-600">You have {pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'} waiting for your approval.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200",
              activeTab === tab 
                ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                : "bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayRequests.length === 0 ? (
          <div className="luxe-card p-12 flex flex-col items-center justify-center text-center opacity-60">
             <GitPullRequest size={48} className="text-slate-300 mb-4" />
             <p className="text-lg font-bold text-slate-400">No requests found</p>
          </div>
        ) : (
          displayRequests.map((req, index) => {
            const dateStr = req.createdAt ? format(new Date(req.createdAt), 'MMM d, yyyy') : 'Unknown Date';
            const prevDateStr = index > 0 && displayRequests[index - 1].createdAt 
              ? format(new Date(displayRequests[index - 1].createdAt), 'MMM d, yyyy') 
              : null;
            const showHeader = dateStr !== prevDateStr;

            const s = getStatusConfig(req.status);
            const Icon = s.icon;
            return (
              <div key={req.id} className="flex flex-col">
                {showHeader && (
                  <div className="bg-slate-100/80 backdrop-blur-sm px-6 py-2 text-xs font-bold text-slate-600 uppercase tracking-widest sticky top-0 z-10 shadow-sm border-b border-slate-200 flex items-center justify-between mt-4 mb-2 first:mt-0 rounded-t-xl">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      Submitted: {dateStr}
                    </div>
                    <button 
                      onClick={() => handleExportDay(dateStr)}
                      className="flex items-center gap-2 text-[9px] font-black text-slate-500 hover:text-emerald-600 uppercase tracking-widest transition-colors bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 hover:border-emerald-200"
                    >
                      Export XLS
                    </button>
                  </div>
                )}
                <div 
                  onClick={async () => { 
                    setSelectedRequest(req); 
                    setIsDetailOpen(true); 
                    setConflictingArtist(null);
                    if (req.field_name && req.field_value) {
                      const { data } = await supabase.from('artists').select('id, name, alias').eq(req.field_name, req.field_value).single();
                      if (data) setConflictingArtist(data);
                    }
                  }}
                  className="luxe-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 cursor-pointer group mb-2 bg-white"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm shrink-0", s.bg, s.text, s.border)}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{req.id.split('-')[0]}...</span>
                        <h3 className="text-base font-black text-slate-900">{req.title}</h3>
                        <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border", s.bg, s.text, s.border)}>
                          {s.label}
                        </span>
                        {req.priority === 'Critical' && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-rose-500 text-white border-rose-600 animate-pulse">
                            Critical
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-500 line-clamp-1">{req.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-[11px] font-bold text-slate-400">
                        <span>By {req.submittedBy.name}</span>
                        <span>•</span>
                        <span>{format(new Date(req.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                        <span>•</span>
                        <span>{req.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 p-8 border border-slate-100 m-4">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <FileText size={20} className="text-indigo-600" /> New Request
            </h2>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Title</label>
                <input required type="text" value={newTitle} onChange={e=>setNewTitle(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" placeholder="E.g. Update pricing tier" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Description</label>
                <textarea required value={newDesc} onChange={e=>setNewDesc(e.target.value)} className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none" placeholder="Provide details for the reviewer..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Type</label>
                  <select value={newType} onChange={e=>setNewType(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none">
                    <option>Content Update</option>
                    <option>Pricing Change</option>
                    <option>Configuration</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Priority</label>
                  <select value={newPriority} onChange={e=>setNewPriority(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 h-12 rounded-xl bg-[#5B5AF7] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#4338CA] transition-all shadow-md">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {isDetailOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{selectedRequest.id.split('-')[0]}...</span>
                  <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border", getStatusConfig(selectedRequest.status).bg, getStatusConfig(selectedRequest.status).text, getStatusConfig(selectedRequest.status).border)}>
                    {getStatusConfig(selectedRequest.status).label}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{selectedRequest.title}</h2>
              </div>
                <div className="flex items-center gap-2">
                  {userRole === 'super_admin' && (
                    <button onClick={() => handleDeleteRequest(selectedRequest.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button onClick={() => setIsDetailOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-lg shadow-sm transition-colors">
                    <X size={18} />
                  </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              
              {/* Details Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Submitted By</p>
                  <p className="text-sm font-bold text-slate-900">{selectedRequest.submittedBy.name}</p>
                  <p className="text-xs text-slate-500">{selectedRequest.submittedBy.role}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Submission Date</p>
                  <p className="text-sm font-bold text-slate-900">{format(new Date(selectedRequest.createdAt), 'MMM dd, yyyy')}</p>
                  <p className="text-xs text-slate-500">{format(new Date(selectedRequest.createdAt), 'HH:mm a')}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</p>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-sm font-medium text-slate-600 leading-relaxed">
                  {selectedRequest.description}
                </div>
              </div>

              {/* Conflicting Profile Details */}
              {conflictingArtist && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-1.5"><AlertCircle size={14}/> Existing Conflicting Profile</p>
                  <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 shadow-sm text-sm">
                    <p className="font-bold text-slate-900">{conflictingArtist.name} <span className="text-slate-500 font-medium">({conflictingArtist.alias})</span></p>
                    <p className="text-xs text-slate-600 mt-1">This profile currently uses the requested {selectedRequest.field_name === 'phone_no' ? 'phone number' : 'alias'}.</p>
                  </div>
                </div>
              )}

              {/* Actions (Super Admin Only) */}
              {userRole === 'super_admin' && selectedRequest.status === 'pending' && (
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5"><Info size={14}/> Reviewer Actions</p>
                    {selectedRequest.draft_data && (
                      <button onClick={() => setIsDraftModalOpen(true)} className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors flex items-center gap-1">
                        <FileText size={12}/> View Draft Profile
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Approver Reply / Reason</label>
                    <textarea 
                      value={reviewerReply} 
                      onChange={e => setReviewerReply(e.target.value)} 
                      placeholder="Why is this being approved or rejected?"
                      className="w-full h-16 bg-white border border-indigo-100 rounded-xl p-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 transition-all resize-none"
                    />
                  </div>

                  {selectedRequest.draft_data && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={autoInsert} 
                        onChange={e => setAutoInsert(e.target.checked)}
                        className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-700">Automatically add profile to final Artists registry on approval</span>
                    </label>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')} className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] uppercase tracking-widest transition-colors shadow-sm">Approve</button>
                    <button onClick={() => handleUpdateStatus(selectedRequest.id, 'in_review')} className="flex-1 h-11 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] uppercase tracking-widest transition-colors shadow-sm">Mark In Review</button>
                    <button onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')} className="flex-1 h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-[11px] uppercase tracking-widest transition-colors shadow-sm">Reject</button>
                  </div>
                </div>
              )}

              {/* Comments & Audit Log */}
              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                  <History size={18} className="text-slate-400" /> Audit Log & Comments
                </h3>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100">
                  {selectedRequest.history.map((h: any, i: number) => (
                    <div key={i} className="relative flex items-start gap-4 z-10">
                      <div className="w-10 h-10 rounded-full bg-slate-50 border-4 border-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                        {h.action.includes('Approved') ? <CheckCircle2 size={16} className="text-emerald-500"/> :
                         h.action.includes('Rejected') ? <XCircle size={16} className="text-rose-500"/> :
                         h.action.includes('Comment') ? <MessageSquare size={14} className="text-sky-500"/> :
                         <Clock size={16}/>}
                      </div>
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-slate-900 text-sm">{h.user}</span>
                          <span className="text-[10px] font-bold text-slate-400">{format(new Date(h.timestamp), 'MMM dd, HH:mm')}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-500">{h.action}</p>
                        {h.comment && <p className="text-sm text-slate-600 mt-2 p-3 bg-slate-50 rounded-xl italic">"{h.comment}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Add Comment Input */}
            <div className="p-6 border-t border-slate-100 bg-white">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment or note..." 
                  className="flex-1 h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button 
                  onClick={handleAddComment}
                  className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Send
                </button>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* Draft Profile Modal */}
      {isDraftModalOpen && selectedRequest?.draft_data && (
        <div className="fixed inset-0 z-[60] flex justify-center items-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDraftModalOpen(false)} />
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
              <div>
                <h2 className="text-xl font-black text-slate-900">Draft Profile Review</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verify artist details before approval</p>
              </div>
              <button onClick={() => setIsDraftModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-lg shadow-sm transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Full Name</p>
                  <p className="text-sm font-bold text-slate-900">{selectedRequest.draft_data.name}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Alias</p>
                  <p className="text-sm font-bold text-slate-900">{selectedRequest.draft_data.alias}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Category</p>
                  <p className="text-sm font-bold text-slate-900">{selectedRequest.draft_data.category}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Pricing</p>
                  <p className="text-sm font-bold text-slate-900">₹{selectedRequest.draft_data.price_min} - ₹{selectedRequest.draft_data.price_max}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Management / Contact</p>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-700"><strong>Person:</strong> {selectedRequest.draft_data.contact_person}</p>
                    <p className="text-xs text-slate-700"><strong>Phone:</strong> {selectedRequest.draft_data.phone_no}</p>
                    <p className="text-xs text-slate-700"><strong>Email:</strong> {selectedRequest.draft_data.email}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Location</p>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-700"><strong>City:</strong> {selectedRequest.draft_data.city}</p>
                    <p className="text-xs text-slate-700"><strong>State:</strong> {selectedRequest.draft_data.state}</p>
                    <p className="text-xs text-slate-700"><strong>Address:</strong> {selectedRequest.draft_data.address}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Bio / Description</p>
                 <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedRequest.draft_data.bio}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={(open) => { setExportModalOpen(open); if(!open) setExportMode('select'); }}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          {exportMode !== 'select' && (
            <button 
              onClick={() => setExportMode('select')}
              className="absolute left-6 top-6 p-2 rounded-full hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="bg-emerald-600 p-8 text-white relative text-center">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} className="text-white" />
            </div>
            <DialogTitle className="text-2xl font-black mb-2">Export Approvals</DialogTitle>
            <DialogDescription className="text-emerald-100 font-medium">
              {exportMode === 'select' ? 'Select how you want to export admin approval data.' : 'Select the dates to download admin approval records.'}
            </DialogDescription>
          </div>
          <div className="p-8 bg-slate-50 flex flex-col gap-4">
            {exportMode === 'select' ? (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setExportMode('single')}
                  className="w-full h-14 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Clock size={18} /> Date Wise
                </button>
                <button 
                  onClick={() => setExportMode('range')}
                  className="w-full h-14 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <History size={18} /> Date Range Wise
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status Filter</label>
                  <select
                    value={exportFilterType}
                    onChange={(e) => setExportFilterType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <button 
                  onClick={handleExportRange}
                  className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  Download Range
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status Filter</label>
                  <select
                    value={exportFilterType}
                    onChange={(e) => setExportFilterType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
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
                  className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  Download Date
                </button>
              </>
            ) : exportMode === 'today' ? (
              <>
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status Filter</label>
                  <select
                    value={exportFilterType}
                    onChange={(e) => setExportFilterType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <button 
                  onClick={handleExportTodayData}
                  className="w-full h-11 rounded-xl bg-sky-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25"
                >
                  Download Today
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status Filter</label>
                  <select
                    value={exportFilterType}
                    onChange={(e) => setExportFilterType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <button 
                  onClick={handleExportAllData}
                  className="w-full h-11 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                >
                  Download All
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
