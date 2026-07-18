"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@database/connection/supabase-admin';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Loader2,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Clock,
  LayoutTemplate,
  Activity,
  Calendar,
  Zap,
  Edit3,
  User,
  Mic2,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { EditAdminModal } from '@/components/admins/EditAdminModal';
import { CreateArtistModal } from '@/components/artists/CreateArtistModal';

export default function AdminProfileDashboard() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [admin, setAdmin] = useState<any>(null);
  const [uploadedArtists, setUploadedArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'original' | 'duplicate'>('all');
  
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<any>(null);

  // Mock Stats to give the premium dashboard feel
  const [stats, setStats] = useState({
    cardsUploaded: 0,
    hoursActive: 0,
    recentLogins: 0,
  });

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const [profileRes, artistsRes, allArtistsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', id).single(),
          supabase.from('artists').select('*, artist_images(image_url)').eq('created_by', id).order('created_at', { ascending: false }),
          supabase.from('artists').select('phone_no')
        ]);

        if (profileRes.error) throw profileRes.error;
        if (artistsRes.error && artistsRes.error.code !== 'PGRST116') {
          console.warn('Warning fetching artists (Likely missing created_by column):', artistsRes.error.message || artistsRes.error);
        }

        const adminData = profileRes.data;
        
        const phoneCounts = new Map<string, number>();
        if (allArtistsRes.data) {
          allArtistsRes.data.forEach((a: any) => {
            if (a.phone_no) {
               phoneCounts.set(a.phone_no, (phoneCounts.get(a.phone_no) || 0) + 1);
            }
          });
        }

        const fetchedArtists = (artistsRes.data || []).map((a: any) => {
            if (a.phone_no && (phoneCounts.get(a.phone_no) || 0) > 1) {
                return { ...a, is_duplicate_pending: true, duplicate_status: 'Live' };
            }
            return a;
        });
        
        let pendingDuplicates: any[] = [];
        if (adminData?.email) {
          const dupRes = await supabase.from('duplicate_approvals').select('*').eq('requested_by', adminData.email);
          if (dupRes.data) pendingDuplicates = dupRes.data;
        }

        setAdmin(adminData);
        
        const mappedDuplicates = pendingDuplicates.map(dup => {
          const draft = dup.draft_data || {};
          return {
            id: dup.id,
            name: draft.name || dup.field_value,
            alias: draft.alias || dup.field_value,
            category: draft.category || 'Pending Duplicate',
            city: draft.city || '-',
            state: draft.state || '-',
            artist_images: draft.images ? [{ image_url: draft.images[0] }] : [],
            created_at: dup.created_at,
            is_live: false,
            is_duplicate_pending: true,
            duplicate_status: dup.status,
          };
        });

        const allProfiles = [...fetchedArtists, ...mappedDuplicates].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setUploadedArtists(allProfiles);

        // Generate deterministic mock stats based on user id length/chars to keep them stable
        const charSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        setStats({
          cardsUploaded: allProfiles.length, // Now dynamic with duplicates!
          hoursActive: (charSum % 100) + 45, // 45 to 144
          recentLogins: (charSum % 10) + 2, // 2 to 11
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load admin profile.",
        });
        router.push('/dashboard/admins');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAdminProfile();
  }, [id, router, toast]);

  const handleEditArtist = (artist: any) => {
    setIsArtistModalOpen(false);
    setEditingArtist(null);
    setTimeout(() => {
      setEditingArtist(artist);
      setIsArtistModalOpen(true);
    }, 100);
  };

  const handleArtistModalChange = (open: boolean) => {
    setIsArtistModalOpen(open);
    if (!open) {
      setTimeout(() => setEditingArtist(null), 200);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
      </div>
    );
  }

  if (!admin) return null;

  const isSuperAdmin = admin.role === 'super_admin';

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header / Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/admins"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <span className="section-label">Team Member Profile</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Administrator Dashboard
            </h1>
          </div>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="bg-white border border-slate-200 shadow-sm text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm flex items-center gap-2"
        >
          <Edit3 size={16} />
          <span className="hidden sm:inline">Edit Profile</span>
        </button>
      </div>

      {/* Main Profile Card (Glassmorphism + Gradients) */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-luxe">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-rose-500/5 opacity-50" />
        
        <div className="relative p-10 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-indigo-600 to-[#7578F2] flex items-center justify-center text-white font-black text-5xl shadow-xl shadow-indigo-200 shrink-0 transform hover:scale-105 transition-transform duration-300 overflow-hidden relative">
            {admin.avatar_url ? (
              <img src={admin.avatar_url} alt="Admin Profile" className="w-full h-full object-cover" />
            ) : (
              admin.full_name?.[0]?.toUpperCase() || (admin as any).email?.[0]?.toUpperCase() || 'A'
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-slate-900">{admin.full_name || 'System Administrator'}</h2>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 md:mt-0",
                  isSuperAdmin
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                )}>
                  {isSuperAdmin ? <ShieldAlert size={12} strokeWidth={3} /> : <ShieldCheck size={12} strokeWidth={3} />}
                  {isSuperAdmin ? 'Super Admin' : 'Editor'}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-medium text-[15px]">
                <Mail size={16} className="text-slate-400" />
                {(admin as any).email}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-sm font-bold text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                Joined {format(new Date(admin.created_at), 'MMMM dd, yyyy')}
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-sm font-bold text-slate-600">
                <Activity size={16} className="text-emerald-500" />
                Status: Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#7578F2] mb-6 border border-indigo-100">
            <LayoutTemplate size={24} strokeWidth={2} />
          </div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">Cards Uploaded</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900">{stats.cardsUploaded}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-6 border border-rose-100">
            <Clock size={24} strokeWidth={2} />
          </div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">Hours Active</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900">{stats.hoursActive}<span className="text-2xl text-slate-400">h</span></h3>
            <span className="text-sm font-bold text-rose-500 mb-1">Steady</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 border border-amber-100">
            <Zap size={24} strokeWidth={2} />
          </div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">Recent Actions</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900">{stats.recentLogins * 14}</h3>
            <span className="text-sm font-bold text-emerald-500 mb-1">Events logged</span>
          </div>
        </div>

      </div>

      {/* Uploaded Profiles List */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col mb-10 gap-6">
          <h3 className="text-[13px] font-black tracking-[0.25em] text-slate-900 uppercase">
            Uploaded Profiles
          </h3>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit shadow-inner">
            <button 
              className={`px-8 py-3 rounded-xl text-[13px] font-black transition-all flex items-center gap-2 ${filterType === 'all' ? 'bg-white text-slate-800 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
              onClick={() => setFilterType('all')}
            >
              <User size={16} />
              All Profiles
              <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${filterType === 'all' ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'}`}>{uploadedArtists.length}</span>
            </button>
            <button 
              className={`px-8 py-3 rounded-xl text-[13px] font-black transition-all flex items-center gap-2 ${filterType === 'original' ? 'bg-white text-indigo-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
              onClick={() => setFilterType('original')}
            >
              <Mic2 size={16} />
              Original Profiles 
              <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${filterType === 'original' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>{uploadedArtists.filter(a => !a.is_duplicate_pending).length}</span>
            </button>
            <button 
              className={`px-8 py-3 rounded-xl text-[13px] font-black transition-all flex items-center gap-2 ${filterType === 'duplicate' ? 'bg-white text-rose-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
              onClick={() => setFilterType('duplicate')}
            >
              <Layers size={16} />
              Duplicate Profiles
              <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${filterType === 'duplicate' ? 'bg-rose-50 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>{uploadedArtists.filter(a => a.is_duplicate_pending).length}</span>
            </button>
          </div>
        </div>

        <div className="space-y-4 relative">
          {uploadedArtists
            .filter(a => filterType === 'all' ? true : filterType === 'original' ? !a.is_duplicate_pending : a.is_duplicate_pending)
            .map((artist, i) => (
            <div 
              key={artist.id || i} 
              onClick={() => handleEditArtist(artist)}
              className="group flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[24px] border border-slate-50 hover:border-indigo-100 bg-white hover:bg-indigo-50/20 transition-all duration-300 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-slate-400 font-bold text-xl relative">
                {artist.artist_images?.[0]?.image_url ? (
                  <img src={artist.artist_images[0].image_url} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  artist.name.charAt(0)
                )}
                {artist.is_duplicate_pending && (
                  <div className="absolute inset-0 bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl" />
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                      <h4 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                        {artist.name}
                      </h4>
                      {artist.is_duplicate_pending ? (
                        <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-amber-200">
                          {artist.duplicate_status || 'Pending'} Dup
                        </span>
                      ) : artist.is_live ? (
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-200">Live</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200">Hidden</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600">{artist.category}</span>
                      {artist.alias && <span>{artist.alias}</span>}
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="truncate max-w-[200px]">{artist.city}, {artist.state}</span>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Added</span>
                    <span className="text-sm font-black text-slate-900">
                      {new Date(artist.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {uploadedArtists.filter(a => filterType === 'all' ? true : filterType === 'original' ? !a.is_duplicate_pending : a.is_duplicate_pending).length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[24px]">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-300">
                <User size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No {filterType === 'all' ? '' : filterType} profiles found</h4>
              <p className="text-xs font-medium text-slate-500 mt-1">This user hasn't uploaded any {filterType === 'all' ? '' : filterType} artist profiles yet.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <EditAdminModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        adminData={admin}
        onSuccess={() => {
          // Give API a moment to persist, then reload to fetch fresh admin info
          setTimeout(() => window.location.reload(), 500);
        }}
      />
      <CreateArtistModal
        key={editingArtist?.id || 'new'}
        open={isArtistModalOpen}
        onOpenChange={handleArtistModalChange}
        onSuccess={() => {}}
        initialData={editingArtist}
      />
    </div>
  );
}
