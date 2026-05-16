"use client";

import { useState, useEffect, useCallback } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { 
  UserPlus, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  Mail, 
  Info,
  ShieldAlert,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CreateAdminModal } from '../../../components/admins/CreateAdminModal';

export default function AdminManagement() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getAuthUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (user) {
          setCurrentUserEmail(user.email || '');
          

          const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL?.toLowerCase();
          if (user.email && superAdminEmail && user.email.toLowerCase() === superAdminEmail) {
            setCurrentUserRole('super_admin');
            return;
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          setCurrentUserRole((profile as any)?.role || user.user_metadata?.role || 'admin');
        }
      } catch (e) {
        // Auth context failed
      }
    };
    getAuthUser();
  }, []);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Database Error",
          description: "Could not fetch admin list.",
        });
      } else {
        setAdmins(data || []);
      }
    } catch (err) {
      // Error fetching admins
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to fully delete ${email}? This will remove them from the system entirely.`)) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      toast({
        title: "System Cleaned",
        description: `Admin ${email} has been removed from Auth and Database.`,
      });
      fetchAdmins();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: err.message === 'Unexpected token < in JSON at position 0' 
          ? "Service Role Key is missing in .env file." 
          : err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div className="section-header">
          <span className="section-label">Team Control</span>
          <h1 className="section-title text-slate-900">
            Admin Registry
          </h1>
          <p className="text-body mt-1 max-w-2xl font-medium">Manage team members with administrative access.</p>
        </div>
        {currentUserRole === 'super_admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary h-11 px-6 text-[12px] font-bold uppercase tracking-wider shadow-btn"
          >
            <UserPlus size={16} strokeWidth={2.5} />
            Add Admin
          </button>
        )}
      </div>

      {currentUserRole !== null && currentUserRole !== 'super_admin' && (
        <div className="luxe-card p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Only Super Administrators have permission to manage team members and access levels.
            </p>
          </div>
        </div>
      )}

      {currentUserRole === 'super_admin' && (
        <>
          <CreateAdminModal 
            open={isModalOpen} 
            onOpenChange={setIsModalOpen}
            onSuccess={fetchAdmins}
          />

          <div className="luxe-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="pl-8 h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500">Administrator</TableHead>
                    <TableHead className="h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500">Access Level</TableHead>
                    <TableHead className="h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500">Email Address</TableHead>
                    <TableHead className="h-14 text-[11px] font-bold uppercase tracking-widest text-slate-500">Joined Date</TableHead>
                    <TableHead className="h-14 pr-8 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-72 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
                              <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching Team Profiles...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                  ) : admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-72 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <ShieldCheck size={48} className="text-slate-200" />
                          <p className="text-lg font-bold text-slate-400">No administrators found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-indigo-50 group-hover:text-[#7578F2] transition-colors">
                              {admin.full_name?.[0]?.toUpperCase() || admin.email?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div className="flex flex-col">
                              <p className="font-bold text-slate-900 text-[14px] leading-tight flex items-center gap-2">
                                {admin.full_name || 'System Administrator'}
                                {admin.email === currentUserEmail && (
                                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[9px] font-black uppercase text-[#7578F2] border border-indigo-100 italic">You</span>
                                )}
                              </p>
                              <span className="text-[12px] font-bold text-slate-400 mt-1">ID: {admin.id.substring(0, 8)}...</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                            admin.role === 'super_admin' 
                              ? "bg-purple-50 text-purple-600 border border-purple-100 shadow-sm" 
                              : "bg-indigo-50 text-[#7578F2] border border-indigo-100 shadow-sm"
                          )}>
                            <ShieldAlert size={12} strokeWidth={3} />
                            {admin.role === 'super_admin' ? 'Super Admin' : 'Editor'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                            <Mail size={14} className="text-slate-300" strokeWidth={2.5} />
                            {admin.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] font-bold text-slate-500 font-display">
                          {admin.created_at ? format(new Date(admin.created_at), 'MMM dd, yyyy') : '—'}
                        </TableCell>
                        <TableCell className="pr-8 text-center">
                          {admin.email !== currentUserEmail && currentUserRole === 'super_admin' && (
                            <button 
                              onClick={() => handleDelete(admin.id, admin.email)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-slate-100 hover:border-rose-500 hover:text-rose-500 text-slate-400 transition-colors shadow-sm"
                              title="Revoke Access"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-200/50 shadow-sm">
                 <Info size={14} className="text-[#7578F2]" strokeWidth={2.5} />
               </div>
               <p className="text-[13px] font-bold text-slate-500">
                 Total Team Members: <span className="text-slate-900 font-black">{admins.length}</span>
               </p>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
