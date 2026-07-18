create table if not exists public.tournament_lineup_point_events (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  team_lineup_id uuid references public.team_lineups(id) on delete cascade,
  game_no integer not null default 1,
  point_no integer not null default 1,
  event_order integer not null default 1,
  event_type text not null default 'team_score',
  team_score_after integer default 0,
  opponent_score_after integer default 0,
  scorer_player_id uuid references public.players(id) on delete set null,
  assist_player_id uuid references public.players(id) on delete set null,
  block_player_id uuid references public.players(id) on delete set null,
  turnover_player_id uuid references public.players(id) on delete set null,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tournament_lineup_point_events
  drop constraint if exists tournament_lineup_point_events_event_type_check;

alter table public.tournament_lineup_point_events
  add constraint tournament_lineup_point_events_event_type_check
  check (event_type in ('team_score', 'break', 'opponent_score', 'turnover', 'block', 'timeout', 'note'));

alter table public.tournament_lineup_point_events
  drop constraint if exists tournament_lineup_point_events_game_point_check;

alter table public.tournament_lineup_point_events
  add constraint tournament_lineup_point_events_game_point_check
  check (game_no >= 1 and point_no >= 1 and event_order >= 1 and coalesce(team_score_after, 0) >= 0 and coalesce(opponent_score_after, 0) >= 0);

create index if not exists idx_lineup_point_events_tournament
  on public.tournament_lineup_point_events(tournament_id);

create index if not exists idx_lineup_point_events_lineup
  on public.tournament_lineup_point_events(team_lineup_id);

create index if not exists idx_lineup_point_events_game
  on public.tournament_lineup_point_events(team_lineup_id, game_no, point_no);

create index if not exists idx_lineup_point_events_game_order
  on public.tournament_lineup_point_events(tournament_id, game_no, event_order);

alter table public.tournament_lineup_point_events enable row level security;

drop policy if exists "Coach manager manage lineup point events" on public.tournament_lineup_point_events;
drop policy if exists "Authenticated manage lineup point events" on public.tournament_lineup_point_events;
drop policy if exists "Players read own lineup point events" on public.tournament_lineup_point_events;
drop policy if exists "Authenticated read lineup point events" on public.tournament_lineup_point_events;

do $$
begin
  if to_regprocedure('public.current_user_role()') is not null then
    execute 'create policy "Coach manager manage lineup point events"
      on public.tournament_lineup_point_events
      for all
      using (public.current_user_role() in (''coach'', ''manager''))
      with check (public.current_user_role() in (''coach'', ''manager''))';

    execute 'create policy "Players read own lineup point events"
      on public.tournament_lineup_point_events
      for select
      using (
        public.current_user_role() = ''player''
        and exists (
          select 1
          from public.players p
          join public.team_lineup_players tlp on tlp.player_id = p.id
          where p.user_id = auth.uid()
            and tlp.team_lineup_id = tournament_lineup_point_events.team_lineup_id
        )
      )';
  else
    execute 'create policy "Authenticated manage lineup point events"
      on public.tournament_lineup_point_events
      for all
      using (auth.uid() is not null)
      with check (auth.uid() is not null)';

    execute 'create policy "Authenticated read lineup point events"
      on public.tournament_lineup_point_events
      for select
      using (auth.uid() is not null)';
  end if;
end $$;
