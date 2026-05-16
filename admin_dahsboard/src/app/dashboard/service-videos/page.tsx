"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, Upload, Video, Youtube, ExternalLink, RefreshCw, Folder, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to extract YouTube video ID
const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function ServiceVideos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Tab within Upload Modal: 'file' or 'youtube'
  const [uploadTab, setUploadTab] = useState<'file' | 'youtube'>('file');
  
  const [topic, setTopic] = useState('');
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [category, setCategory] = useState('');
  const [userName, setUserName] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const predefinedTopics = [
    'Singer for House Parties',
    'Live Band for Weddings',
    'Live Band for Corporate Event',
    'Anchor Emcees and Magician'
  ];
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('video/')) {
        toast({ variant: 'destructive', title: 'Invalid format', description: 'Please select a video file.' });
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Too large', description: 'Video must be less than 50MB.' });
        return;
      }
      setVideoFile(file);
    }
  };

  const fetchVideos = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const { data, error } = await (supabase.from('service_videos') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.message?.includes('find the table') || error.code?.startsWith('PGRST')) {
          console.warn('Table service_videos does not exist yet.');
          setVideos([]);
        } else {
          console.error('Error fetching videos:', error);
          setVideos([]);
        }
      } else {
        setVideos(data || []);
      }
    } catch (error: any) {
      console.error('Exception in fetchVideos:', error);
      setVideos([]);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();

    // BACKGROUND SYNC PROPER: Supabase Realtime Channel
    const channel = supabase
      .channel('admin-realtime-videos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_videos' },
        () => {
          // Instantly sync background grid silently without manual reload or flashing loader!
          fetchVideos(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        toast({ variant: 'destructive', title: 'Invalid format', description: 'Please select a video file.' });
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Too large', description: 'Video must be less than 50MB.' });
        return;
      }
      setVideoFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({ variant: 'destructive', title: 'Category Required', description: 'Please select or add a category/topic.' });
      return;
    }

    if (uploadTab === 'file' && !videoFile) {
      toast({ variant: 'destructive', title: 'File Required', description: 'Please select a video file to upload.' });
      return;
    }

    if (uploadTab === 'youtube' && !youtubeUrl.trim()) {
      toast({ variant: 'destructive', title: 'Link Required', description: 'Please enter a valid YouTube video link.' });
      return;
    }

    setUploading(true);
    try {
      let finalVideoUrl = '';

      if (uploadTab === 'file' && videoFile) {
        // 1. Upload direct MP4 file to Cloudflare R2
        const formData = new FormData();
        formData.append('file', videoFile);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Upload failed');
        finalVideoUrl = result.url;
      } else {
        // 2. Process YouTube link directly
        const ytId = getYoutubeId(youtubeUrl);
        if (!ytId) {
          throw new Error('Please enter a valid YouTube video link (e.g. watch?v= or youtu.be).');
        }
        finalVideoUrl = youtubeUrl;
      }

      // Save record to Supabase
      const { error } = await (supabase.from('service_videos') as any).insert([
        { 
          topic, 
          category: category || topic, 
          user_name: userName || 'Featured Artist', 
          video_url: finalVideoUrl 
        }
      ]);

      if (error) throw error;

      toast({ title: 'Success', description: 'Showcase video added successfully!' });
      
      // Clean states cleanly
      setTopic('');
      setCategory('');
      setUserName('');
      setIsCustomTopic(false);
      setVideoFile(null);
      setYoutubeUrl('');
      setIsModalOpen(false);
      fetchVideos();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to Save', description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this video from your services list?')) return;
    try {
      const { error } = await (supabase.from('service_videos') as any).delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Removed', description: 'Showcase video removed successfully.' });
      fetchVideos();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error deleting', description: error.message });
    }
  };

  // Group videos dynamically by Category/Topic for "Category-Wise" Layout
  const groupedVideos: { [key: string]: any[] } = {};
  videos.forEach(video => {
    const key = video.topic || 'General Spotlight';
    if (!groupedVideos[key]) {
      groupedVideos[key] = [];
    }
    groupedVideos[key].push(video);
  });

  const activeYoutubeId = getYoutubeId(youtubeUrl);

  return (
    <div className="space-y-10 pb-16 px-1">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-3xl border border-slate-100/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full filter blur-xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Admin Staging CMS
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            Services Showcase Reels
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Organize live client performance videos and YouTube links grouped category-wise.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button 
            onClick={fetchVideos}
            className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all active:scale-95"
            title="Refresh database"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button 
            className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            onClick={() => {
              setIsCustomTopic(false);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} strokeWidth={3} />
            Add New video
          </button>
        </div>
      </div>

      {/* Main Grouped Categories Layout */}
      {loading && videos.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tuning Stage...</span>
        </div>
      ) : Object.keys(groupedVideos).length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-6">
            <Video size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-900">No Showcase Reels Live</h3>
          <p className="text-slate-500 text-sm mt-2 px-6">
            Upload custom MP4 recordings or paste premium YouTube live performances to showcase on your booking platform.
          </p>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="mt-6 h-11 px-6 rounded-xl bg-slate-900 text-white font-bold"
          >
            Configure Showcase
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedVideos).map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-5">
              {/* Modern Category Group Title Card */}
              <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-indigo-600">
                    <Folder size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 leading-tight">
                      {categoryName}
                    </h2>
                    <span className="text-xs text-slate-500 font-semibold">
                      {items.length} active showcase {items.length === 1 ? 'reel' : 'reels'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setTopic(categoryName);
                    setIsCustomTopic(false);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-indigo-100 flex items-center gap-1.5"
                >
                  <Plus size={14} strokeWidth={3} />
                  Add to Group
                </button>
              </div>

              {/* Grid showing videos of this category only */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(video => {
                  const ytId = getYoutubeId(video.video_url);
                  return (
                    <div 
                      key={video.id} 
                      className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
                    >
                      <div className="aspect-video bg-black relative overflow-hidden">
                        {ytId ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                              alt="YouTube Thumbnail" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg">
                                <Play size={20} fill="white" className="ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute top-3 right-3 bg-red-600 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                              <Youtube size={10} />
                              YouTube
                            </span>
                          </div>
                        ) : (
                          <video 
                            src={video.video_url} 
                            controls 
                            className="w-full h-full object-contain" 
                          />
                        )}
                      </div>
                      
                      <div className="p-5 flex justify-between items-start gap-4 flex-1 bg-gradient-to-b from-white to-slate-50/50">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-1.5">
                            {video.category && (
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                {video.category}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-800 mt-2 text-md truncate" title={video.user_name}>
                            {video.user_name || 'Featured Performance'}
                          </h3>
                          {ytId && (
                            <a 
                              href={video.video_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 font-bold mt-1"
                            >
                              Open YouTube <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => handleDelete(video.id)}
                          className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
                        >
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

      {/* Upload/Configure Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* High-end cinematic dark glassmorphic backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => !uploading && setIsModalOpen(false)}
          />
          
          <div className="bg-[#0b0f19]/95 rounded-[32px] border border-white/[0.08] w-full max-w-lg overflow-hidden shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] relative z-10 animate-in zoom-in-95 duration-200">
            {/* Ambient luxury radial glow spheres inside modal backdrop */}
            <div className="absolute top-0 left-1/4 w-44 h-44 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-44 h-44 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="p-7 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01] relative z-10">
              <div>
                <span className="text-[9px] font-black text-amber-400 tracking-widest uppercase block mb-1">Staging Control</span>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">Configure Showcase</h2>
                <p className="text-[11px] text-slate-400/90 mt-0.5">Stream direct client performance files or YouTube videos.</p>
              </div>
              <button 
                onClick={() => !uploading && setIsModalOpen(false)} 
                className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 active:scale-90"
                disabled={uploading}
              >
                ✕
              </button>
            </div>

            {/* Segment Tab Controls */}
            <div className="grid grid-cols-2 border-b border-white/[0.05] bg-slate-950/40 p-1.5 gap-1.5 relative z-10">
              <button
                type="button"
                onClick={() => setUploadTab('file')}
                className={cn(
                  "py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-2xl transition-all duration-300",
                  uploadTab === 'file' 
                    ? "bg-indigo-600/90 text-white shadow-[0_4px_16px_rgba(79,70,229,0.35)] border border-indigo-500/30" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                )}
              >
                <Video size={14} className={uploadTab === 'file' ? "text-white" : "text-slate-400"} />
                Direct File Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('youtube')}
                className={cn(
                  "py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-2xl transition-all duration-300",
                  uploadTab === 'youtube' 
                    ? "bg-rose-600/90 text-white shadow-[0_4px_16px_rgba(225,29,72,0.35)] border border-rose-500/30" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                )}
              >
                <Youtube size={14} className={uploadTab === 'youtube' ? "text-white" : "text-slate-400"} />
                Paste YouTube Link
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpload} className="p-7 space-y-5 relative z-10">
              {/* Category selector */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category / Topic Group</Label>
                
                <Select
                  value={isCustomTopic ? 'custom' : topic || undefined}
                  onValueChange={(val) => {
                    if (val === 'custom') {
                      setIsCustomTopic(true);
                      setTopic('');
                    } else {
                      setIsCustomTopic(false);
                      setTopic(val);
                    }
                  }}
                >
                  <SelectTrigger className="h-12 bg-slate-950/60 border-white/[0.08] text-white rounded-2xl focus:ring-amber-500/20 focus:border-amber-500/30 transition-all">
                    <SelectValue placeholder="Select a predefined category..." className="placeholder-slate-500" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b0f19] border border-white/[0.08] text-white rounded-2xl p-1">
                    {predefinedTopics.map((t) => (
                      <SelectItem key={t} value={t} className="focus:bg-white/[0.08] focus:text-white rounded-xl py-2 px-3 transition-colors cursor-pointer text-xs">{t}</SelectItem>
                    ))}
                    <SelectItem value="custom" className="font-bold text-amber-400 focus:bg-amber-500/10 focus:text-amber-300 rounded-xl py-2 px-3 transition-colors cursor-pointer text-xs">
                      + Add Custom Category Group
                    </SelectItem>
                  </SelectContent>
                </Select>

                {isCustomTopic && (
                  <Input 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)} 
                    placeholder="e.g. Club DJs for Parties" 
                    className="h-12 bg-slate-950/40 text-white placeholder-slate-500 rounded-2xl mt-3 border-amber-500/20 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 transition-all"
                    required
                  />
                )}
              </div>

              {/* Subcategory & Name row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sub Category Label</Label>
                  <Input 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    placeholder="e.g. Acoustic, Rock" 
                    className="h-12 bg-slate-950/60 border-white/[0.08] text-white placeholder-slate-600 rounded-2xl focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User / Artist Name</Label>
                  <Input 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                    placeholder="e.g. Swaresh & Band" 
                    className="h-12 bg-slate-950/60 border-white/[0.08] text-white placeholder-slate-600 rounded-2xl focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Dynamic input based on selected tab */}
              {uploadTab === 'file' ? (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Video File (Max 50MB)</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
                      isDragging
                        ? "border-amber-500 bg-amber-500/10 scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                        : videoFile 
                          ? "border-indigo-500/40 bg-indigo-950/15" 
                          : "border-white/[0.08] bg-slate-950/30 hover:bg-white/[0.02] hover:border-white/[0.15]"
                    )}
                  >
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                    />
                    {isDragging ? (
                      <>
                        <Upload className="w-7 h-7 text-amber-400 mb-2 animate-bounce" />
                        <span className="text-xs font-black text-amber-300 uppercase tracking-widest">Drop to upload!</span>
                        <span className="text-[9px] text-amber-500/80 mt-1 uppercase">Accepting MP4 Video file</span>
                      </>
                    ) : videoFile ? (
                      <>
                        <Video className="w-7 h-7 text-indigo-400 mb-2" />
                        <span className="text-[11px] font-bold text-indigo-300 px-4 text-center truncate w-full">{videoFile.name}</span>
                        <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">{(videoFile.size / 1024 / 1024).toFixed(1)} MB • Click or drag to replace</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-slate-500 mb-2" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select or Drop MP4 Video File</span>
                        <span className="text-[9px] text-slate-500 mt-1">Accepts standard video formats up to 50MB</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">YouTube Video Link</Label>
                  <Input 
                    value={youtubeUrl} 
                    onChange={(e) => setYoutubeUrl(e.target.value)} 
                    placeholder="e.g. https://www.youtube.com/watch?v=..." 
                    className="h-12 bg-slate-950/60 border-white/[0.08] text-white placeholder-slate-600 rounded-2xl focus-visible:ring-rose-500/20 focus-visible:border-rose-500/30 transition-all"
                  />
                  {activeYoutubeId && (
                    <div className="mt-3 p-3 rounded-2xl bg-rose-950/15 border border-rose-500/20 flex items-center gap-3">
                      <img 
                        src={`https://img.youtube.com/vi/${activeYoutubeId}/hqdefault.jpg`} 
                        alt="Preview" 
                        className="w-16 h-10 object-cover rounded-lg border border-rose-500/30"
                      />
                      <div>
                        <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Youtube size={10} /> Valid Link Detected
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Video will preview in lightbox automatically.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={uploading} 
                  className={cn(
                    "w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-lg text-white",
                    uploadTab === 'youtube' 
                      ? "bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-rose-600/10 hover:scale-[1.01] active:scale-[0.99]" 
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99]"
                  )}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading & Staging stage...
                    </>
                  ) : (
                    'Publish Showcase Live'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
