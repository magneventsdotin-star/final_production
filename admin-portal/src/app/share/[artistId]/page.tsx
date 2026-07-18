"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@database/connection/supabase-admin';
import { Loader2, Mic2, Star, MapPin, Languages, Tag, Info, Share2, Calendar, IndianRupee, PlayCircle, User, Users, Phone, Mail, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
export default function ArtistSharePage() {
  const { artistId } = useParams();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchArtist() {
      try {
        const { data, error } = await (supabase
          .from('artists') as any)
          .select('*, artist_images!fk_artist_id(image_url)')
          .eq('id', artistId)
          .single();
        if (error) throw error;
        setArtist(data);
      } catch (err: any) {
        setError('Artist not found or profile is private.');
      } finally {
        setLoading(false);
      }
    }
    if (artistId) {
      fetchArtist();
    }
  }, [artistId]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-100">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">Loading Profile</p>
        </div>
      </div>
    );
  }
  if (error || !artist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
            <Info className="w-10 h-10 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile Not Found</h1>
            <p className="text-slate-500 mt-2 font-medium">{error || "This artist profile could not be loaded."}</p>
          </div>
        </div>
      </div>
    );
  }
  const mainImage = artist.artist_images?.[0]?.image_url;
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-lg mx-auto">
        <Card className="overflow-hidden border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[40px] bg-white group hover:shadow-[0_48px_80px_-24px_rgba(0,0,0,0.15)] transition-all duration-700">
          {}
          <div className="relative h-[480px] overflow-hidden">
            {mainImage ? (
              <img
                src={mainImage}
                alt={artist.alias || 'Artist'}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-700 via-violet-800 to-fuchsia-900 flex items-center justify-center">
                <Mic2 size={80} className="text-white/20" />
              </div>
            )}
            {}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            {}
            <div className="absolute top-8 right-8 flex flex-col gap-3 items-end">
              {artist.is_popular && (
                <div className="px-4 py-2 rounded-2xl bg-amber-400/90 border border-amber-300/50 flex items-center gap-2 shadow-lg shadow-amber-900/20">
                  <Star size={16} fill="white" className="text-white" />
                  <span className="text-[12px] font-black uppercase tracking-wider text-white">Popular</span>
                </div>
              )}
              <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2">
                <Tag size={14} className="text-white" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-white">{artist.category}</span>
              </div>
            </div>
            {}
            <div className="absolute bottom-10 left-10 right-10">
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-sm">
                  {artist.alias || 'Artist'}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-white/80 font-bold text-lg">{artist.category} Specialist</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  <span className="text-indigo-300 font-black uppercase tracking-widest text-[11px] bg-indigo-500/10 px-2 py-1 rounded-lg">Verified Profile</span>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-10 space-y-10">
            {}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Info size={16} />
                </div>
                <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">About the Artist</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium text-lg">
                {artist.bio || "No biography provided for this artist."}
              </p>
            </div>
            {}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[28px] bg-slate-50/80 border border-slate-100 space-y-3 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</p>
                  <p className="font-bold text-slate-900 leading-tight">{artist.city}, {artist.state}</p>
                </div>
              </div>
              <div className="p-6 rounded-[28px] bg-slate-50/80 border border-slate-100 space-y-3 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
                  <Languages size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Language</p>
                  <p className="font-bold text-slate-900 leading-tight">
                    {artist.languages?.join(', ') || artist.performing_language || 'Any'}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-[28px] bg-slate-50/80 border border-slate-100 space-y-3 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-50 flex items-center justify-center text-fuchsia-600 border border-fuchsia-100">
                  <Tag size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</p>
                  <p className="font-bold text-slate-900 leading-tight truncate">{artist.sub_category || artist.category}</p>
                </div>
              </div>


              <div className="p-6 rounded-[28px] bg-emerald-50/30 border border-emerald-100 space-y-3 hover:bg-white hover:shadow-xl hover:shadow-emerald-200/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Investment</p>
                  <p className="font-bold text-slate-900 leading-tight">
                    {artist.price_min ? (
                      `₹${Math.min(Number(artist.price_min), Number(artist.price_max || artist.price_min)).toLocaleString()} - ₹${Math.max(Number(artist.price_min), Number(artist.price_max || artist.price_min)).toLocaleString()}`
                    ) : (artist.price_range || 'Contact')}
                  </p>
                </div>
              </div>


              <div className="p-6 rounded-[28px] bg-slate-50/80 border border-slate-100 space-y-3 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Performance</p>
                  <p className="font-bold text-slate-900 leading-tight">
                    {artist.members_min ? `${artist.members_min}${artist.members_max ? ` - ${artist.members_max}` : ''} Member(s)` : 'Solo'}
                  </p>
                </div>
              </div>


              <div className="p-6 rounded-[28px] bg-slate-50/80 border border-slate-100 space-y-3 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                  <Star size={18} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trust Factor</p>
                  <p className="font-bold text-slate-900 leading-tight whitespace-nowrap">
                    {artist.rating || '4.8'}/5 &bull; {artist.successful_bookings || '25'}+ Shows
                  </p>
                </div>
              </div>
            </div>

            {}
            {artist.video_url && (() => {
              const videoUrls = artist.video_url.split(',').map((u: string) => u.trim()).filter(Boolean);
              const videoIds = videoUrls.map(getYoutubeId).filter(Boolean);
              if (videoIds.length === 0) return null;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                      <PlayCircle size={16} />
                    </div>
                    <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Video Showcase</h2>
                  </div>
                  <div className="grid gap-4">
                    {(videoIds as string[]).map((vId: string, i: number) => (
                      <div key={i} className="relative aspect-video rounded-[28px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 bg-slate-900">
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${vId}`}
                          title={`${artist.alias || 'Artist'} Performance Video ${i + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {}
            <div className="pt-4 flex flex-col gap-4">
              <button
                className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-[13px] hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group/btn"
                onClick={() => {
                   if (navigator.share) {
                     navigator.share({
                       title: `${artist.alias || 'Artist'} - ${artist.category} Profile`,
                       text: `Check out ${artist.alias || 'Artist'}'s talent profile on Magnevents!`,
                       url: window.location.href,
                     });
                   } else {
                     navigator.clipboard.writeText(window.location.href);
                     alert('Profile link copied to clipboard!');
                   }
                }}
              >
                <Share2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                Share Talent Card
              </button>
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="h-[1px] flex-1 bg-slate-100" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Powering Global Talent</span>
                <div className="h-[1px] flex-1 bg-slate-100" />
              </div>
              <div className="flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                 <img src="/logo.webp" alt="Magnevents Logo" className="h-6 grayscale" />
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
          Magnevents &copy; {new Date().getFullYear()} &bull; All Profiles Verified <br/>
          Internal Corporate Use Only
        </p>
      </div>
    </div>
  );
}
