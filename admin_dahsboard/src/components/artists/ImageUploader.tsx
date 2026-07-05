"use client";

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages = 15 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading && images.length < maxImages) {
      setIsDragging(true);
    }
  }, [uploading, images.length, maxImages]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast({
        variant: "destructive",
        title: "Limit Reached",
        description: `You've already reached the maximum of ${maxImages} images.`,
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {

        if (!file.type.startsWith('image/')) {
          toast({
            variant: "destructive",
            title: "Invalid Format",
            description: `${file.name} is not an image.`,
          });
          continue;
        }

        if (file.size > 15 * 1024 * 1024) {
          toast({
            variant: 'destructive',
            title: 'File too large',
            description: `${file.name} exceeds the 15MB limit.`,
          });
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || 'Upload failed');
        }

        if (result.url) {
          uploadedUrls.push(result.url);
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
        toast({
          title: "Assets Uploaded",
          description: `Successfully added ${uploadedUrls.length} image(s) to the registry.`,
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: err.message || "Failed to process media files.",
      });
    } finally {
      setUploading(false);
      setIsDragging(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!uploading && images.length < maxImages) {
      const files = e.dataTransfer.files;
      processFiles(files);
    }
  }, [uploading, images, maxImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div
        onClick={() => !uploading && images.length < maxImages && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-[24px] p-6 text-center cursor-pointer transition-all duration-500 group overflow-hidden",
          uploading
            ? 'border-sky-400 bg-sky-50 cursor-wait'
            : images.length >= maxImages
            ? 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-50'
            : isDragging
            ? 'border-sky-500 bg-sky-50/80 scale-[1.01] shadow-2xl shadow-sky-200/50'
            : 'border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50/30'
        )}
      >
        <div className={cn(
          "absolute inset-0 rounded-xl transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-sky-500/5 to-transparent",
          isDragging ? 'opacity-100' : 'opacity-0'
        )} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3 py-2 animate-in fade-in zoom-in-95">
            <div className="relative">
              <div className="w-12 h-12 rounded-[18px] bg-sky-100 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-600">Syncing Media...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 shadow-sm border",
              isDragging
                ? 'bg-sky-100 text-sky-600 border-sky-300 scale-110 shadow-sky-100'
                : 'bg-sky-50 text-sky-500 border-sky-100 group-hover:scale-110 group-hover:bg-sky-100 group-hover:text-sky-600 shadow-slate-100'
            )}>
              <Upload size={20} strokeWidth={2.5} className={isDragging ? 'animate-bounce' : 'transition-transform duration-500'} />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-black uppercase tracking-widest text-slate-700">
                {isDragging ? 'Release to Upload' : 'Click or Drag images here'}
              </p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-sky-700 bg-sky-100/60 border border-sky-200 px-4 py-2 rounded-xl shadow-sm transition-all hover:bg-sky-200/50 hover:scale-105 cursor-pointer">
                  Browse Files
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  {images.length}/{maxImages} Slots
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-[22px] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200/50">
              <img
                src={url}
                alt={`Asset ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x400/F1F5F9/64748B?text=Broken+Image+URL`;
                }}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-rose-500 hover:border-rose-400 transition-all active:scale-95 shadow-lg group/remove translate-y-[-4px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100"
              >
                <X size={12} strokeWidth={3} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Remove</span>
              </button>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 translate-y-[10px] group-hover:translate-y-0 transition-transform duration-500">
                <div className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                  Asset {i + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
