"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Loader2, Grid2X2, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { CreateCategoryModal } from '@/components/categories/CreateCategoryModal';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function CategoryManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase.from('artist_categories') as any)
        .select('*')
        .order('label', { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete the "${label}" category?`)) return;
    try {
      const { error } = await (supabase.from('artist_categories') as any).delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: `${label} has been removed.` });
      fetchCategories();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete category.' });
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div className="section-header">
          <span className="section-label">Website Content</span>
          <h1 className="section-title text-slate-900">
            Artist Categories
          </h1>
          <p className="text-body mt-1 max-w-2xl font-medium">Manage the homepage discovery cards and category tags.</p>
        </div>
        <button 
          className="h-11 px-6 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200/50 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2"
          onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
        >
          <Plus size={16} strokeWidth={3} />
          Add Category
        </button>
      </div>

      <CreateCategoryModal 
        open={isModalOpen} 
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if(!open) setEditingCategory(null);
        }}
        onSuccess={fetchCategories}
        initialData={editingCategory}
      />

      <div className="luxe-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="pl-8 h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[30%]">Category Detail</TableHead>
                <TableHead className="h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[15%]">Query Key</TableHead>
                <TableHead className="h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[20%]">Display Count</TableHead>
                <TableHead className="h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[15%]">Starting Price</TableHead>
                <TableHead className="h-14 pr-8 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[20%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Fetching Categories...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Grid2X2 size={32} className="text-slate-300" />
                      </div>
                      <p className="text-lg font-bold text-slate-400">No categories found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                          <img src={cat.image_url} alt={cat.label} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-[15px]">{cat.label}</p>
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Artist Discovery</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[12px] font-bold">
                        {cat.query}
                      </code>
                    </TableCell>
                    <TableCell className="text-[13px] font-bold text-slate-600">
                      {cat.options}
                    </TableCell>
                    <TableCell className="text-[13px] font-black text-rose-500">
                      ₹{cat.starting_price}
                    </TableCell>
                    <TableCell className="pr-8">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(cat)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-slate-100 hover:border-slate-900 hover:text-slate-900 text-slate-400 transition-colors shadow-sm"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => window.open(`http://localhost:3002/artists?category=${cat.query}`, '_blank')}
                          className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-slate-100 hover:border-indigo-600 hover:text-indigo-600 text-slate-400 transition-colors shadow-sm"
                          title="View on site"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id, cat.label)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-slate-100 hover:border-rose-500 hover:text-rose-500 text-slate-400 transition-colors shadow-sm"
                          title="Delete"
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
