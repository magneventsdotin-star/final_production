
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface ImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageManager({ images, onChange, maxImages = 5 }: ImageManagerProps) {
  const [newImageUrl, setNewImageUrl] = useState('');

  const addImage = () => {
    if (newImageUrl && images.length < maxImages) {
      onChange([...images, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={url}
              alt={`Artist band ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                (e.target as any).src = 'https://via.placeholder.com/400?text=Invalid+Image';
              }}
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-90"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 bg-slate-50/50 text-slate-400 group hover:border-[#5B5AF7] hover:bg-slate-50 transition-all">
            <imgIcon size={24} className="group-hover:text-[#5B5AF7] transition-colors"  />
            <span className="text-[10px] font-bold uppercase tracking-widest">{images.length}/{maxImages} Images</span>
          </div>
        )}
      </div>

      {images.length < maxImages && (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste artist band image URL..."
              className="pl-10 h-12 border-slate-200 rounded-xl focus-visible:ring-[#5B5AF7]/10 focus-visible:border-[#5B5AF7]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addImage();
                }
              }}
            />
          </div>
          <Button
            type="button"
            onClick={addImage}
            disabled={!newImageUrl}
            className="h-12 px-6 rounded-xl bg-[#5B5AF7] hover:bg-[#4338CA] text-white font-bold text-xs uppercase tracking-widest gap-2 shadow-lg shadow-[#5B5AF7]/20"
          >
            <Plus size={16} /> Add
          </Button>
        </div>
      )}

      <p className="text-[10px] text-slate-400 font-medium">
        Images are optional. You can add up to {maxImages} portfolio or band images for this artist.
      </p>
    </div>
  );
}
