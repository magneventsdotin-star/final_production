ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_view_all_artists BOOLEAN DEFAULT false;
