do $$
declare
  v_org_id uuid;
  v_dept_id uuid;
begin
  -- 1. Get Organization ID for 'Quantra Consulting'
  select id into v_org_id from public.organizations where name = 'Quantra Consulting' limit 1;
  
  if v_org_id is null then
    raise notice 'Organization "Quantra Consulting" not found';
    return;
  end if;

  -- 2. Get or Create 'Engineering' Department
  select id into v_dept_id from public.departments where organization_id = v_org_id and name = 'Engineering' limit 1;
  
  if v_dept_id is null then
    insert into public.departments (organization_id, name) values (v_org_id, 'Engineering') returning id into v_dept_id;
    raise notice 'Created Engineering department';
  end if;

  -- 3. Update Projects: Assign all projects in this Org to Engineering
  update public.projects
  set department_id = v_dept_id
  where organization_id = v_org_id;
  
  raise notice 'Updated projects to Engineering';

  -- 4. Add Users: Add all members of this Org to the Engineering department
  insert into public.department_members (department_id, user_id, role)
  select v_dept_id, user_id, 'member'
  from public.organization_members
  where organization_id = v_org_id
  on conflict (department_id, user_id) do nothing;
  
  raise notice 'Added users to Engineering department';

end $$;
