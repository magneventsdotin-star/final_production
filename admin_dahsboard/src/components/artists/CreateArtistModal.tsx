"use client";
import { useState, useEffect, useRef } from 'react';
import { State, City } from 'country-state-city';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogClose,
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Loader2, 
  User, 
  Phone, 
  Mail, 
  Music, 
  Globe, 
  MapPin, 
  DollarSign, 
  IndianRupee,
  Star, 
  Calendar,
  Layers,
  Info,
  ImageIcon,
  PlayCircle,
  X,
  Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Switch } from '@/components/ui/switch';
import { ImageUploader } from './ImageUploader';
import { CATEGORIES, INDIAN_LANGUAGES } from '@/lib/constants';

const artistSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  alias: z.string().min(2, { message: "Alias must be at least 2 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  sub_categories: z.array(z.string()).min(1, { message: "Select at least one genre." }),
  languages: z.array(z.string()).min(1, { message: "Select at least one language." }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }),
  price_min: z.string().min(1, { message: "Min price is required." }),
  price_max: z.string().min(1, { message: "Max price is required." }),
  original_price: z.string().optional(),
  exclusive_price: z.string().optional(),
  city: z.string().min(1, { message: "City is required." }),
  state: z.string().min(1, { message: "State is required." }),
  locality: z.string().min(2, { message: "Locality is required." }),
  address: z.string().min(5, { message: "Full address is required." }),
  rating: z.string().optional(),
  successful_bookings: z.string().optional(),
  members_min: z.string().min(1, { message: "Min members required." }),
  members_max: z.string().min(1, { message: "Max members required." }),
  performance_duration: z.string().optional(),
  video_urls: z.array(z.string().url({ message: "Please enter a valid URL." }).or(z.literal(''))).optional().default(['']),
  contact_person: z.string().min(2, { message: "Primary contact is mandatory." }),
  phone_no: z.string().regex(/^[0-9]{10}$/, { message: "Phone number must be exactly 10 digits." }),
  phone_no_alt: z.string().regex(/^[0-9]{10}$/, { message: "Alt phone number must be 10 digits." }).optional().or(z.literal('')),
  email: z.string()
    .email({ message: "Invalid email address." })
    .refine((val) => val.toLowerCase().endsWith("@gmail.com"), {
      message: "Only @gmail.com addresses are allowed.",
    }),
  is_popular: z.boolean().default(false),
  is_artist_of_month: z.boolean().default(false),
  images: z.array(z.string()).max(15, { message: "Maximum 15 photos allowed." }).optional().default([]),
  cover_image_url: z.string().optional(),
});
type ArtistFormValues = z.infer<typeof artistSchema>;
interface CreateArtistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: any;
}
export function CreateArtistModal({ open, onOpenChange, onSuccess, initialData }: CreateArtistModalProps) {
  const [loading, setLoading] = useState(false);
  const [isManualCity, setIsManualCity] = useState(false);
  const [isManualCategory, setIsManualCategory] = useState(false);
  const [isManualState, setIsManualState] = useState(false);
  const [customGenre, setCustomGenre] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      name: initialData?.name || "",
      alias: initialData?.alias || "",
      category: initialData?.category || "",
      bio: initialData?.bio || "",
      price_min: initialData?.price_min?.toString() || "",
      price_max: initialData?.price_max?.toString() || "",
      original_price: initialData?.original_price?.toString() || "",
      exclusive_price: initialData?.exclusive_price?.toString() || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      locality: initialData?.locality || "",
      address: initialData?.address || "",
      rating: initialData?.rating?.toString() || "5.0",
      successful_bookings: initialData?.successful_bookings?.toString() || "0",
      members_min: initialData?.members_min?.toString() || "1",
      members_max: initialData?.members_max?.toString() || "1",
      performance_duration: initialData?.performance_duration || "60-90 mins",
      video_urls: (initialData?.video_url ? initialData.video_url.split(',').map((s: string) => s.trim()).filter(Boolean) : [""]),
      email: initialData?.email || "",
      contact_person: initialData?.contact_person || "",
      phone_no: initialData?.phone_no || "",
      phone_no_alt: initialData?.phone_no_alt || "",
      is_popular: initialData?.is_popular ?? false,
      is_artist_of_month: initialData?.is_artist_of_month ?? false,
      images: initialData?.artist_images?.map((img: any) => img.image_url) || [],
      cover_image_url: initialData?.cover_image_url || initialData?.artist_images?.[0]?.image_url || "",
      sub_categories: (initialData?.sub_categories && initialData.sub_categories.length > 0) 
        ? initialData.sub_categories 
        : (initialData?.sub_category ? initialData.sub_category.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      languages: (initialData?.languages && initialData.languages.length > 0) 
        ? initialData.languages 
        : (initialData?.performing_language ? initialData.performing_language.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
    },
  });
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name || "",
          alias: initialData.alias || "",
          category: initialData.category || "",
          bio: initialData.bio || "",
          price_min: initialData.price_min?.toString() || "",
          price_max: initialData.price_max?.toString() || "",
          original_price: initialData.original_price?.toString() || "",
          exclusive_price: initialData.exclusive_price?.toString() || "",
          city: initialData.city || "",
          state: initialData.state || "",
          locality: initialData.locality || "",
          address: initialData.address || "",
          rating: initialData.rating?.toString() || "5.0",
          successful_bookings: initialData.successful_bookings?.toString() || "0",
          members_min: initialData.members_min?.toString() || "1",
          members_max: initialData.members_max?.toString() || "1",
          performance_duration: initialData.performance_duration || "60-90 mins",
          video_urls: (initialData.video_url ? initialData.video_url.split(',').map((s: string) => s.trim()).filter(Boolean) : [""]),
          email: initialData.email || "",
          contact_person: initialData.contact_person || "",
          phone_no: initialData.phone_no || "",
          phone_no_alt: initialData.phone_no_alt || "",
          is_popular: initialData.is_popular ?? false,
          is_artist_of_month: initialData.is_artist_of_month ?? false,
          images: initialData.artist_images?.map((img: any) => img.image_url) || [],
          cover_image_url: initialData.cover_image_url || initialData.artist_images?.[0]?.image_url || "",
          sub_categories: (initialData.sub_categories && initialData.sub_categories.length > 0) 
            ? initialData.sub_categories 
            : (initialData.sub_category ? initialData.sub_category.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          languages: (initialData.languages && initialData.languages.length > 0) 
            ? initialData.languages 
            : (initialData.performing_language ? initialData.performing_language.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        });
      } else {
        form.reset({
          name: "",
          alias: "",
          category: "",
          sub_categories: [],
          languages: [],
          bio: "",
          price_min: "",
          price_max: "",
          original_price: "",
          exclusive_price: "",
          city: "",
          state: "",
          locality: "",
          address: "",
          rating: "5.0",
          successful_bookings: "0",
          members_min: "1",
          members_max: "1",
          performance_duration: "60-90 mins",
          video_urls: [""],
          email: "",
          is_popular: false,
          is_artist_of_month: false,
          images: [],
          cover_image_url: "",
        });
      }
      form.clearErrors();
    }
  }, [open, initialData, form]);
  async function onSubmit(values: ArtistFormValues) {
    setLoading(true);
    try {
      const artistData: Record<string, any> = {
        name: values.name,
        alias: values.alias,
        category: values.category,
        sub_category: values.sub_categories.join(', '),
        sub_categories: values.sub_categories,
        performing_language: values.languages.join(', '),
        languages: values.languages,
        bio: values.bio,
        price_min: parseInt(values.price_min),
        price_max: parseInt(values.price_max),
        original_price: values.original_price ? parseInt(values.original_price) : null,
        exclusive_price: values.exclusive_price ? parseInt(values.exclusive_price) : null,
        price_range: `${parseInt(values.price_min)}-${parseInt(values.price_max)}`,
        city: values.city,
        state: values.state,
        locality: values.locality,
        address: values.address,
        contact_person: values.contact_person,
        phone_no: values.phone_no,
        phone_no_alt: values.phone_no_alt || null,
        email: values.email,
        is_popular: values.is_popular,
        is_artist_of_month: values.is_artist_of_month,
        rating: parseFloat(values.rating || '5.0'),
        members_min: parseInt(values.members_min || '1'),
        members_max: parseInt(values.members_max || '1'),
        performance_duration: values.performance_duration || null,
        successful_bookings: parseInt(values.successful_bookings || '0'),
        video_url: values.video_urls?.filter(Boolean).join(', ') || null,
      };
      const images = values.images || [];
      let artistId = initialData?.id;
      if (artistId) {
        const { error: updateError } = await (supabase
          .from('artists') as any)
          .update(artistData)
          .eq('id', artistId);
        if (updateError) throw updateError;
        await supabase.from('artist_images').delete().eq('artist_id', artistId);
      } else {
        const { data: artist, error: artistError } = await (supabase
          .from('artists')
          .insert([artistData] as any)
          .select()
          .single() as any);
        if (artistError) throw artistError;
        artistId = artist.id;
      }
      if (images && images.length > 0) {
        // Reorder images to put cover_image_url first if it exists
        let finalImages = [...images];
        if (values.cover_image_url && finalImages.includes(values.cover_image_url)) {
          finalImages = [
            values.cover_image_url,
            ...finalImages.filter(url => url !== values.cover_image_url)
          ];
        }

        const imageEntries = finalImages.map(url => ({
          artist_id: artistId,
          image_url: url
        }));
        const { error: imageError } = await (supabase
          .from('artist_images')
          .insert(imageEntries as any) as any);
        if (imageError) throw imageError;
      }
      toast({
        title: artistId && initialData ? "Profile Updated" : "Registration Successful",
        description: `Artist ${values.name} has been ${artistId && initialData ? 'updated' : 'added to the registry'}.`,
      });
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "System Error",
        description: error.message || "An unexpected error occurred indexing the artist.",
      });
    } finally {
      setLoading(false);
    }
  }

  const onError = (errors: any) => {
    console.log('Form Validation Errors:', errors);
    
    // Find the first error field and scroll to it
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey && scrollAreaRef.current) {
      const errorElement = document.getElementsByName(firstErrorKey)[0] || 
                          document.querySelector(`[id*="${firstErrorKey}"]`);
      
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="fixed left-[58%] top-[50%] translate-x-[-58%] translate-y-[-50%] max-w-5xl max-h-[95vh] h-[95vh] sm:h-[92vh] overflow-hidden flex flex-col rounded-[24px] sm:rounded-[32px] border-none shadow-2xl p-0 [&>button:last-child]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col flex-1 overflow-hidden bg-white relative">
            <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">

              <div className="bg-slate-900 px-6 sm:px-10 py-10 text-white relative overflow-hidden mb-10">
                <DialogClose className="absolute right-5 top-5 z-20 rounded-full p-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white transition-all active:scale-90 focus:outline-none">
                  <X size={20} strokeWidth={2.5} />
                </DialogClose>
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-400 border border-sky-400/20 shadow-inner flex-shrink-0">
                    <User size={32} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0 p-0">
                      {initialData ? 'Refine Artist Profile' : 'Artist Registration'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 font-medium text-sm sm:text-base max-w-2xl leading-relaxed">
                      {initialData 
                        ? "Update technical details, media, and contact information for this artist profile."
                        : "Register a new artist into the system by providing their profile details and media."}
                    </DialogDescription>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-10 space-y-10 pb-10">

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shadow-sm border border-sky-100/50">
                      <Phone size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">Management Details</h3>
                      <p className="text-[10px] font-semibold text-slate-400">Direct contact info for bookings</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 p-7 rounded-[28px] bg-white border border-slate-100 shadow-luxe-soft">
                    <FormField
                      control={form.control}
                      name="contact_person"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary Contact Person</FormLabel>
                          <FormControl><Input placeholder="Full name" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner placeholder:font-normal" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address (Unique)</FormLabel>
                          <FormControl><Input type="email" placeholder="artist@example.com" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner placeholder:font-normal" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 col-span-full">
                      <FormField
                        control={form.control}
                        name="phone_no"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary Phone (Mandatory)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="00000 00000" 
                                maxLength={10}
                                className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner placeholder:font-normal" 
                                {...field} 
                                value={field.value ?? ''} 
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                  field.onChange(val);
                                }}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone_no_alt"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Secondary Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="00000 00000" 
                                maxLength={10}
                                className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner placeholder:font-normal" 
                                {...field} 
                                value={field.value ?? ''} 
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                  field.onChange(val);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100/50">
                      <User size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">Artist Profile details</h3>
                      <p className="text-[10px] font-semibold text-slate-400">Visible stage presence and genre</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-y-7 p-7 rounded-[28px] bg-white border border-slate-100 shadow-luxe-soft">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</FormLabel>
                            <FormControl><Input placeholder="Artist full name" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner placeholder:font-normal" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage className="text-[10px] font-medium text-rose-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="alias"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Artist Stage Name</FormLabel>
                            <div className="relative group">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600 font-black text-xs group-focus-within:scale-125 transition-all">@</span>
                              <FormControl><Input placeholder="StageName" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold pl-9 focus:bg-white transition-all shadow-inner placeholder:font-normal" {...field} value={field.value ?? ''} /></FormControl>
                            </div>
                            <FormMessage className="text-[10px] font-medium text-rose-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Main Category</FormLabel>
                              {isManualCategory && (
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setIsManualCategory(false);
                                    form.setValue('category', '');
                                    form.setValue('sub_categories', []);
                                  }}
                                  className="text-[10px] font-black text-sky-500 uppercase tracking-wider hover:underline transition-all"
                                >
                                  Show List
                                </button>
                              )}
                            </div>
                            {!isManualCategory ? (
                              <Select 
                                onValueChange={(val) => { 
                                  if (val === 'MANUAL_CATEGORY') {
                                    setIsManualCategory(true);
                                    form.setValue('category', '');
                                    form.setValue('sub_categories', []);
                                  } else {
                                    field.onChange(val); 
                                    form.setValue('sub_categories', []); 
                                  }
                                }} 
                                value={field.value || ''}
                              >
                                <FormControl><SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner"><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                                <SelectContent className="rounded-xl border-slate-100 shadow-luxe p-1">
                                  {Object.keys(CATEGORIES).map(cat => (
                                    <SelectItem key={cat} value={cat} className="rounded-xl py-2 font-bold">{cat}</SelectItem>
                                  ))}
                                  <div className="h-px bg-slate-100 my-1" />
                                  <SelectItem value="MANUAL_CATEGORY" className="text-sky-600 font-black italic rounded-xl">Other / Not in list...</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <FormControl>
                                <Input 
                                  placeholder="Type category (e.g. Magic Show)" 
                                  {...field} 
                                  className="h-11 rounded-xl border-sky-100 bg-sky-50/20 font-bold focus:bg-white transition-all shadow-inner" 
                                  autoFocus
                                />
                              </FormControl>
                            )}
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-6 pt-2">
                      <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900 bg-slate-50/50 w-fit px-4 py-1.5 rounded-full border border-slate-100">
                        <Layers size={14} className="text-sky-500" />
                        Genres / Sub-categories
                      </FormLabel>
                      <div className="flex flex-wrap gap-2.5">
                        {form.watch('category') && CATEGORIES[form.watch('category') as keyof typeof CATEGORIES] ? (
                          <>
                            {CATEGORIES[form.watch('category') as keyof typeof CATEGORIES].map((genre) => (
                              <button
                                key={genre}
                                type="button"
                                onClick={() => {
                                  const current = form.watch('sub_categories') || [];
                                  if (current.includes(genre)) {
                                    form.setValue('sub_categories', current.filter(g => g !== genre));
                                  } else {
                                    form.setValue('sub_categories', [...current, genre]);
                                  }
                                  form.trigger('sub_categories');
                                }}
                                className={cn(
                                  "px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border shadow-sm uppercase tracking-wider",
                                  (form.watch('sub_categories') || []).includes(genre)
                                    ? "bg-slate-900 text-white border-slate-900 scale-[1.05] shadow-lg shadow-slate-200"
                                    : "bg-white text-slate-500 border-slate-100 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/50"
                                )}
                              >
                                {genre}
                              </button>
                            ))}
                            {/* Render custom genres that are selected but not in standard list */}
                            {(form.watch('sub_categories') || []).filter(g => !CATEGORIES[form.watch('category') as keyof typeof CATEGORIES]?.includes(g)).map((genre) => (
                               <button
                                 key={genre}
                                 type="button"
                                 onClick={() => {
                                   const current = form.watch('sub_categories') || [];
                                   form.setValue('sub_categories', current.filter(g => g !== genre));
                                   form.trigger('sub_categories');
                                 }}
                                 className="px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border shadow-lg bg-sky-600 text-white border-sky-600 scale-[1.05] uppercase tracking-wider flex items-center gap-2"
                               >
                                 {genre} <X size={10} />
                               </button>
                            ))}
                          </>
                        ) : isManualCategory && form.watch('category') ? (
                          <>
                            {(form.watch('sub_categories') || []).map((genre) => (
                              <button
                                key={genre}
                                type="button"
                                onClick={() => {
                                  const current = form.watch('sub_categories') || [];
                                  form.setValue('sub_categories', current.filter(g => g !== genre));
                                  form.trigger('sub_categories');
                                }}
                                className="px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border shadow-lg bg-sky-600 text-white border-sky-600 scale-[1.05] uppercase tracking-wider flex items-center gap-2"
                              >
                                {genre} <X size={10} />
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="w-full py-10 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] bg-slate-50/30 gap-2">
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100"><Layers size={20} className="text-slate-200" /></div>
                            Select a category first to see genres
                          </div>
                        )}

                        {form.watch('category') && (
                          <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200 px-4 py-2 hover:border-sky-300 transition-all focus-within:bg-white focus-within:border-sky-400 focus-within:shadow-sm">
                            <Input 
                              value={customGenre} 
                              onChange={(e) => setCustomGenre(e.target.value)}
                              placeholder="Add Other..."
                              className="w-24 h-6 text-[11px] border-none bg-transparent focus-visible:ring-0 p-0 font-bold uppercase tracking-wider"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const current = form.getValues('sub_categories') || [];
                                  if (customGenre && !current.includes(customGenre)) {
                                    form.setValue('sub_categories', [...current, customGenre]);
                                    setCustomGenre("");
                                  }
                                }
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                const current = form.getValues('sub_categories') || [];
                                if (customGenre && !current.includes(customGenre)) {
                                  form.setValue('sub_categories', [...current, customGenre]);
                                  setCustomGenre("");
                                }
                              }}
                              className="text-sky-500 hover:scale-125 transition-all"
                            >
                              <Plus size={16} strokeWidth={3} />
                            </button>
                          </div>
                        )}
                      </div>
                      <FormMessage className="text-[10px]" />
                    </div>

                    <div className="space-y-6 pt-2">
                      <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900 bg-slate-50/50 w-fit px-4 py-1.5 rounded-full border border-slate-100">
                        <Globe size={14} className="text-sky-500" />
                        Languages
                      </FormLabel>
                      <div className="flex flex-wrap gap-2.5">
                        {INDIAN_LANGUAGES.map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => {
                              const current = form.watch('languages') || [];
                              if (current.includes(lang)) {
                                form.setValue('languages', current.filter(l => l !== lang));
                              } else {
                                form.setValue('languages', [...current, lang]);
                              }
                              form.trigger('languages');
                            }}
                            className={cn(
                              "px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border shadow-sm uppercase tracking-wider",
                              (form.watch('languages') || []).includes(lang)
                                ? "bg-slate-800 text-white border-slate-800 scale-[1.05] shadow-lg shadow-slate-200"
                                : "bg-white text-slate-500 border-slate-100 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/50"
                            )}
                          >
                            {lang}
                          </button>
                        ))}
                        
                        {/* Render custom languages */}
                        {(form.watch('languages') || []).filter(l => !INDIAN_LANGUAGES.includes(l)).map((lang) => (
                           <button
                             key={lang}
                             type="button"
                             onClick={() => {
                               const current = form.watch('languages') || [];
                               form.setValue('languages', current.filter(l => l !== lang));
                               form.trigger('languages');
                             }}
                             className="px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border shadow-lg bg-sky-600 text-white border-sky-600 scale-[1.05] uppercase tracking-wider flex items-center gap-2"
                           >
                             {lang} <X size={10} />
                           </button>
                        ))}

                        <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200 px-4 py-2 hover:border-sky-300 transition-all focus-within:bg-white focus-within:border-sky-400 focus-within:shadow-sm">
                          <Input 
                            value={customLanguage} 
                            onChange={(e) => setCustomLanguage(e.target.value)}
                            placeholder="Add Other..."
                            className="w-24 h-6 text-[11px] border-none bg-transparent focus-visible:ring-0 p-0 font-bold uppercase tracking-wider"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const current = form.getValues('languages') || [];
                                if (customLanguage && !current.includes(customLanguage)) {
                                  form.setValue('languages', [...current, customLanguage]);
                                  setCustomLanguage("");
                                }
                              }
                            }}
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const current = form.getValues('languages') || [];
                              if (customLanguage && !current.includes(customLanguage)) {
                                form.setValue('languages', [...current, customLanguage]);
                                setCustomLanguage("");
                              }
                            }}
                            className="text-sky-500 hover:scale-125 transition-all"
                          >
                            <Plus size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                      <FormMessage className="text-[10px]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                      <DollarSign size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">Performance Metrics</h3>
                      <p className="text-[10px] font-semibold text-slate-400">Commercials and band configuration</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7 p-7 rounded-[28px] bg-white border border-slate-100 shadow-luxe-soft">
                    <div className="space-y-5">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <IndianRupee size={12} className="text-emerald-500" /> Price Range (₹)
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price_min"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] text-slate-500 font-bold uppercase">Minimum</FormLabel>
                              <FormControl><Input type="number" min="1" placeholder="50000" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner" {...field} value={field.value ?? ''} /></FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="price_max"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] text-slate-500 font-bold uppercase">Maximum</FormLabel>
                              <FormControl><Input type="number" min="1" placeholder="150000" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner" {...field} value={field.value ?? ''} /></FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="original_price"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] text-slate-500 font-bold uppercase">Original Price</FormLabel>
                              <FormControl><Input type="number" min="0" placeholder="Optional" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner" {...field} value={field.value ?? ''} /></FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="exclusive_price"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] text-slate-500 font-bold uppercase">Exclusive Price</FormLabel>
                              <FormControl><Input type="number" min="0" placeholder="Optional" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner" {...field} value={field.value ?? ''} /></FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={12} className="text-sky-500" /> Band Members
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="members_min"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] text-slate-500 font-bold uppercase">Min</FormLabel>
                              <FormControl><Input type="number" min="1" placeholder="1" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner" {...field} value={field.value ?? ''} /></FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="members_max"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] text-slate-500 font-bold uppercase">Max</FormLabel>
                              <FormControl><Input type="number" min="1" placeholder="5" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner" {...field} value={field.value ?? ''} /></FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 col-span-full pt-4 border-t border-slate-50">
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">System Rating</FormLabel>
                            <div className="relative group/star">
                              <Star className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 group-focus-within/star:scale-125 transition-all" size={14} fill="currentColor" />
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1" 
                                  min="1" 
                                  max="5" 
                                  className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold pr-10 focus:bg-white transition-all shadow-inner" 
                                  {...field} 
                                  value={field.value ?? ''} 
                                />
                              </FormControl>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="performance_duration"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Duration</FormLabel>
                            <FormControl><Input placeholder="90 mins" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner" {...field} value={field.value ?? ''} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="successful_bookings"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bookings</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner" 
                                {...field} 
                                value={field.value ?? ''} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm border border-orange-100/50">
                      <MapPin size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">Location & Narrative</h3>
                      <p className="text-[10px] font-semibold text-slate-400">Geography and artist story</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-y-7 p-7 rounded-[28px] bg-white border border-slate-100 shadow-luxe-soft">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">State</FormLabel>
                              {isManualState && (
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setIsManualState(false);
                                    setIsManualCity(false);
                                    form.setValue('state', '');
                                    form.setValue('city', '');
                                  }}
                                  className="text-[10px] font-black text-sky-500 uppercase tracking-wider hover:underline transition-all"
                                >
                                  Show List
                                </button>
                              )}
                            </div>
                            {!isManualState ? (
                              <Select 
                                onValueChange={(val) => { 
                                  if (val === 'MANUAL_STATE') {
                                    setIsManualState(true);
                                    setIsManualCity(true);
                                    form.setValue('state', '');
                                    form.setValue('city', '');
                                  } else {
                                    field.onChange(val); 
                                    form.setValue('city', ''); 
                                    setIsManualCity(false);
                                  }
                                }} 
                                value={field.value || ''}
                              >
                                <FormControl><SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner"><SelectValue placeholder="Select State" /></SelectTrigger></FormControl>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-luxe p-1 max-h-[300px]">
                                  {State.getStatesOfCountry("IN").map(state => (
                                    <SelectItem key={state.isoCode} value={state.name} className="rounded-xl py-2 font-bold">{state.name}</SelectItem>
                                  ))}
                                  <div className="h-px bg-slate-100 my-1" />
                                  <SelectItem value="MANUAL_STATE" className="text-sky-600 font-black italic rounded-xl">Other / Not found...</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <FormControl>
                                <Input 
                                  placeholder="Type state (e.g. Goa)" 
                                  {...field} 
                                  className="h-11 rounded-xl border-sky-100 bg-sky-50/20 font-bold focus:bg-white transition-all shadow-inner" 
                                  autoFocus
                                />
                              </FormControl>
                            )}
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => {
                          const selectedStateName = form.watch('state');
                          const states = State.getStatesOfCountry("IN");
                          const selectedState = states.find(s => s.name === selectedStateName);
                          const cities = selectedState ? City.getCitiesOfState("IN", selectedState.isoCode) : [];
                          
                          return (
                            <FormItem className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">City</FormLabel>
                                {isManualCity && (
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      setIsManualCity(false);
                                      form.setValue('city', '');
                                    }}
                                    className="text-[10px] font-black text-sky-500 uppercase tracking-wider hover:underline"
                                  >
                                    Show List
                                  </button>
                                )}
                              </div>
                              
                              {!isManualCity ? (
                                <Select 
                                  onValueChange={(val) => {
                                    if (val === 'MANUAL_CITY') {
                                      setIsManualCity(true);
                                      form.setValue('city', '');
                                    } else {
                                      field.onChange(val);
                                    }
                                  }} 
                                  value={field.value || ''} 
                                  disabled={!selectedStateName}
                                >
                                  <FormControl><SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner disabled:opacity-40" disabled={!selectedStateName}><SelectValue placeholder={selectedStateName ? "Select City" : "Select State First"} /></SelectTrigger></FormControl>
                                  <SelectContent className="rounded-2xl border-slate-100 shadow-luxe p-1 max-h-[300px]">
                                    {cities.map(city => (
                                      <SelectItem key={`${city.name}-${city.latitude}`} value={city.name} className="rounded-xl py-2 font-bold">{city.name}</SelectItem>
                                    ))}
                                    {selectedStateName && (
                                      <>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <SelectItem value="MANUAL_CITY" className="text-sky-600 font-black italic rounded-xl">Other / Not found...</SelectItem>
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <FormControl>
                                  <Input 
                                    placeholder="Enter city..." 
                                    {...field} 
                                    className="h-11 rounded-xl border-sky-100 bg-sky-50/20 font-bold focus:bg-white transition-all shadow-inner" 
                                    autoFocus
                                  />
                                </FormControl>
                              )}
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          );
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="locality"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Locality / Landmark</FormLabel>
                            <FormControl><Input placeholder="e.g. Near Taj Hotel" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner placeholder:font-normal" {...field} value={field.value ?? ''} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Address</FormLabel>
                            <FormControl><Input placeholder="House no, Street name" className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner placeholder:font-normal" {...field} value={field.value ?? ''} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5 col-span-full">
                          <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Professional Bio / Description</FormLabel>
                          <FormControl><Textarea placeholder="Describe the artist's journey, achievements, and performance style..." className="min-h-[120px] rounded-[20px] border-slate-100 bg-slate-50/30 font-medium focus:bg-white transition-all p-4 resize-none shadow-inner leading-relaxed" {...field} /></FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shadow-sm border border-violet-100/50">
                      <ImageIcon size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">Digital Assets</h3>
                      <p className="text-[10px] font-semibold text-slate-400">Media gallery and video showcase</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-y-10 p-7 rounded-[28px] bg-white border border-slate-100 shadow-luxe-soft">
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Photos Registry</FormLabel>
                            <span className={cn(
                              "text-[10px] font-black px-3 py-1 rounded-full border shadow-sm",
                              (field.value || []).length >= 15 ? "text-rose-500 border-rose-100 bg-rose-50" : "text-sky-600 border-sky-100 bg-sky-50"
                            )}>
                              {field.value?.length || 0} / 15 Photos Selected
                            </span>
                          </div>
                          <FormControl>
                            <ImageUploader 
                              images={field.value || []} 
                              onChange={field.onChange} 
                              maxImages={15} 
                            />
                          </FormControl>
                          
                          {(field.value || []).length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                              <FormLabel className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Select Profile Cover Image</FormLabel>
                              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                                {field.value?.map((url, i) => (
                                  <div 
                                    key={i} 
                                    onClick={() => form.setValue('cover_image_url', url)}
                                    className={cn(
                                      "aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all relative group",
                                      form.watch('cover_image_url') === url ? "border-sky-500 shadow-md scale-105" : "border-slate-100 opacity-60 hover:opacity-100 hover:scale-105"
                                    )}
                                  >
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    {form.watch('cover_image_url') === url && (
                                      <div className="absolute inset-0 bg-sky-500/10 flex items-center justify-center">
                                        <div className="bg-sky-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg">COVER</div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    <div className="space-y-6 pt-6 border-t border-slate-50">
                      <div className="flex items-center justify-between">
                        <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900 bg-slate-50/50 w-fit px-4 py-1.5 rounded-full border border-slate-100">
                          <PlayCircle size={14} className="text-red-500" />
                          Work Showcase (YouTube)
                        </FormLabel>
                        <button
                          type="button"
                          onClick={() => {
                            const current = form.getValues('video_urls') || [];
                            form.setValue('video_urls', [...current, '']);
                          }}
                          className="text-[9px] font-black text-white uppercase tracking-widest bg-sky-600 px-4 py-2 rounded-xl shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95 flex items-center gap-2"
                        >
                          + Add Link
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {(form.watch('video_urls') || [""]).map((_, index) => (
                          <FormField
                            key={index}
                            control={form.control}
                            name={`video_urls.${index}`}
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <div className="flex gap-3">
                                  <div className="relative flex-1 group/input">
                                    <div className="absolute left-0 top-0 bottom-0 w-12 rounded-l-xl bg-slate-50/50 border-r border-slate-100 flex items-center justify-center text-slate-300 group-focus-within/input:text-red-500 transition-all">
                                      <PlayCircle size={14} />
                                    </div>
                                    <FormControl>
                                      <Input 
                                        placeholder="https://youtube.com/watch?v=..." 
                                        className="h-11 pl-16 rounded-xl border-slate-100 bg-slate-50/30 font-medium focus:bg-white focus:border-red-500/30 focus:ring-4 focus:ring-red-500/5 transition-all text-[11px] shadow-inner" 
                                        {...field} value={field.value ?? ''}
                                      />
                                    </FormControl>
                                  </div>
                                  {(form.watch('video_urls') || []).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = form.getValues('video_urls') || [];
                                        form.setValue('video_urls', current.filter((_, i) => i !== index));
                                      }}
                                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-300 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/50 transition-all flex-shrink-0 shadow-sm"
                                    >
                                      <X size={15} />
                                    </button>
                                  )}
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                      <FormField
                        control={form.control}
                        name="is_popular"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 bg-slate-50/30 hover:border-sky-100 transition-all shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-900">Spotlight Status</FormLabel>
                              <p className="text-[9px] font-semibold text-slate-400 italic">Set as Trending Profile</p>
                            </div>
                            <FormControl>
                              <Select
                                value={field.value ? 'popular' : 'standard'}
                                onValueChange={(val) => field.onChange(val === 'popular')}
                              >
                                <SelectTrigger className="w-[120px] h-9 rounded-xl border-slate-200 bg-white text-[11px] font-black shadow-sm focus:ring-sky-400">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-lg p-1">
                                  <SelectItem value="standard" className="rounded-lg text-[11px] font-black text-slate-700 py-2">
                                    ⭐ Featured Artist
                                  </SelectItem>
                                  <SelectItem value="popular" className="rounded-lg text-[11px] font-black text-amber-600 py-2">
                                    🔥 Trending Profile
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="is_artist_of_month"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 bg-slate-50/30 hover:border-indigo-100 transition-all shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-900">Artist Of Month</FormLabel>
                              <p className="text-[9px] font-semibold text-slate-400 italic">Featured placement</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-indigo-500" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 sm:px-10 py-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-none flex-shrink-0 z-40">
               <button 
                  type="button" 
                  onClick={() => onOpenChange(false)} 
                  className="rounded-xl px-8 h-10 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 bg-white hover:text-slate-900 border border-slate-200 shadow-sm transition-all active:scale-95"
                >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="rounded-xl px-10 h-10 font-black text-[10px] uppercase tracking-[0.2em] bg-sky-500 text-white hover:bg-sky-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {initialData ? 'Update Profile' : 'Save Artist Profile'}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}