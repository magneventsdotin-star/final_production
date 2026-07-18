-- Run this script in your Supabase SQL Editor

ALTER TABLE public.custom_forms
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS design_config JSONB DEFAULT '{"theme": "light", "glassmorphism": false}'::jsonb;

-- Example design_config:
-- {
--   "theme": "dark-glass",
--   "accentColor": "#10b981",
--   "glassmorphism": true
-- }
