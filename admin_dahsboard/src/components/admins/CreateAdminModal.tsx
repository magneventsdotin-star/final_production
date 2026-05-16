"use client";

import { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const adminSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string()
    .email({ message: "Invalid email address." })
    .refine((val) => val.toLowerCase().endsWith("@gmail.com"), {
      message: "Only @gmail.com addresses are allowed.",
    }),
  role: z.string({ required_error: "Please select a role." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type AdminFormValues = z.infer<typeof adminSchema>;

interface CreateAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAdminModal({ open, onOpenChange, onSuccess }: CreateAdminModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      full_name: "",
      email: "",
      role: "admin",
      password: "",
    },
  });

  async function onSubmit(data: AdminFormValues) {
    setLoading(true);
    try {
      // 1. Call the new robust Registration API
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      toast({
        title: "Success",
        description: `${data.full_name} is now an Admin.`,
        className: "bg-emerald-50 border-emerald-200 text-emerald-900",
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred during registration.",
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
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-slate-50 border-b border-slate-100 p-8 relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield size={80} />
          </div>
          <DialogTitle className="text-2xl font-semibold tracking-tight mb-2 text-slate-900 flex items-center gap-3">
            <ShieldCheck size={24} className="text-[#5B5AF7]" />
            Add Admin
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-sm">
            Grant administrative access to a new team member.
          </DialogDescription>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">Full Name</FormLabel>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <FormControl>
                      <Input placeholder="Full name" className="h-12 border-slate-200 bg-white pl-11 rounded-xl focus-visible:ring-[#5B5AF7]/10 focus-visible:border-[#5B5AF7] transition-all font-medium text-sm" {...field} />
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
                      <Input type="email" placeholder="name@example.com" className="h-12 border-slate-200 bg-white pl-11 rounded-xl focus-visible:ring-[#5B5AF7]/10 focus-visible:border-[#5B5AF7] transition-all font-medium text-sm" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">Password</FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className="h-12 border-slate-200 bg-white pl-11 rounded-xl focus-visible:ring-[#5B5AF7]/10 focus-visible:border-[#5B5AF7] transition-all font-medium text-sm" {...field} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-start">
              <ShieldCheck size={18} className="text-[#5B5AF7] mt-0.5 shrink-0" />
              <p className="text-xs text-[#64748B] leading-relaxed">
                This will grant dashboard access. <span className="text-slate-900 font-semibold">Super Admins</span> can manage other admins and have full platform control.
              </p>
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
                Add Admin
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
