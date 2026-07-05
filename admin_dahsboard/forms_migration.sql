CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create custom_forms table
CREATE TABLE IF NOT EXISTS public.custom_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create custom_form_fields table
CREATE TABLE IF NOT EXISTS public.custom_form_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES public.custom_forms(id) ON DELETE CASCADE,
    field_type VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    placeholder VARCHAR(255),
    is_required BOOLEAN DEFAULT false,
    options JSONB,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create custom_form_responses table
CREATE TABLE IF NOT EXISTS public.custom_form_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES public.custom_forms(id) ON DELETE CASCADE,
    client_email VARCHAR(255),
    response_data JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for now to ensure admin and frontend can access freely without complex auth rules
ALTER TABLE public.custom_forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_form_fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_form_responses DISABLE ROW LEVEL SECURITY;
