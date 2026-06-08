-- Migration script to create tables for Dynamic Services Page

CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  bannerImage text,
  heroImage text,
  status boolean DEFAULT true,
  displayOrder integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.service_page_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title text,
  hero_subtitle text,
  hero_bg_image text,
  hero_bg_video text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Alter service_videos to add category_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_videos' AND column_name='category_id') THEN
        ALTER TABLE public.service_videos ADD COLUMN category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Insert default page settings
INSERT INTO public.service_page_settings (hero_title, hero_subtitle, hero_bg_image, hero_bg_video)
VALUES (
  'Book Premium Artists For Every Occasion', 
  'Watch live performances and book instantly.', 
  null, 
  'https://assets.mixkit.co/videos/preview/mixkit-band-performing-on-stage-at-a-concert-34371-large.mp4'
) ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO public.service_categories (title, slug, displayOrder) VALUES
('Book a Singer for House Parties', 'singer-house-parties', 1),
('Book a Live Band for Wedding', 'live-band-wedding', 2),
('Hire a Live Band for Corporate Event', 'live-band-corporate', 3),
('Book Anchor Emcees and Magician', 'anchor-magician', 4),
('Hire Club DJs', 'club-djs', 5),
('Hire Live Solo Singers', 'solo-singers', 6),
('Background Performance Artists', 'background-artists', 7)
ON CONFLICT (slug) DO NOTHING;
