do $$
declare
  r record;
  v_dept_id uuid;
begin
  -- Loop through target organizations
  for r in select * from public.organizations where name in ('Muurkraal', 'Parallax') loop
    
    -- 1. Get or Create 'General' Department for this Org
    select id into v_dept_id from public.departments where organization_id = r.id and name = 'General' limit 1;
    
    if v_dept_id is null then
      insert into public.departments (organization_id, name) values (r.id, 'General') returning id into v_dept_id;
      raise notice 'Created General department for %', r.name;
    end if;

    -- 2. Add Users: Add all members of this Org to the General department
    insert into public.department_members (department_id, user_id, role)
    select v_dept_id, user_id, 'member'
    from public.organization_members
    where organization_id = r.id
    on conflict (department_id, user_id) do nothing;
    
    raise notice 'Added users to General department for %', r.name;
    
  end loop;
end $$;
