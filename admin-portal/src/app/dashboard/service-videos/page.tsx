"use client";
import { useConfirm } from '@/components/ui/ConfirmProvider';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@database/connection/supabase-admin';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, Upload, Video, Youtube, ExternalLink, RefreshCw, Folder, Play, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function ServiceVideos() {
  const { confirmAction } = useConfirm();
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hero Background State
  const [heroBgVideo, setHeroBgVideo] = useState('');
  const [settingsId, setSettingsId] = useState('');
  const [savingHero, setSavingHero] = useState(false);

  const [uploadTab, setUploadTab] = useState<'file' | 'youtube'>('file');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [customCategoryTitle, setCustomCategoryTitle] = useState('');
  const [userName, setUserName] = useState('');
  const [artistType, setArtistType] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingHero, setIsDraggingHero] = useState(false);
  const [isMainHeading, setIsMainHeading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchInitialData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      // Fetch dynamic categories
      const { data: catData, error: catError } = await (supabase.from('service_categories') as any)
        .select('*')
        .order('displayOrder', { ascending: true });
      if (!catError && catData) setCategories(catData.filter((c: any) => c.status !== false));

      // Fetch Hero Settings
      const { data: settingsData } = await (supabase.from('service_page_settings') as any)
        .select('*')
        .limit(1)
        .single();
      if (settingsData) {
        setSettingsId(settingsData.id);
        setHeroBgVideo(settingsData.hero_bg_video || '');
      }

      // Fetch videos
      const { data: vidData, error: vidError } = await (supabase.from('service_videos') as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (!vidError && vidData) setVideos(vidData);
    } catch (error: any) {
      console.error('Exception fetching data:', error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const channel = supabase
      .channel('admin-realtime-videos-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_videos' }, () => {
        fetchInitialData(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        toast({ variant: 'destructive', title: 'Invalid format', description: 'Please select a video file.' });
        return;
      }
      setVideoFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      toast({ variant: 'destructive', title: 'Category Required', description: 'Please select a dynamic category.' });
      return;
    }

    if (uploadTab === 'file' && !videoFile) {
      toast({ variant: 'destructive', title: 'File Required', description: 'Please select a video file.' });
      return;
    }
    if (uploadTab === 'youtube' && !youtubeUrl.trim()) {
      toast({ variant: 'destructive', title: 'Link Required', description: 'Please enter a YouTube link.' });
      return;
    }

    setUploading(true);
    try {
      let finalVideoUrl = '';

      if (uploadTab === 'file' && videoFile) {
        // Step 1: Get presigned URL
        const res = await fetch('/api/upload-url', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            filename: videoFile.name, 
            contentType: videoFile.type 
          }) 
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to get upload URL');

        // Step 2: Upload directly to S3/R2 using the signed URL
        const uploadRes = await fetch(result.signedUrl, {
          method: 'PUT',
          body: videoFile,
          headers: {
            'Content-Type': videoFile.type,
          },
        });

        if (!uploadRes.ok) throw new Error('Direct file upload to storage failed');
        
        finalVideoUrl = result.url;
      } else {
        const ytId = getYoutubeId(youtubeUrl);
        if (!ytId) throw new Error('Invalid YouTube link.');
        finalVideoUrl = youtubeUrl;
      }

      let finalCategoryId = selectedCategoryId;

      if (selectedCategoryId === 'custom') {
        if (!customCategoryTitle.trim()) {
          toast({ variant: 'destructive', title: 'Category Required', description: 'Please enter the custom category name.' });
          setUploading(false);
          return;
        }
        // Auto-create the category
        const { data: newCatData, error: newCatError } = await (supabase.from('service_categories') as any)
          .insert([{ 
            title: customCategoryTitle.trim(), 
            slug: customCategoryTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            status: true 
          }])
          .select();
        
        if (newCatError) throw new Error('Failed to create custom category: ' + newCatError.message);
        if (!newCatData || newCatData.length === 0) throw new Error('Failed to retrieve new category ID.');
        finalCategoryId = newCatData[0].id;
      }

      const payloadUserName = JSON.stringify({
        name: userName || 'Featured Artist',
        type: artistType || ''
      });

      // Find the category title to use as a fallback for the legacy 'topic' column
      let fallbackTopic = 'Dynamic Category';
      if (selectedCategoryId === 'custom') {
        fallbackTopic = customCategoryTitle.trim();
      } else {
        const matchingCat = categories.find(c => c.id === finalCategoryId);
        if (matchingCat) fallbackTopic = matchingCat.title;
      }

      const { error } = await (supabase.from('service_videos') as any).insert([
        { 
          category_id: finalCategoryId, 
          topic: fallbackTopic,
          user_name: payloadUserName, 
          video_url: finalVideoUrl,
          main_headingvideo: isMainHeading
        }
      ]);

      if (error) throw error;
      toast({ title: 'Success', description: 'Video added to category!' });
      
      setSelectedCategoryId('');
      setCustomCategoryTitle('');
      setUserName('');
      setArtistType('');
      setVideoFile(null);
      setYoutubeUrl('');
      setIsMainHeading(false);
      setIsModalOpen(false);
      fetchInitialData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to Save', description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSeedCategories = async () => {
    setLoading(true);
    try {
      const categoriesToInsert = [
        { title: 'Book a Singer for House Parties', slug: 'book-a-singer-for-house-parties', status: true, displayOrder: 1 },
        { title: 'Book a Live Band for Wedding', slug: 'book-a-live-band-for-wedding', status: true, displayOrder: 2 },
        { title: 'Hire a Live Band for Corporate Event', slug: 'hire-a-live-band-for-corporate-event', status: true, displayOrder: 3 },
        { title: 'Book Anchor Emcees and Magician', slug: 'book-anchor-emcees-and-magician', status: true, displayOrder: 4 },
        { title: 'Hire Club DJs', slug: 'hire-club-djs', status: true, displayOrder: 5 },
        { title: 'Hire Live Solo Singers', slug: 'hire-live-solo-singers', status: true, displayOrder: 6 },
        { title: 'Background Performance Artists', slug: 'background-performance-artists', status: true, displayOrder: 7 }
      ];
      const { error } = await (supabase.from('service_categories') as any).insert(categoriesToInsert);
      if (error) {
        throw new Error('Database error: Make sure you ran the SQL CREATE TABLE script first! (' + error.message + ')');
      }
      toast({ title: 'Success', description: 'Default categories created!' });
      fetchInitialData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Action Failed', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await confirmAction('Admin Verification Required', 'Remove this video?', 'danger')) return;
    try {
      const { error } = await (supabase.from('service_videos') as any).delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Removed', description: 'Video removed.' });
      fetchInitialData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const uploadHeroVideo = async (file: File) => {
    setIsUploadingHero(true);
    try {
      // Step 1: Get presigned URL
      const res = await fetch('/api/upload-url', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filename: file.name, 
          contentType: file.type 
        }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get upload URL');
      
      // Step 2: Upload directly to S3/R2 using the signed URL
      const uploadRes = await fetch(data.signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) throw new Error('Direct hero video upload failed');
      
      const newUrl = data.url;
      setHeroBgVideo(newUrl);

      // Automatically save
      const { data: existing } = await (supabase.from('service_page_settings') as any).select('*').limit(1);
      if (existing && existing.length > 0) {
        await (supabase.from('service_page_settings') as any).update({ hero_bg_video: newUrl }).eq('id', existing[0].id);
      } else {
        await (supabase.from('service_page_settings') as any).insert([{ hero_bg_video: newUrl }]);
      }

      toast({ title: 'Success', description: 'Background video uploaded successfully!' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
    } finally {
      setIsUploadingHero(false);
    }
  };

  // Group videos by category_id mapping to actual Category title
  const groupedVideos: { [key: string]: any[] } = {};
  videos.forEach(video => {
    const cat = categories.find(c => c.id === video.category_id);
    const key = cat ? cat.title : 'Uncategorized / Legacy';
    if (!groupedVideos[key]) groupedVideos[key] = [];
    groupedVideos[key].push(video);
  });

  return (
    <div className="space-y-10 pb-16 px-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-3xl border border-slate-100/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full filter blur-xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Premium V2 Management
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            Dynamic Showcase Reels
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Upload videos to your dynamic categories. They will instantly appear on the premium frontend.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button 
            onClick={() => fetchInitialData()}
            className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all active:scale-95"
            title="Refresh database"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button 
            className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} strokeWidth={3} />
            Add New video
          </button>
        </div>
      </div>

      {/* Hero Background Video Settings */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden min-h-[160px]">
        <div className="absolute inset-0 pointer-events-none">
          {heroBgVideo && !getYoutubeId(heroBgVideo) ? (
            <>
              <video src={heroBgVideo} autoPlay muted loop className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-slate-900/20" />
            </>
          ) : (
            heroBgVideo && (
              <iframe 
                src={`https://www.youtube.com/embed/${getYoutubeId(heroBgVideo)}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeId(heroBgVideo)}&controls=0`} 
                className="w-full h-full object-cover scale-150 pointer-events-none opacity-50"
              />
            )
          )}
        </div>
        <div className="relative z-10 space-y-2 max-w-xl bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg flex-1">
          <h2 className="text-xl font-black text-white flex items-center gap-2 drop-shadow-md">
            <Video className="text-rose-400" size={24} />
            Showcase Background Video
          </h2>
          <p className="text-slate-200 text-sm drop-shadow-sm font-medium mb-4">
            Set the cinematic background video URL (MP4) for the main hero section of the Services page.
          </p>
          <div 
            className={`mt-4 border-2 border-dashed rounded-xl p-4 transition-all ${isDraggingHero ? 'border-[#FF3D5E] bg-[#FF3D5E]/10' : 'border-white/20 bg-black/40 hover:border-white/40'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingHero(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDraggingHero(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingHero(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                uploadHeroVideo(e.dataTransfer.files[0]);
              }
            }}
          >
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-3 w-full">
                <Input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      uploadHeroVideo(e.target.files[0]);
                    }
                  }}
                  disabled={isUploadingHero}
                  className="bg-transparent border-none text-white flex-1 cursor-pointer file:text-white file:bg-[#FF3D5E] file:border-none file:px-4 file:py-1 file:rounded-md hover:file:bg-[#FF3D5E]/80 h-auto p-0"
                />
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:block">or drag & drop video here</span>
              </div>
              {isUploadingHero && <Loader2 className="animate-spin text-[#FF3D5E] w-6 h-6 shrink-0" />}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grouped Layout */}
      {loading && videos.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tuning Stage...</span>
        </div>
      ) : Object.keys(groupedVideos).length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-center max-w-xl mx-auto shadow-sm">
          <Video size={32} className="text-slate-300 mb-6" />
          <h3 className="text-lg font-black text-slate-900">No Showcase Reels Live</h3>
          <Button onClick={() => setIsModalOpen(true)} className="mt-6 h-11 px-6 rounded-xl bg-slate-900 text-white font-bold">
            Configure Showcase
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedVideos).map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-5">
              <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600">
                    <Folder size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">{categoryName}</h2>
                    <span className="text-xs text-slate-500 font-semibold">{items.length} active reels</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(video => {
                  const ytId = getYoutubeId(video.video_url);
                  let displayName = 'Featured Performance';
                  try { if (video.user_name.startsWith('{')) displayName = JSON.parse(video.user_name).name || displayName; } catch(e){}
                  
                  return (
                    <div key={video.id} className="bg-white border-slate-100 rounded-[24px] overflow-hidden border shadow-sm flex flex-col">
                      <div className="aspect-video bg-black relative">
                        {ytId ? (
                          <div className="relative w-full h-full">
                            <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <video src={video.video_url} controls className="w-full h-full object-contain" />
                        )}
                      </div>
                      <div className="p-5 flex justify-between items-start bg-gradient-to-b from-white to-slate-50/50">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{categoryName}</span>
                          <h3 className="font-bold text-slate-800 mt-2 truncate">{displayName}</h3>
                        </div>
                        <button onClick={() => handleDelete(video.id)} className="w-9 h-9 rounded-xl bg-white border border-slate-100 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-[#030305]/90 backdrop-blur-md" onClick={() => !uploading && setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg p-4 z-10">
            <div className="bg-[#0b0f19] rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="p-7 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-lg font-black text-white uppercase tracking-wider">Add to Showcase</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="grid grid-cols-2 border-b border-white/10 bg-black/40">
                <button onClick={() => setUploadTab('file')} className={cn("py-3 text-xs font-bold uppercase", uploadTab === 'file' ? "text-white bg-indigo-600/90" : "text-slate-400 hover:bg-white/5")}>Direct File Upload</button>
                <button onClick={() => setUploadTab('youtube')} className={cn("py-3 text-xs font-bold uppercase", uploadTab === 'youtube' ? "text-white bg-rose-600/90" : "text-slate-400 hover:bg-white/5")}>YouTube Link</button>
              </div>

              <form onSubmit={handleUpload} className="p-7 space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Dynamic Category</Label>
                  {categories.length > 0 ? (
                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                      <SelectTrigger className="h-12 bg-black/40 border-white/10 text-white rounded-2xl">
                        <SelectValue placeholder="Select dynamic category..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0b0f19] border-white/10 text-white z-[9999]">
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                        <SelectItem value="custom" className="text-rose-400 font-bold">+ Paste / Type Custom Category</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl">
                      <p className="text-red-400 text-xs font-bold mb-3">No categories found in database!</p>
                      <Button type="button" onClick={handleSeedCategories} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-10 rounded-xl">
                        Auto-Create Default Categories
                      </Button>
                      <div className="mt-4 pt-4 border-t border-red-500/20">
                        <p className="text-slate-300 text-xs mb-2">Or paste your own category manually:</p>
                        <Button type="button" variant="outline" onClick={() => setSelectedCategoryId('custom')} className="w-full border-slate-600 text-slate-300 hover:text-white bg-transparent h-10 rounded-xl">
                          + Type Custom Category
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedCategoryId === 'custom' && (
                    <div className="mt-3">
                      <Input 
                        value={customCategoryTitle} 
                        onChange={(e) => setCustomCategoryTitle(e.target.value)} 
                        placeholder="Paste category name here..." 
                        className="h-12 bg-black/40 border-rose-500/30 focus-visible:ring-rose-500/30 text-white rounded-2xl"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Artist Name</Label>
                  <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g. DJ Neon" className="h-12 bg-black/40 border-white/10 text-white rounded-2xl" />
                </div>

                {uploadTab === 'file' ? (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Video File (Max 200MB)</Label>
                    <div onClick={() => fileInputRef.current?.click()} className="h-36 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white/5 bg-black/30">
                      <input type="file" accept="video/mp4,video/x-m4v,video/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                      <span className="text-xs text-slate-400 font-bold">{videoFile ? videoFile.name : 'Click to select MP4'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">YouTube URL</Label>
                    <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="h-12 bg-black/40 border-white/10 text-white rounded-2xl" />
                  </div>
                )}

                <Button type="submit" disabled={uploading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl">
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : 'Save Video'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
