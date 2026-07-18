alter table public.team_lineups
  add column if not exists ratio text not null default 'A';

alter table public.team_lineups
  drop constraint if exists team_lineups_ratio_check;

alter table public.team_lineups
  add constraint team_lineups_ratio_check
  check (ratio in ('A', 'B'));

create table if not exists public.tournament_lineup_game_stats (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  team_lineup_id uuid references public.team_lineups(id) on delete cascade,
  game_no integer not null default 1,
  line_score integer default 0,
  breaks integer default 0,
  turnovers integer default 0,
  bolos integer default 0,
  conceded integer default 0,
  scorer_player_id uuid references public.players(id) on delete set null,
  assist_player_id uuid references public.players(id) on delete set null,
  block_player_id uuid references public.players(id) on delete set null,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tournament_lineup_game_stats
  drop constraint if exists tournament_lineup_game_stats_game_no_check;

alter table public.tournament_lineup_game_stats
  add constraint tournament_lineup_game_stats_game_no_check
  check (game_no >= 1);

alter table public.tournament_lineup_game_stats
  drop constraint if exists tournament_lineup_game_stats_non_negative_check;

alter table public.tournament_lineup_game_stats
  add constraint tournament_lineup_game_stats_non_negative_check
  check (
    coalesce(line_score, 0) >= 0
    and coalesce(breaks, 0) >= 0
    and coalesce(turnovers, 0) >= 0
    and coalesce(bolos, 0) >= 0
    and coalesce(conceded, 0) >= 0
  );

create unique index if not exists idx_lineup_game_stats_unique
  on public.tournament_lineup_game_stats(tournament_id, team_lineup_id, game_no);

alter table public.tournament_lineup_game_stats enable row level security;

drop policy if exists "Coach manager manage lineup game stats" on public.tournament_lineup_game_stats;
drop policy if exists "Authenticated manage lineup game stats" on public.tournament_lineup_game_stats;
drop policy if exists "Players read lineup game stats" on public.tournament_lineup_game_stats;
drop policy if exists "Authenticated read lineup game stats" on public.tournament_lineup_game_stats;

do $$
begin
  if to_regprocedure('public.current_user_role()') is not null then
    execute 'create policy "Coach manager manage lineup game stats"
      on public.tournament_lineup_game_stats
      for all
      using (public.current_user_role() in (''coach'', ''manager''))
      with check (public.current_user_role() in (''coach'', ''manager''))';

    execute 'create policy "Players read lineup game stats"
      on public.tournament_lineup_game_stats
      for select
      using (public.current_user_role() = ''player'')';
  else
    execute 'create policy "Authenticated manage lineup game stats"
      on public.tournament_lineup_game_stats
      for all
      using (auth.uid() is not null)
      with check (auth.uid() is not null)';

    execute 'create policy "Authenticated read lineup game stats"
      on public.tournament_lineup_game_stats
      for select
      using (auth.uid() is not null)';
  end if;
end $$;
