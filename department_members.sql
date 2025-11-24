-- Create department_members table
create table if not exists public.department_members (
  id uuid default gen_random_uuid() primary key,
  department_id uuid references public.departments(id) on delete cascade not null,
  user_id text references public.users(id) on delete cascade not null,
  role text default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(department_id, user_id)
);

-- Enable RLS
alter table public.department_members enable row level security;

-- Policies
create policy "Users can view department members in their orgs"
  on public.department_members for select
  using (
    exists (
      select 1 from public.departments d
      join public.organization_members om on d.organization_id = om.organization_id
      where d.id = department_members.department_id
      and om.user_id = auth.uid()
    )
  );

create policy "Admins can manage department members"
  on public.department_members for all
  using (
    exists (
      select 1 from public.departments d
      join public.organization_members om on d.organization_id = om.organization_id
      where d.id = department_members.department_id
      and om.user_id = auth.uid()
      and om.role in ('admin', 'owner')
    )
  );
