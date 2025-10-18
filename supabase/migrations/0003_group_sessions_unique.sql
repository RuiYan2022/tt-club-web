do $$ begin
  if not exists (select 1 from pg_indexes where indexname = 'uniq_group_session_start') then
    create unique index uniq_group_session_start on public.group_sessions (group_id, starts_at);
  end if;
end $$;

create index if not exists idx_group_attendance_session on public.group_attendance(session_id);

create or replace view public.v_group_session_has_attendance as
select gs.id as session_id, exists (
  select 1 from public.group_attendance ga where ga.session_id = gs.id and ga.present = true
) as has_attendance
from public.group_sessions gs;
