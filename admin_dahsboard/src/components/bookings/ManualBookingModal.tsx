"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, User, MapPin, IndianRupee, Info, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { State, City } from 'country-state-city';
import { cn } from '@/lib/utils';

const bookingSchema = z.object({
  artist_id: z.string().min(1, "Please select an artist."),
  client_name: z.string().min(2, "Client name is required."),
  client_email: z.string().min(3, "Email or ID is required."),
  client_phone: z.string().regex(/^[0-9]{10}$/, { message: "Phone number must be exactly 10 digits." }),
  event_type: z.string().min(2, "Event type is required."),
  event_date: z.string().min(1, "Event date is required."),
  event_time: z.string().optional(),
  state: z.string().min(1, "State is required."),
  city: z.string().min(1, "City is required."),
  venue: z.string().min(2, "Venue details are required."),
  budget: z.string().min(1, "Budget is required."),
  notes: z.string().optional(),
  status: z.string().default('pending'),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface ManualBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialArtistId?: string;
}

export function ManualBookingModal({ open, onOpenChange, onSuccess, initialArtistId }: ManualBookingModalProps) {
  const [artists, setArtists] = useState<{ id: string, name: string, alias: string, price_min?: number, price_max?: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isManualCity, setIsManualCity] = useState(false);
  const [isManualEventType, setIsManualEventType] = useState(false);
  const [isManualState, setIsManualState] = useState(false);
  const [isManualArtist, setIsManualArtist] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      artist_id: initialArtistId || '',
      client_name: '',
      client_email: '',
      client_phone: '',
      event_type: 'Corporate Event',
      event_date: '',
      event_time: '',
      state: 'Maharashtra',
      city: '',
      venue: '',
      budget: '',
      notes: '',
      status: 'pending',
    },
  });

  useEffect(() => {
    async function fetchArtists() {
      const { data, error } = await supabase
        .from('artists')
        .select('id, name, alias, price_min, price_max, members_min, members_max')
        .order('name', { ascending: true });
      
      if (!error && data) {
        setArtists(data);
      }
    }
    if (open) {
      fetchArtists();
      form.reset({
        artist_id: initialArtistId || '',
        client_name: '',
        client_email: '',
        client_phone: '',
        event_type: 'Corporate Event',
        event_date: '',
        event_time: '',
        state: 'Maharashtra',
        city: '',
        venue: '',
        budget: '',
        notes: '',
        status: 'pending',
      });
    }
  }, [open, form, initialArtistId]);

  async function onSubmit(values: BookingFormValues) {
    if (loading) return;
    setLoading(true);
    try {
      const payload: any = {
        ...values,
        budget: parseInt(values.budget),
        booking_source: 'manual',
        created_at: new Date().toISOString(),
      };
      if (isManualArtist) {
        payload.custom_artist_name = values.artist_id;
        payload.artist_id = null;
      } else if (payload.artist_id === "") {
        payload.artist_id = null;
      }

      const { error } = await (supabase
        .from('bookings') as any)
        .insert([payload]);

      if (error) throw error;

      toast({
        title: "Booking Created",
        description: "The manual booking has been successfully recorded.",
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create booking.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-[28px] border-none shadow-2xl p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="bg-slate-900 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                <Calendar size={20} strokeWidth={2.5} />
              </div>
              Manual Booking
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Manually register a booking for an artist in the system.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="p-8 sm:p-10 space-y-8 bg-white"
            autoComplete="off"
          >
            {/* Hidden inputs to trick browser autofill */}
            <input type="text" name="email" style={{ display: 'none' }} autoComplete="off" />
            <input type="password" name="password" style={{ display: 'none' }} autoComplete="off" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/**/}
              <FormField
                control={form.control}
                name="artist_id"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Select Artist</FormLabel>
                      {isManualArtist && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsManualArtist(false);
                            form.setValue('artist_id', '');
                          }}
                          className="text-[10px] font-black text-sky-500 uppercase tracking-wider hover:underline transition-all"
                        >
                          Show List
                        </button>
                      )}
                    </div>
                    {!isManualArtist ? (
                      <Select 
                        onValueChange={(val) => {
                          if (val === 'MANUAL_ARTIST') {
                            setIsManualArtist(true);
                            form.setValue('artist_id', '');
                          } else {
                            field.onChange(val);
                          }
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:ring-[#7578F2]/10 transition-all">
                            <SelectValue placeholder="Search and select an artist..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-luxe p-1 z-[100]">
                          {artists.map((artist) => (
                            <SelectItem key={artist.id} value={artist.id} className="rounded-xl py-3 font-bold">
                              {artist.name} {artist.alias ? `(@${artist.alias})` : ''}
                            </SelectItem>
                          ))}
                          <div className="h-px bg-slate-100 my-1" />
                          <SelectItem value="MANUAL_ARTIST" className="text-sky-600 font-black italic rounded-xl">Other / Not in list...</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <FormControl>
                        <Input 
                          placeholder="Type artist name manually..." 
                          autoComplete="off"
                          {...field} 
                          className="h-12 rounded-xl border-sky-100 bg-sky-50/20 font-bold focus:bg-white transition-all shadow-inner" 
                          autoFocus
                        />
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/*  */}
              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50/50 border border-slate-100 mt-2">
                <div className="col-span-full mb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-600 flex items-center gap-2">
                    <User size={14} /> Client Information
                  </h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="client_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-500">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Client Name" autoComplete="off" {...field} className="h-11 rounded-xl border-slate-200 bg-white font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-500">Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="client@example.com" autoComplete="off" {...field} className="h-11 rounded-xl border-slate-200 bg-white font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_phone"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[11px] font-bold text-slate-500">Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="00000 00000" 
                          maxLength={10}
                          autoComplete="off" 
                          {...field} 
                          className="h-11 rounded-xl border-slate-200 bg-white font-bold" 
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            field.onChange(val);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/*  */}
              <div className="col-span-full space-y-6">
                <div className="flex items-center gap-3 pt-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                    <Info size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">Event Configuration</h3>
                    <p className="text-[10px] font-semibold text-slate-400">Standardize venue and budget details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 p-7 rounded-[28px] bg-white border border-slate-100 shadow-luxe-soft">

                <FormField
                  control={form.control}
                  name="event_type"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Event Type</FormLabel>
                        {isManualEventType && (
                          <button 
                            type="button" 
                            onClick={() => {
                              setIsManualEventType(false);
                              form.setValue('event_type', 'Corporate Event');
                            }}
                            className="text-[10px] font-black text-sky-500 uppercase tracking-wider hover:underline transition-all"
                          >
                            Show List
                          </button>
                        )}
                      </div>
                      {!isManualEventType ? (
                        <Select 
                          onValueChange={(val) => {
                            if (val === 'MANUAL_EVENT_TYPE') {
                              setIsManualEventType(true);
                              form.setValue('event_type', '');
                            } else {
                              field.onChange(val);
                            }
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl border-slate-100 shadow-luxe p-1 z-[100]">
                            {['Wedding', 'Corporate Event', 'Private Party', 'Birthday Party', 'College Fest', 'Concert/Gig', 'Anniversary', 'Festival', 'Product Launch', 'Exhibition'].map(type => (
                              <SelectItem key={type} value={type} className="rounded-xl py-2 font-bold">{type}</SelectItem>
                            ))}
                            <div className="h-px bg-slate-100 my-1" />
                            <SelectItem value="MANUAL_EVENT_TYPE" className="text-sky-600 font-black italic rounded-xl">Other / Not in list...</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormControl>
                          <Input 
                            placeholder="Type event type (e.g. Award Show)" 
                            autoComplete="off"
                            {...field} 
                            className="h-12 rounded-2xl border-sky-100 bg-sky-50/20 font-bold focus:bg-white transition-all shadow-inner" 
                            autoFocus
                          />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Booking Budget</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" size={14} strokeWidth={3} />
                          <Input 
                            type="number" 
                            placeholder="0" 
                            autoComplete="off"
                            {...field} 
                            className="h-12 pl-10 rounded-2xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner" 
                          />
                        </div>
                      </FormControl>
                      {(() => {
                        const artistId = form.getValues('artist_id');
                        const artist = artists.find(a => a.id === artistId);
                        if (!artist || !field.value || isManualArtist) return null;
                        
                        const budget = parseInt(field.value);
                        const inRange = budget >= (artist.price_min || 0) && budget <= (artist.price_max || Infinity);
                        
                        return (
                          <div className={cn(
                            "mt-2 px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 border transition-all animate-in fade-in slide-in-from-top-1",
                            inRange 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                              : "bg-rose-50 text-rose-600 border-rose-100"
                          )}>
                            {inRange ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <AlertCircle size={12} />
                            )}
                            {inRange 
                              ? `Budget is perfect! (Artist Range: ₹${artist.price_min || 0} - ₹${artist.price_max || 0})` 
                              : `Budget is ${budget < (artist.price_min || 0) ? 'below' : 'above'} artist's range (₹${artist.price_min || 0} - ₹${artist.price_max || 0})`
                            }
                          </div>
                        );
                      })()}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-luxe p-1 z-[100]">
                          <SelectItem value="pending" className="rounded-xl py-3 font-bold">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span className="text-amber-600">Pending Request</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="confirmed" className="rounded-xl py-3 font-bold">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-emerald-600">Confirmed Booking</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="completed" className="rounded-xl py-3 font-bold">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="text-blue-600">Successfully Completed</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="cancelled" className="rounded-xl py-3 font-bold">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              <span className="text-rose-600">Cancelled / Rejected</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Event Date</FormLabel>
                      <FormControl>
                        <Input type="date" autoComplete="off" {...field} className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Event Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 7:00 PM onwards" autoComplete="off" {...field} className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/*  */}
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-50 mt-2">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={13} className="text-sky-500" /> State
                          </FormLabel>
                          {isManualState && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setIsManualState(false);
                                setIsManualCity(false);
                                form.setValue('state', 'Maharashtra');
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
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner">
                                <SelectValue placeholder="Select State" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-luxe p-1 max-h-[300px] z-[100]">
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
                              placeholder="Type state..." 
                              autoComplete="off"
                              {...field} 
                              className="h-12 rounded-2xl border-sky-100 bg-sky-50/20 font-bold focus:bg-white transition-all shadow-inner" 
                              autoFocus
                            />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => {
                      const selectedStateName = form.watch('state');
                      const selectedState = State.getStatesOfCountry("IN").find(s => s.name === selectedStateName);
                      const cities = selectedState ? City.getCitiesOfState("IN", selectedState.isoCode) : [];

                      return (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                              <MapPin size={13} className="text-sky-500" /> City
                            </FormLabel>
                            {isManualCity && (
                              <button 
                                type="button" 
                                onClick={() => {
                                  setIsManualCity(false);
                                  form.setValue('city', '');
                                }}
                                className="text-[10px] font-black text-sky-500 uppercase tracking-[0.1em] hover:text-sky-600"
                              >
                                [ Select from list ]
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
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner disabled:opacity-30" disabled={!selectedStateName}>
                                  <SelectValue placeholder={selectedStateName ? "Select City" : "Choose State First"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl border-slate-100 shadow-luxe p-1 max-h-[300px] z-[100]">
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
                                placeholder="Enter city manually..." 
                                autoComplete="off"
                                {...field} 
                                className="h-12 rounded-2xl border-sky-100 bg-sky-50/30 font-bold focus:bg-white transition-all shadow-inner" 
                                autoFocus
                              />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={13} className="text-sky-500" /> Venue Address
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter specific hall, hotel or building name..." autoComplete="off" {...field} className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 font-bold focus:bg-white transition-all shadow-inner" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel className="text-[11px] font-bold text-slate-500">Special Notes / Requirements</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional details or guest requirements..." 
                        {...field} 
                        className="min-h-[100px] rounded-2xl border-slate-200 bg-white font-medium focus:ring-sky-500/10" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="h-12 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-black text-[11px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-black/10 disabled:opacity-50"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Manual Booking
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
