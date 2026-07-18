
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    path TEXT NOT NULL,
    type TEXT NOT NULL,
    user_agent TEXT,
    ip_hash TEXT,
    session_id TEXT,
    details JSONB
);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts to analytics" 
ON public.analytics FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

