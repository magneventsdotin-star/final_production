"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  User,
  Mail,
  Shield,
  Lock,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';

const editSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  role: z.string().optional(),
  password: z.string().optional(),
  avatar_url: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

interface EditAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminData: any;
  onSuccess?: () => void;
}

export function EditAdminModal({ open, onOpenChange, adminData, onSuccess }: EditAdminModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      full_name: "",
      email: "",
      role: "admin",
      password: "",
      avatar_url: "",
    },
  });

  useEffect(() => {
    if (adminData && open) {
      form.reset({
        full_name: adminData.full_name || "",
        email: adminData.email || "",
        role: adminData.role || "admin",
        password: "",
        avatar_url: adminData.avatar_url || "",
      });
    }
  }, [adminData, open, form]);

  async function onSubmit(data: EditFormValues) {
    setLoading(true);
    try {
      const payload: any = { userId: adminData.id };
      
      if (data.full_name !== adminData.full_name) payload.full_name = data.full_name;
      if (data.email !== adminData.email) payload.email = data.email;
      if (data.role !== adminData.role) payload.role = data.role;
      if (data.avatar_url !== adminData.avatar_url) payload.avatar_url = data.avatar_url;
      if (data.password && data.password.length >= 6) payload.password = data.password;

      if (Object.keys(payload).length === 1) {
        toast({ title: "No changes", description: "No details were modified." });
        onOpenChange(false);
        return;
      }

      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Update failed');
      }

      toast({
        title: "Success",
        description: `Admin profile has been updated.`,
        className: "bg-emerald-50 border-emerald-200 text-emerald-900",
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "An unexpected error occurred during update.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] p-0 border border-slate-200 rounded-2xl shadow-luxe overflow-hidden bg-white"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="bg-slate-50 border-b border-slate-100 p-8 relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield size={80} />
          </div>
          <DialogTitle className="text-2xl font-semibold tracking-tight mb-2 text-slate-900 flex items-center gap-3">
            <Edit3 size={24} className="text-[#5B5AF7]" />
            Edit Admin
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-sm">
            Modify details and permissions for this administrator.
          </DialogDescription>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
            
            {/* Avatar Upload Section */}
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center space-y-4 mb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
                      {field.value ? (
                        <img src={field.value} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={40} className="text-slate-300" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {uploadingAvatar ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Edit3 className="w-6 h-6 text-white" />}
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingAvatar(true);
                      try {
                        const urlRes = await fetch('/api/upload-url', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ filename: file.name, contentType: file.type })
                        });
                        const urlResult = await urlRes.json();
                        if (!urlRes.ok) throw new Error(urlResult.error || 'Failed to get upload URL');

                        const { signedUrl, url } = urlResult;
                        const uploadRes = await fetch(signedUrl, {
                          method: 'PUT',
                          body: file,
                          headers: { 'Content-Type': file.type }
                        });
                        if (!uploadRes.ok) throw new Error('Upload failed');
                        const result = { url };
                        if (result.url) {
                          form.setValue('avatar_url', result.url, { shouldDirty: true });
                          toast({ title: "Avatar Uploaded", description: "Successfully updated profile picture." });
                        }
                      } catch (err: any) {
                        toast({ variant: "destructive", title: "Upload Error", description: err.message || "Failed to process image." });
                      } finally {
                        setUploadingAvatar(false);
                      }
                    }}
                  />
                  <div className="text-center">
                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">Profile Picture</FormLabel>
                    <p className="text-xs text-slate-400 mt-1">Click to upload a new photo</p>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">Full Name</FormLabel>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <FormControl>
                      <Input placeholder="e.g. Rahul Sharma" className="h-12 border-slate-200 bg-white pl-11 rounded-xl focus-visible:ring-[#5B5AF7]/10 focus-visible:border-[#5B5AF7] transition-all font-medium text-sm" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs font-medium text-rose-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">Email Address</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <FormControl>
                      <Input type="email" placeholder="rahul@gmail.com" className="h-12 border-slate-200 bg-white pl-11 rounded-xl focus-visible:ring-[#5B5AF7]/10 focus-visible:border-[#5B5AF7] transition-all font-medium text-sm" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs font-medium text-rose-500" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-slate-200 bg-white rounded-xl font-medium text-sm hover:border-[#5B5AF7] transition-colors">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-slate-200 shadow-lg p-1">
                        <SelectItem value="admin" className="rounded-lg py-2.5 focus:bg-indigo-50 focus:text-[#5B5AF7] font-medium">Standard Admin</SelectItem>
                        <SelectItem value="super_admin" className="rounded-lg py-2.5 focus:bg-indigo-50 focus:text-[#5B5AF7] font-medium">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">New Password</FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <FormControl>
                        <Input type={showPassword ? "text" : "password"} placeholder="Leave blank to keep" className="h-12 border-slate-200 bg-white pl-11 pr-10 rounded-xl focus-visible:ring-[#5B5AF7]/10 focus-visible:border-[#5B5AF7] transition-all font-medium text-sm" {...field} />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#5B5AF7] transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-11 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] h-12 rounded-xl font-bold text-xs uppercase tracking-widest bg-[#5B5AF7] text-white hover:bg-[#4338CA] transition-all flex items-center justify-center gap-2.5 shadow-sm"
              >
                {loading && <Loader2 className="animate-spin h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
