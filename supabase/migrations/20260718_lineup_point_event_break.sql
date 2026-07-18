alter table public.tournament_lineup_point_events
  drop constraint if exists tournament_lineup_point_events_event_type_check;

alter table public.tournament_lineup_point_events
  add constraint tournament_lineup_point_events_event_type_check
  check (event_type in ('team_score', 'break', 'opponent_score', 'turnover', 'block', 'timeout', 'note'));
