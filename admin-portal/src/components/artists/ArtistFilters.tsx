"use client";

import { useState, useCallback } from 'react';
import { State, City } from 'country-state-city';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal, DollarSign, Globe, MapPin, User, Users, Star, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES, INDIAN_LANGUAGES } from '@/lib/constants';

export interface ArtistFilterState {
  search: string;
  category: string;
  subcategories: string[];
  languages: string[];
  state: string;
  city: string;
  budget: string;
  memberCount: string;
  isPopular: boolean;
  isArtistOfMonth: boolean;
  isStandard: boolean;
  registrationDate: string;
  sortBy: string;
}

export const INITIAL_FILTER_STATE: ArtistFilterState = {
  search: '',
  category: 'all',
  subcategories: [],
  languages: [],
  state: 'all',
  city: 'all',
  budget: '',
  memberCount: '',
  isPopular: false,
  isArtistOfMonth: false,
  isStandard: false,
  registrationDate: 'all',
  sortBy: 'artist_no_asc'
};

interface ArtistFiltersProps {
  onFilterChange: (filters: ArtistFilterState) => void;
}
export function ArtistFilters({ onFilterChange }: ArtistFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<ArtistFilterState>(INITIAL_FILTER_STATE);

  const handleUpdate = useCallback((updates: Partial<ArtistFilterState>) => {
    const nextFilters = { ...filters, ...updates };
    if (updates.category && updates.category !== filters.category) {
      nextFilters.subcategories = [];
    }
    setFilters(nextFilters);
    if ('search' in updates || !expanded) {
      onFilterChange(nextFilters);
    }
  }, [expanded, onFilterChange, filters]);

  const clearFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
    onFilterChange(INITIAL_FILTER_STATE);
    setExpanded(false);
  };
  return (
    <div className="premium-card p-6 shadow-luxe border-slate-100/50 bg-white hover:shadow-2xl hover:scale-[1.005] transition-all duration-500 group/filters">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <label htmlFor="artist-search" className="sr-only">Search artists</label>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-focus-within:text-sky-600 group-focus-within:bg-sky-50 transition-all duration-300 shadow-sm border border-slate-100">
            <Search size={18} strokeWidth={2.5} />
          </div>
          <Input
            id="artist-search"
            value={filters.search}
            onChange={(e) => handleUpdate({ search: e.target.value })}
            placeholder="Search artists by name, alias or category..."
            className="pl-16 h-12 rounded-2xl text-[14px] font-bold border-slate-100 bg-slate-50/50 focus-visible:ring-sky-500/10 focus-visible:border-sky-500 transition-all shadow-inner placeholder:text-slate-400 placeholder:font-medium w-full"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">

          <div className="hidden sm:flex items-center gap-2">
            <div className="w-[200px]">
              <Select
                value={filters.state}
                onValueChange={(val) => handleUpdate({ state: val, city: 'all' })}
              >
                <SelectTrigger className="h-11 rounded-2xl font-bold text-[10px] uppercase tracking-wider border-slate-100 bg-white hover:border-sky-400 transition-colors shadow-sm overflow-hidden px-3">
                  <div className="flex items-center gap-2 w-full overflow-hidden">
                    <Globe size={12} className="text-slate-400 shrink-0" />
                    <div className="truncate text-left flex-1">
                      <SelectValue placeholder="All States" />
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-luxe p-1">
                  <SelectItem value="all" className="rounded-xl py-2.5 font-bold text-[12px]">All States</SelectItem>
                  {State.getStatesOfCountry("IN").map(st => (
                    <SelectItem key={st.isoCode} value={st.name} className="rounded-xl py-2.5 font-bold text-[12px]">{st.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select
                value={filters.city}
                onValueChange={(val) => handleUpdate({ city: val })}
                disabled={filters.state === 'all'}
              >
                <SelectTrigger className="h-11 rounded-2xl font-bold text-[10px] uppercase tracking-wider border-slate-100 bg-white hover:border-sky-400 transition-colors shadow-sm disabled:opacity-40 overflow-hidden px-3">
                  <div className="flex items-center gap-2 w-full overflow-hidden">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <div className="truncate text-left flex-1">
                      <SelectValue placeholder={filters.state === 'all' ? "Select State" : "All Cities"} />
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-luxe p-1">
                  <SelectItem value="all" className="rounded-xl py-2.5 font-bold text-[12px]">All Cities</SelectItem>
                  {(() => {
                    const selectedState = State.getStatesOfCountry("IN").find(s => s.name === filters.state);
                    const cities = selectedState ? City.getCitiesOfState("IN", selectedState.isoCode) : [];
                    return cities.map(city => (
                      <SelectItem key={`${city.name}-${city.latitude}`} value={city.name} className="rounded-xl py-2.5 font-bold text-[12px]">{city.name}</SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>
          <button
            className={cn(
              "h-12 px-6 gap-2.5 rounded-2xl transition-all font-bold text-[12px] uppercase tracking-wider flex items-center shadow-sm flex-1 lg:flex-none justify-center",
              expanded
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white border-slate-100 text-slate-600 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50"
            )}
            onClick={() => setExpanded(!expanded)}
          >
            <SlidersHorizontal size={16} strokeWidth={2.5} />
            Filters
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 mt-6 border-t border-slate-100">
          <div className="space-y-4 col-span-full">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">Main Category</Label>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleUpdate({ category: 'all' })}
                className={cn(
                  "px-5 h-10 rounded-xl text-[12px] font-bold transition-all border shadow-sm",
                  filters.category === 'all'
                    ? "bg-slate-900 text-white border-slate-900 shadow-slate-200/50"
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900"
                )}
              >
                All Talent
              </button>
              {Object.keys(CATEGORIES).map(cat => (
                <button
                  key={cat}
                  onClick={() => handleUpdate({ category: cat })}
                  className={cn(
                    "px-5 h-10 rounded-xl text-[12px] font-bold transition-all border shadow-sm",
                    filters.category === cat
                      ? "bg-slate-900 text-white border-slate-900 shadow-slate-200/50"
                      : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 col-span-full pt-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">
              Genres / Sub-categories (Multiple Selection)
            </Label>
            <div className="flex flex-wrap gap-2 p-1">
              {filters.category === 'all' ? (
                <div className="w-full py-6 rounded-2xl border border-dashed border-slate-100 flex items-center justify-center text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50/30">
                  Select a main category first to see specific genres
                </div>
              ) : (
                CATEGORIES[filters.category]?.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      const current = filters.subcategories || [];
                      if (current.includes(sub)) {
                        handleUpdate({ subcategories: current.filter(s => s !== sub) });
                      } else {
                        handleUpdate({ subcategories: [...current, sub] });
                      }
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full text-[11px] font-bold transition-all border shadow-sm",
                      (filters.subcategories || []).includes(sub)
                        ? "bg-slate-800 text-white border-slate-800 shadow-md scale-105"
                        : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900"
                    )}
                  >
                    {sub}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3 col-span-full pt-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">
              LANGUAGES (MULTIPLE SELECTION)
            </Label>
            <div className="flex flex-wrap gap-2 p-1">
              <button
                onClick={() => handleUpdate({ languages: [] })}
                className={cn(
                  "px-4 py-2 rounded-full text-[11px] font-bold transition-all border shadow-sm",
                  filters.languages.length === 0
                    ? "bg-slate-900 text-white border-slate-900 shadow-slate-200/50"
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900"
                )}
              >
                All Languages
              </button>
              {INDIAN_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    const current = filters.languages || [];
                    if (current.includes(lang)) {
                      handleUpdate({ languages: current.filter(l => l !== lang) });
                    } else {
                      handleUpdate({ languages: [...current, lang] });
                    }
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-[11px] font-bold transition-all border shadow-sm",
                    filters.languages.includes(lang)
                      ? "bg-slate-800 text-white border-slate-800 shadow-md scale-105"
                      : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>


          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3 rounded-[20px] bg-sky-50/40 border border-sky-100/50 shadow-sm group/reqs hover:bg-sky-50/60 transition-all duration-300">

            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] ml-1 flex items-center gap-1.5">
                <Globe size={11} className="text-sky-500" /> State
              </Label>
              <Select
                value={filters.state}
                onValueChange={(val) => handleUpdate({ state: val, city: 'all' })}
              >
                <SelectTrigger className="h-11 rounded-xl font-bold text-[12px] border-white bg-white hover:border-sky-400 transition-all shadow-sm focus:ring-sky-500/10">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-luxe p-1">
                  <SelectItem value="all" className="rounded-lg py-2 font-bold text-[12px]">All States</SelectItem>
                  {State.getStatesOfCountry("IN").map(st => (
                    <SelectItem key={st.isoCode} value={st.name} className="rounded-lg py-2 font-bold text-[12px]">{st.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] ml-1 flex items-center gap-1.5">
                <MapPin size={11} className="text-sky-500" /> City
              </Label>
              <Select
                value={filters.city}
                onValueChange={(val) => handleUpdate({ city: val })}
                disabled={filters.state === 'all'}
              >
                <SelectTrigger className="h-11 rounded-xl font-bold text-[12px] border-white bg-white hover:border-sky-400 transition-all shadow-sm disabled:opacity-50 focus:ring-sky-500/10">
                  <SelectValue placeholder={filters.state === 'all' ? "Select State" : "All Cities"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-luxe p-1">
                  <SelectItem value="all" className="rounded-lg py-2 font-bold text-[12px]">All Cities</SelectItem>
                  {(() => {
                    const selectedState = State.getStatesOfCountry("IN").find(s => s.name === filters.state);
                    const cities = selectedState ? City.getCitiesOfState("IN", selectedState.isoCode) : [];
                    return cities.map(city => (
                      <SelectItem key={`${city.name}-${city.latitude}`} value={city.name} className="rounded-lg py-2 font-bold text-[12px]">{city.name}</SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>


            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1.5 ml-1">
                <DollarSign size={11} className="text-emerald-500" /> Budget (₹)
              </Label>
              <div className="relative group/in">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs transition-all">₹</div>
                <Input
                  type="number"
                  placeholder="e.g. 75000"
                  value={filters.budget}
                  onChange={(e) => handleUpdate({ budget: e.target.value })}
                  className="h-11 pl-9 rounded-xl font-bold text-[12px] border-white bg-white focus-visible:ring-sky-500/10 shadow-sm transition-all placeholder:text-slate-300 placeholder:font-medium"
                />
              </div>
            </div>


            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1.5 ml-1">
                <Users size={11} className="text-sky-500" /> Members
              </Label>
              <div className="relative group/in">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600 font-bold text-xs transition-all"><Users size={12} /></div>
                <Input
                  type="number"
                  placeholder="e.g. 3"
                  value={filters.memberCount}
                  onChange={(e) => handleUpdate({ memberCount: e.target.value })}
                  className="h-11 pl-11 rounded-xl font-bold text-[12px] border-white bg-white focus-visible:ring-sky-500/10 shadow-sm transition-all placeholder:text-slate-300 placeholder:font-medium"
                />
              </div>
            </div>
          </div>

          <div className="col-span-full space-y-3 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Registry Level</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdate({ isPopular: false, isArtistOfMonth: false, isStandard: false })}
                    className={cn(
                      "px-6 h-10 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border shadow-sm",
                      !filters.isPopular && !filters.isArtistOfMonth && !filters.isStandard
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                    )}
                  >
                    All Talent
                  </button>
                  <button
                    onClick={() => handleUpdate({
                      isStandard: !filters.isStandard,
                      isPopular: false
                    })}
                    className={cn(
                      "px-6 h-10 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border shadow-sm flex items-center gap-2",
                      filters.isStandard
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <User size={12} />
                    Standard Only
                  </button>
                  <button
                    onClick={() => handleUpdate({
                      isPopular: !filters.isPopular,
                      isStandard: false
                    })}
                    className={cn(
                      "px-6 h-10 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border shadow-sm flex items-center gap-2",
                      filters.isPopular
                        ? "bg-amber-400 text-white border-amber-400 shadow-amber-100"
                        : "bg-white text-amber-500 border-amber-100 hover:bg-amber-50"
                    )}
                  >
                    <Star size={12} fill={filters.isPopular ? "white" : "currentColor"} />
                    {filters.isPopular ? "Trending" : "Trending Only"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Spotlight Feature</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdate({
                      isArtistOfMonth: !filters.isArtistOfMonth
                    })}
                    className={cn(
                      "px-6 h-10 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border shadow-sm flex items-center gap-2",
                      filters.isArtistOfMonth
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-100"
                        : "bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                    )}
                  >
                    <Music size={12} />
                    Artist Of Month
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-full flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-50">
            <div className="space-y-2 flex-1">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(val) => handleUpdate({ sortBy: val })}
              >
                <SelectTrigger className="h-11 rounded-xl font-bold text-[12px] bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artist_no_asc">Artist Number (Ascending)</SelectItem>
                  <SelectItem value="artist_no_desc">Artist Number (Descending)</SelectItem>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                  <SelectItem value="date_desc">Registration Date (Newest)</SelectItem>
                  <SelectItem value="date_asc">Registration Date (Oldest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex-1">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Date Uploaded</Label>
              <Select
                value={filters.registrationDate}
                onValueChange={(val) => handleUpdate({ registrationDate: val })}
              >
                <SelectTrigger className="h-11 rounded-xl font-bold text-[12px] bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end gap-3 pt-4 border-t border-slate-50">
             <button
               onClick={clearFilters}
               className="px-8 h-12 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
             >
               Clear All Filters
             </button>
             <button
               onClick={() => { setExpanded(false); onFilterChange(filters); }}
               className="px-10 h-12 rounded-2xl bg-sky-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-sky-200 hover:bg-sky-700 hover:translate-y-[-2px] transition-all active:scale-95"
             >
               Apply Results
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
