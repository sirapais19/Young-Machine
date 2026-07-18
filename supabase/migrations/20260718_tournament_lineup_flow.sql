alter table public.tournaments
  add column if not exists event_type text not null default 'tournament',
  add column if not exists total_games integer not null default 1;

alter table public.tournaments
  drop constraint if exists tournaments_event_type_check;

alter table public.tournaments
  add constraint tournaments_event_type_check
  check (event_type in ('tournament', 'friendly'));

alter table public.tournaments
  drop constraint if exists tournaments_total_games_check;

alter table public.tournaments
  add constraint tournaments_total_games_check
  check (total_games >= 1);

alter table public.tournament_player_stats
  add column if not exists team_lineup_id uuid references public.team_lineups(id) on delete set null,
  add column if not exists game_no integer not null default 1,
  add column if not exists goals integer not null default 0,
  add column if not exists assists integer not null default 0,
  add column if not exists blocks integer not null default 0,
  add column if not exists turnovers integer not null default 0,
  add column if not exists catches integer not null default 0,
  add column if not exists drops integer not null default 0,
  add column if not exists points_played integer not null default 0,
  add column if not exists plus_minus integer not null default 0;

update public.tournament_player_stats
set
  goals = coalesce(goals, total_score, 0),
  assists = coalesce(assists, total_assist, 0),
  blocks = coalesce(blocks, total_blocks, 0),
  turnovers = coalesce(turnovers, total_turnovers, 0),
  points_played = coalesce(points_played, total_games_played, 0)
where true;

alter table public.tournament_player_stats
  drop constraint if exists tournament_player_stats_game_no_check;

alter table public.tournament_player_stats
  add constraint tournament_player_stats_game_no_check
  check (game_no >= 1);

alter table public.tournament_player_stats
  drop constraint if exists tournament_player_stats_non_negative_check;

alter table public.tournament_player_stats
  add constraint tournament_player_stats_non_negative_check
  check (
    goals >= 0
    and assists >= 0
    and blocks >= 0
    and turnovers >= 0
    and catches >= 0
    and drops >= 0
    and points_played >= 0
  );

create index if not exists idx_tournament_player_stats_game
  on public.tournament_player_stats (tournament_id, game_no, team_lineup_id);
