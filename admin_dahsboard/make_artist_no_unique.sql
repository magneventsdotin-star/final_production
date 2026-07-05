-- 1. Make artist_no unique in the artists table
ALTER TABLE public.artists ADD CONSTRAINT unique_artist_no UNIQUE (artist_no);
