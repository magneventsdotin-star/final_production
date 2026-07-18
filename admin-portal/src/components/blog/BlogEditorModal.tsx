import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PenLine, LayoutTemplate, ImagePlus, FileText } from 'lucide-react';
import { ImageUploader } from '@/components/artists/ImageUploader';

interface BlogEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any | null;
}

export function BlogEditorModal({ isOpen, onClose, onSave, initialData }: BlogEditorModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    content: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          subtitle: initialData.subtitle || '',
          image_url: initialData.image_url || '',
          content: initialData.content || ''
        });
      } else {
        setFormData({ title: '', subtitle: '', image_url: '', content: '' });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (images: string[]) => {
    setFormData({ ...formData, image_url: images.length > 0 ? images[0] : '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[760px] p-0 border-slate-200 shadow-xl rounded-2xl bg-white overflow-hidden flex flex-col max-h-[92vh]">
        
        <DialogHeader className="px-8 py-6 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <PenLine className="w-4 h-4 text-slate-700" />
            </div>
            {initialData ? 'Edit Blog Post' : 'Create New Post'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-sm mt-1.5 ml-10">
            {initialData ? 'Update the details of your article below.' : 'Draft a new article for your event community.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-7">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="title" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" /> Post Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="E.g. The Ultimate Guide to Live Music"
                  required
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all rounded-xl shadow-sm text-sm"
                />
              </div>
              
              <div className="space-y-2.5">
                <Label htmlFor="subtitle" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" /> Category / Subtitle
                </Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="E.g. EXPERT GUIDE"
                  required
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all rounded-xl shadow-sm text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <imgPlus className="w-3.5 h-3.5 text-slate-400"  /> Cover Image
              </Label>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 shadow-sm">
                <imgUploader 
                  images={formData.image_url ? [formData.image_url] : []} 
                  onChange={handleImageChange} 
                  maxImages={1} 
                 />
              </div>
            </div>
            
            <div className="space-y-2.5">
              <Label htmlFor="content" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Article Content (Markdown)
              </Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your post here... Use **bold** for emphasis, or start lines with ### for headings."
                className="min-h-[300px] p-4 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all rounded-xl shadow-sm resize-y text-[15px] leading-relaxed text-slate-800"
              />
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white border-t border-slate-100 px-8 py-5 mt-auto">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              disabled={loading}
              className="h-11 px-6 rounded-xl font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="h-11 px-8 rounded-xl bg-slate-900 text-white font-semibold shadow-md shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {initialData ? 'Save Changes' : 'Publish Article'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
