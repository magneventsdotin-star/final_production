"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CreditCard, ListChecks } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

export function CreatePricingModal({ open, onOpenChange, onSuccess, initialData }: PricingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    copy: "",
    points: "",
    featured: false
  });
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        price: initialData.price || "",
        copy: initialData.copy || "",
        points: Array.isArray(initialData.points) ? initialData.points.join(', ') : (initialData.points || ""),
        featured: !!initialData.featured
      });
    } else {
      setFormData({
        name: "",
        price: "",
        copy: "",
        points: "",
        featured: false
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      points: formData.points.split(',').map(p => p.trim()).filter(p => p !== "")
    };

    try {
      if (initialData?.id) {
        const { error } = await (supabase.from('pricing_plans') as any)
          .update(payload)
          .eq('id', initialData.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Pricing plan updated." });
      } else {
        const { error } = await (supabase.from('pricing_plans') as any)
          .insert([payload]);
        if (error) throw error;
        toast({ title: "Created", description: "New pricing plan added." });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
            {initialData ? 'Edit Pricing Plan' : 'Add New Plan'}
          </DialogTitle>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1">Configure service packages</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1">Plan Name</label>
                <Input 
                  required
                  placeholder="e.g. Classic"
                  className="rounded-2xl border-slate-100 focus:ring-slate-900 h-12"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1">Starting Price (INR)</label>
                <div className="relative">
                  <Input 
                    required
                    placeholder="e.g. 49,999"
                    className="rounded-2xl border-slate-100 focus:ring-slate-900 h-12 pl-12"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1">Marketing Copy</label>
              <Input 
                placeholder="Hook sentence for this plan..."
                className="rounded-2xl border-slate-100 focus:ring-slate-900 h-12"
                value={formData.copy}
                onChange={e => setFormData({ ...formData, copy: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1">Key Features (comma separated)</label>
              <Textarea 
                placeholder="Solo singer, Basic sound, 2 blocks..."
                className="rounded-2xl border-slate-100 focus:ring-slate-900 min-h-[100px] py-3"
                value={formData.points}
                onChange={e => setFormData({ ...formData, points: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
               <input 
                 type="checkbox" 
                 id="feat-chk"
                 className="w-5 h-5 rounded-lg accent-slate-900"
                 checked={formData.featured}
                 onChange={e => setFormData({ ...formData, featured: e.target.checked })}
               />
               <label htmlFor="feat-chk" className="text-sm font-bold text-slate-700 cursor-pointer">Mark as 'Most Booked' (Featured)</label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
               type="button" 
               variant="ghost" 
               className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-widest text-xs"
               onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 rounded-2xl h-12 bg-slate-900 hover:bg-slate-800 font-bold uppercase tracking-widest text-xs shadow-lg shadow-slate-200"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (initialData ? 'Save Changes' : 'Create Plan')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
