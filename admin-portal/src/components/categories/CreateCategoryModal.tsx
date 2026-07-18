"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from '@database/connection/supabase-admin';
import { useToast } from "@/hooks/use-toast";

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

export function CreateCategoryModal({ open, onOpenChange, onSuccess, initialData }: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    options: "",
    starting_price: "",
    image_url: "",
    query: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        label: initialData.label || "",
        options: initialData.options || "",
        starting_price: initialData.starting_price || "",
        image_url: initialData.image_url || "",
        query: initialData.query || ""
      });
    } else {
      setFormData({
        label: "",
        options: "",
        starting_price: "",
        image_url: "",
        query: ""
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData?.id) {
        const { error } = await (supabase.from('artist_categories') as any)
          .update(formData)
          .eq('id', initialData.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Category has been updated successfully." });
      } else {
        const { error } = await (supabase.from('artist_categories') as any)
          .insert([formData]);
        if (error) throw error;
        toast({ title: "Created", description: "New category has been added." });
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
            {initialData ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1">Configure artist discovery</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1">Label</label>
                <Input
                  required
                  placeholder="e.g. SINGER"
                  className="rounded-2xl border-slate-100 focus:ring-slate-900 h-12"
                  value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value, query: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1">URL Query</label>
                <Input
                  required
                  placeholder="e.g. singer"
                  className="rounded-2xl border-slate-100 focus:ring-slate-900 h-12 bg-slate-50"
                  value={formData.query}
                  onChange={e => setFormData({ ...formData, query: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1">Count Text</label>
                <Input
                  placeholder="e.g. 2,500+ Singers"
                  className="rounded-2xl border-slate-100 focus:ring-slate-900 h-12"
                  value={formData.options}
                  onChange={e => setFormData({ ...formData, options: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1">Starting Price</label>
                <Input
                  placeholder="e.g. 4,999/-"
                  className="rounded-2xl border-slate-100 focus:ring-slate-900 h-12"
                  value={formData.starting_price}
                  onChange={e => setFormData({ ...formData, starting_price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1">Cover Image URL</label>
              <div className="relative">
                <Input
                  required
                  placeholder="https://images.unsplash.com/..."
                  className="rounded-2xl border-slate-100 focus:ring-slate-900 h-12 pl-11"
                  value={formData.image_url}
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                />
                <imgIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}  />
              </div>
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (initialData ? 'Save Changes' : 'Create Category')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
