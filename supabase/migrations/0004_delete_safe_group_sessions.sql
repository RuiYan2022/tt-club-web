create or replace function public.delete_safe_group_sessions(
  p_group_ids uuid[],
  p_from timestamptz,
  p_to timestamptz
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.group_sessions gs
  using public.group_lessons gl
  where gs.group_id = gl.id
    and gs.group_id = any(p_group_ids)
    and gs.starts_at >= p_from
    and gs.starts_at < p_to
    and not exists (
      select 1 from public.group_attendance ga
      where ga.session_id = gs.id and ga.present = true
    )
    and not exists (
      select 1 from public.payments p
      where p.session_id = gs.id and p.status in ('pending','completed')
    );
end;
$$;
