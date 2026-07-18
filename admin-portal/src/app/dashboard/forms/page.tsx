"use client";

import { useState, useEffect } from 'react';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { supabase } from '@database/connection/supabase-admin';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Link as LinkIcon, Send, Copy, ArrowRight, Loader2, FileText, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function FormsPage() {
  const { confirmAction } = useConfirm();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [clientEmail, setClientEmail] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchForms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_forms')
        .select(`
          *,
          custom_form_responses(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (err: any) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load forms' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (id: string) => {
    if (!await confirmAction('Admin Verification Required', 'Are you sure you want to delete this form? All associated fields and responses will also be deleted.', 'danger')) return;
    try {
      const { error } = await supabase.from('custom_forms').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Form deleted successfully' });
      fetchForms();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete form' });
    }
  };

  const handleCopyLink = (id: string) => {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://magnevents.in';
    const link = `${frontendUrl}/f/${id}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Copied!', description: 'Form link copied to clipboard' });
  };

  const handleSendEmail = async () => {
    if (!clientEmail || !selectedForm) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a client email address' });
      return;
    }

    setSending(true);
    try {
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://magnevents.in';
      const formLink = `${frontendUrl}/f/${selectedForm.id}`;
      
      const res = await fetch('/api/send-form-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: clientEmail,
          subject: `Action Required: Please complete the ${selectedForm.title}`,
          message: `Hello,\n\nPlease click the link below to securely complete our ${selectedForm.title}.\n\nYour prompt response will help us proceed quickly.\n\nThank you!`,
          actionLink: formLink,
          actionText: 'Open Secure Form'
        })
      });

      if (!res.ok) throw new Error('Failed to send email');

      toast({ title: 'Sent!', description: `Form sent successfully to ${clientEmail}` });
      setSendModalOpen(false);
      setClientEmail('');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Custom Forms</h1>
          <p className="text-sm font-medium text-slate-500">Create, manage, and send interactive forms to clients.</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/forms/create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create New Form
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 size={32} className="animate-spin mb-4 text-indigo-500" />
            <p className="font-bold uppercase tracking-widest text-xs">Loading Forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
            <ClipboardList size={48} className="mb-4 text-slate-300" strokeWidth={1} />
            <p className="font-bold text-lg text-slate-600 mb-2">No forms created yet</p>
            <p className="text-sm">Click "Create New Form" to get started.</p>
          </div>
        ) : (
          forms.map((form) => {
            const responseCount = form.custom_form_responses?.[0]?.count || 0;
            return (
              <div key={form.id} className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileText size={24} strokeWidth={2} />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Responses</span>
                    <p className="text-center font-black text-indigo-600 text-lg leading-none mt-1">{responseCount}</p>
                  </div>
                </div>
                
                <h3 className="font-black text-xl text-slate-900 mb-2 tracking-tight line-clamp-1">{form.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-grow">{form.description || 'No description provided.'}</p>
                
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button 
                    onClick={() => { setSelectedForm(form); setSendModalOpen(true); }}
                    className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={14} /> Send
                  </button>
                  <button 
                    onClick={() => handleCopyLink(form.id)}
                    className="w-full bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <LinkIcon size={14} /> Link
                  </button>
                  <button 
                    onClick={() => router.push(`/dashboard/forms/${form.id}`)}
                    className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 col-span-2 mt-1"
                  >
                    <ArrowRight size={14} /> View Responses
                  </button>
                  <button 
                    onClick={() => handleDelete(form.id)}
                    className="w-full bg-transparent text-rose-400 hover:text-rose-600 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 col-span-2"
                  >
                    <Trash2 size={14} /> Delete Form
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-indigo-900 p-8 text-white relative text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
              <Send size={28} className="text-indigo-200" />
            </div>
            <DialogTitle className="text-2xl font-black mb-1">Send to Client</DialogTitle>
            <DialogDescription className="text-indigo-200 font-medium">
              Email a secure link to "{selectedForm?.title}"
            </DialogDescription>
          </div>
          <div className="p-8 bg-slate-50 space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Client Email Address</label>
              <input 
                type="email" 
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" 
              />
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
              <p className="text-xs font-bold text-indigo-800 mb-1 flex items-center gap-2"><FileText size={14} /> Note</p>
              <p className="text-xs text-indigo-600/80 leading-relaxed">
                The client will receive a beautifully formatted email with a button to open the form directly on your website.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setSendModalOpen(false)} 
                className="px-6 h-11 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail} 
                disabled={sending} 
                className="px-6 h-11 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {sending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send Now</>}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
