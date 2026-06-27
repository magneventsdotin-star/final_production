ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS pending_approval BOOLEAN DEFAULT false;
