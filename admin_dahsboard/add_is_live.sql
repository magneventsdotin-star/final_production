ALTER TABLE public.pricing_plans ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;
-- Make existing plans live so they don't disappear
UPDATE public.pricing_plans SET is_live = true WHERE is_live = false;
