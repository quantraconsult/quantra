-- 1. Allow any authenticated user to create a new organization
CREATE POLICY "Allow authenticated users to create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Allow users to add themselves as members (required for the onboarding flow)
CREATE POLICY "Allow users to insert their own membership"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Ensure users can see organizations they are members of (if not already existing)
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
