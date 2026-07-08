"use client";
import { useConfirm } from '@/components/ui/ConfirmProvider';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Loader2, CreditCard, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { CreatePricingModal } from '@/components/pricing/CreatePricingModal';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function PricingManagement() {
  const { confirmAction } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('admin');
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL?.toLowerCase();
        if (session.user.email?.toLowerCase() === superAdminEmail) {
          setUserRole('super_admin');
        } else {
          const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
          setUserRole((data as any)?.role || 'admin');
        }
      }
    };
    fetchUser();
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase.from('pricing_plans') as any)
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDelete = async (id: string, name: string) => {
    if (!await confirmAction('Admin Verification Required', `Are you sure you want to delete the "${name}" plan?`, 'danger')) return;
    try {
      const { error } = await (supabase.from('pricing_plans') as any).delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: `${name} package has been removed.` });
      fetchPlans();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete plan.' });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase.from('pricing_plans').update({ is_live: true, pending_approval: false }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Approved', description: 'Plan is now live.' });
      fetchPlans();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to approve plan.' });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0">
        <div className="section-header">
          <span className="section-label">Service Packages</span>
          <h1 className="section-title text-slate-900">
            Event Pricing
          </h1>
          <p className="text-body mt-1 max-w-2xl font-medium">Configure standard booking packages and feature lists.</p>
        </div>
        <button
          className="w-full sm:w-auto h-11 px-6 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200/50 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2"
          onClick={() => { setEditingPlan(null); setIsModalOpen(true); }}
        >
          <Plus size={16} strokeWidth={3} />
          Add Package
        </button>
      </div>

      <CreatePricingModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if(!open) setEditingPlan(null);
        }}
        onSuccess={fetchPlans}
        initialData={editingPlan}
        userRole={userRole}
      />

      <div className="luxe-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="pl-8 h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[25%]">Plan Name</TableHead>
                <TableHead className="h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[15%]">Price</TableHead>
                <TableHead className="h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[30%]">Key Points</TableHead>
                <TableHead className="h-14 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[10%]">Status</TableHead>
                <TableHead className="h-14 pr-8 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[20%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-200 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="opacity-40">
                      <CreditCard size={32} className="mx-auto mb-2" />
                      <p className="font-bold text-slate-400">No pricing plans found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-8 py-5">
                      <p className="font-bold text-slate-900 text-[16px]">{plan.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{plan.copy}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {plan.original_price && (
                          <span className="text-[12px] font-medium text-slate-400 line-through">₹{plan.original_price}</span>
                        )}
                        <span className="text-[14px] font-black text-slate-900">₹{plan.price}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.points?.slice(0, 2).map((p: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {p}
                          </span>
                        ))}
                        {plan.points?.length > 2 && <span className="text-[10px] text-slate-300 font-bold">+{plan.points.length - 2} more</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        {plan.pending_approval && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                            Pending Approval
                          </span>
                        )}
                        {plan.is_live ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            Live
                          </span>
                        ) : !plan.pending_approval && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Draft
                          </span>
                        )}
                        {plan.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                            Featured
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="pr-8">
                      <div className="flex items-center justify-center gap-2">
                        {plan.pending_approval && userRole === 'super_admin' && (
                          <button
                            onClick={() => handleApprove(plan.id)}
                            className="h-9 px-3 rounded-lg flex items-center justify-center bg-emerald-50 border border-emerald-200 hover:bg-emerald-500 hover:text-white text-emerald-600 transition-colors shadow-sm text-xs font-bold"
                          >
                            <CheckCircle2 size={14} className="mr-1" /> Approve
                          </button>
                        )}
                        <button
                          onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }}
                          className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-slate-100 hover:border-slate-900 hover:text-slate-900 text-slate-400 transition-colors shadow-sm"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id, plan.name)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-slate-100 hover:border-rose-500 hover:text-rose-500 text-slate-400 transition-colors shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
