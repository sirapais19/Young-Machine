alter table public.tournament_lineup_point_events
  add column if not exists event_order integer;

update public.tournament_lineup_point_events
set event_order = coalesce(event_order, point_no, 1)
where event_order is null;

alter table public.tournament_lineup_point_events
  alter column event_order set default 1;

alter table public.tournament_lineup_point_events
  drop constraint if exists tournament_lineup_point_events_event_order_check;

alter table public.tournament_lineup_point_events
  add constraint tournament_lineup_point_events_event_order_check
  check (event_order >= 1);

create index if not exists idx_lineup_point_events_game_order
  on public.tournament_lineup_point_events(tournament_id, game_no, event_order);
