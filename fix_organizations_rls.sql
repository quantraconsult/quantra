-- 1. Reset Policies for Organizations
DROP POLICY IF EXISTS "Allow authenticated users to create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;

-- Allow Insert
CREATE POLICY "Allow authenticated users to create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow Select (Viewing)
CREATE POLICY "Users can view organizations they belong to"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  exists (
    select 1
    from public.organization_members
    where organization_members.organization_id = organizations.id
    and organization_members.user_id = auth.uid()
  )
);

-- 2. Reset Policies for Organization Members
DROP POLICY IF EXISTS "Allow users to insert their own membership" ON public.organization_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.organization_members;

-- Allow Insert (Self-add)
CREATE POLICY "Allow users to insert their own membership"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
