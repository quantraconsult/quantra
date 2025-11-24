-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policies for departments
CREATE POLICY "Allow authenticated users to view departments"
ON public.departments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = departments.organization_id
        AND organization_members.user_id = auth.uid()
    )
);

CREATE POLICY "Allow authenticated users to create departments"
ON public.departments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = departments.organization_id
        AND organization_members.user_id = auth.uid()
    )
);

-- Add columns to projects table (NULLABLE for backward compatibility)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Enable RLS on projects if not already (assuming it is, but good to be safe)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Update project policies to allow access based on organization/department membership
-- (This might need adjustment depending on existing policies, but for now we ensure basic access)
-- Existing policies likely rely on user_id or similar. We might need to expand them later.
