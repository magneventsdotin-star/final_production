"use client";
import { useConfirm } from '@/components/ui/ConfirmProvider';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Loader2, Sliders, Pencil, Trash2, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@database/connection/supabase-admin';
import { useToast } from '@/hooks/use-toast';
import { BlogEditorModal } from '@/components/blog/BlogEditorModal';

export default function BlogManagement() {
  const { confirmAction } = useConfirm();
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const { toast } = useToast();

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase.from('hero_slides') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.message?.includes('find the table') || error.code?.startsWith('PGRST')) {
          console.warn('Table hero_slides does not exist yet.');
          setSlides([]);
        } else {
          throw error;
        }
      } else {
        setSlides(data || []);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      const { error } = await (supabase.from('hero_slides') as any).update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      fetchSlides();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!await confirmAction('Admin Verification Required', 'Are you sure you want to delete this blog post?', 'danger')) return;
    try {
      const { error } = await (supabase.from('hero_slides') as any).delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Blog post has been removed.' });
      fetchSlides();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleSavePost = async (data: any) => {
    try {
      if (editingPost) {
        const { error } = await (supabase.from('hero_slides') as any).update({
          title: data.title,
          subtitle: data.subtitle,
          image_url: data.image_url,
          content: data.content
        }).eq('id', editingPost.id);
        
        if (error) throw error;
        toast({ title: 'Updated', description: 'Blog post updated successfully.' });
      } else {
        const { error } = await (supabase.from('hero_slides') as any).insert([{
          title: data.title,
          subtitle: data.subtitle,
          image_url: data.image_url,
          content: data.content,
          is_active: true
        }]);
        
        if (error) throw error;
        toast({ title: 'Created', description: 'New blog post created.' });
      }
      
      fetchSlides();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      throw error;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div className="section-header">
          <span className="section-label">Content Management</span>
          <h1 className="section-title text-slate-900">
            Blog Posts
          </h1>
          <p className="text-body mt-1 max-w-2xl font-medium">Manage blog posts and articles.</p>
        </div>
        <button
          className="h-11 px-6 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200/50 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2"
          onClick={() => { setEditingPost(null); setIsModalOpen(true); }}
        >
          <Plus size={16} strokeWidth={3} />
          Create Blog Post
        </button>
      </div>

      <div className="luxe-card overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="pl-8 h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[40%]">Blog Content</TableHead>
              <TableHead className="h-14 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[15%]">Status</TableHead>
              <TableHead className="h-14 pr-8 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[20%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-64 text-center">
                   <Loader2 className="h-8 w-8 animate-spin text-slate-200 mx-auto" />
                </TableCell>
              </TableRow>
            ) : slides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-64 text-center">
                   <div className="opacity-40">
                      <Sliders size={32} className="mx-auto mb-2" />
                      <p className="font-bold text-slate-400">No blog posts configured</p>
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              slides.map((slide) => (
                <TableRow key={slide.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center">
                         {slide.image_url ? (
                           <img src={slide.image_url} className="w-full h-full object-cover" />
                         ) : (
                           <ImageIcon size={16} className="text-slate-300"  />
                         )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-[14px]">{slide.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{slide.subtitle}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleStatus(slide.id, slide.is_active)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                        slide.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {slide.is_active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {slide.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </TableCell>
                  <TableCell className="pr-8">
                     <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setEditingPost(slide); setIsModalOpen(true); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                        >
                           <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(slide.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
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

      <BlogEditorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSavePost} 
        initialData={editingPost} 
      />
    </div>
  );
}
