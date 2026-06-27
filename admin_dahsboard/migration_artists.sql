ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS artist_no SERIAL;

ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS public.duplicate_approvals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name text NOT NULL,
  field_value text NOT NULL,
  requested_by text,
  approved_by text,
  reason text,
  draft_data JSONB,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

