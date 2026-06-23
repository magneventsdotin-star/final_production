"use client";

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CoverPhotoUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export function CoverPhotoUploader({ value, onChange }: CoverPhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading && !value) {
      setIsDragging(true);
    }
  }, [uploading, value]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const width = img.width;
        const height = img.height;
        
        // Target aspect ratio is landscape (approx 16:9 or 1.77)
        // We reject if the image is too portrait-like or square (e.g., width / height < 1.33)
        // because it would get heavily cropped (stolen data > 25%).
        const aspectRatio = width / height;
        
        if (aspectRatio < 1.33) {
          toast({
            variant: "destructive",
            title: "Incompatible Size",
            description: "The cover photo must be landscape. This image is too tall/square and will be cropped significantly. Please select a wider image.",
          });
          resolve(false);
        } else {
          resolve(true);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(false);
      };
      
      img.src = objectUrl;
    });
  };

  const processFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid Format",
        description: `${file.name} is not an image.`,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: `${file.name} exceeds the 5MB limit.`,
      });
      return;
    }

    // Validate dimensions before upload
    const isValidDimensions = await validateImageDimensions(file);
    if (!isValidDimensions) {
      return;
    }

    setUploading(true);

    try {
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
        onChange(result.url);
        toast({
          title: "Cover Photo Uploaded",
          description: "Successfully set the cover photo.",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: err.message || "Failed to process media file.",
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

    if (!uploading && !value) {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    }
  }, [uploading, value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-4">
      {!value ? (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-[24px] p-6 text-center cursor-pointer transition-all duration-500 group overflow-hidden h-[200px] flex items-center justify-center",
            uploading
              ? 'border-indigo-400 bg-indigo-50 cursor-wait'
              : isDragging
              ? 'border-indigo-500 bg-indigo-50/80 scale-[1.01] shadow-2xl shadow-indigo-200/50'
              : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'
          )}
        >
          <div className={cn(
            "absolute inset-0 rounded-xl transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-indigo-500/5 to-transparent",
            isDragging ? 'opacity-100' : 'opacity-0'
          )} />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3 py-2 animate-in fade-in zoom-in-95">
              <div className="relative">
                <div className="w-12 h-12 rounded-[18px] bg-indigo-100 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">Uploading Cover...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className={cn(
                "w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 shadow-sm border",
                isDragging
                  ? 'bg-indigo-100 text-indigo-600 border-indigo-300 scale-110 shadow-indigo-100'
                  : 'bg-indigo-50 text-indigo-500 border-indigo-100 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-600 shadow-slate-100'
              )}>
                <Upload size={20} strokeWidth={2.5} className={isDragging ? 'animate-bounce' : 'transition-transform duration-500'} />
              </div>
              <div className="text-center">
                <p className="text-[12px] font-black uppercase tracking-widest text-slate-700">
                  {isDragging ? 'Release to Upload Cover' : 'Upload Cover Photo'}
                </p>
                <div className="flex flex-col items-center justify-center gap-2 mt-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100/60 border border-indigo-200 px-4 py-2 rounded-xl shadow-sm transition-all hover:bg-indigo-200/50 hover:scale-105 cursor-pointer">
                    Browse Files
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 mt-2">Landscape images only (16:9)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative group w-full h-[200px] rounded-[24px] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50">
          <img
            src={value}
            alt="Cover Photo"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/800x400/F1F5F9/64748B?text=Broken+Image+URL`;
            }}
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeImage(); }}
            className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-rose-500 hover:border-rose-400 transition-all active:scale-95 shadow-lg group/remove translate-y-[-4px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100"
          >
            <X size={14} strokeWidth={3} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Remove Cover</span>
          </button>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 translate-y-[10px] group-hover:translate-y-0 transition-transform duration-500">
            <div className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400"></div>
              Cover Photo Set
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
