CREATE TABLE IF NOT EXISTS public.successful_bookings_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id uuid REFERENCES public.artists(id) ON DELETE CASCADE,
    client_name text NOT NULL,
    event_date text,
    location text,
    notes text,
    added_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
