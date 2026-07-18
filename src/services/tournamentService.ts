import { supabase } from "@/lib/supabase";
import { fromTournamentRole, mapLineups, mapTournament, mapTournamentLineupGameStats, mapTournamentLineupPointEvent, mapTournamentPlayer, mapTournamentStats, tournamentLineupGameStatsPayload, tournamentLineupPointEventPayload, tournamentPayload, tournamentStatsPayload } from "@/services/mappers";
import type { LineupRatio, TeamLineup, Tournament, TournamentLineupGameStats, TournamentLineupPointEvent, TournamentPlayer, TournamentStats } from "@/types/app";
import type { TeamLineupPlayerRow, TeamLineupRow, TournamentLineupGameStatsRow, TournamentLineupPointEventRow, TournamentPlayerRow, TournamentPlayerStatsRow, TournamentRow } from "@/types/supabase";

export type TournamentFlowPayload = {
  tournament: Omit<Tournament, "id">;
  tournamentPlayers: Omit<TournamentPlayer, "id" | "tournamentId">[];
  lineups: Omit<TeamLineup, "id" | "tournamentId" | "createdAt">[];
};

export type TournamentDetail = {
  tournament: Tournament;
  tournamentPlayers: TournamentPlayer[];
  lineups: TeamLineup[];
  stats: TournamentStats[];
  lineupGameStats: TournamentLineupGameStats[];
  pointEvents: TournamentLineupPointEvent[];
};

const id = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertUuid(value: string | null | undefined, label: string) {
  if (!value || !uuidPattern.test(value)) throw new Error(`${label} is missing or is not a valid Supabase UUID.`);
}

function lineupPlayerPayload(players: TeamLineup["players"], lineupId: string) {
  assertUuid(lineupId, "Lineup ID");
  return players.map((row, index) => {
    assertUuid(row.playerId, "Player ID");
    return {
      team_lineup_id: lineupId,
      player_id: row.playerId,
      position: row.position,
      line_order: Math.max(1, Number(row.lineOrder || index + 1)),
    };
  });
}

function validateLineupGameStats(stats: Partial<TournamentLineupGameStats>, lineupPlayers: TeamLineup["players"] = [], totalGames = 1) {
  assertUuid(stats.tournamentId, "Tournament ID");
  assertUuid(stats.teamLineupId, "Lineup ID");
  if (Number(stats.gameNo ?? 0) < 1) throw new Error("Game number must be at least 1.");
  if (Number(stats.gameNo ?? 1) > Math.max(1, Number(totalGames))) throw new Error(`Game number cannot exceed ${Math.max(1, Number(totalGames))}.`);
  if (!lineupPlayers.length) throw new Error("Cannot save stats because this lineup has no players.");
  const lineupPlayerIds = new Set(lineupPlayers.map((player) => player.playerId));
  for (const [label, playerId] of [
    ["Scorer", stats.scorerPlayerId],
    ["Assist", stats.assistPlayerId],
    ["Block", stats.blockPlayerId],
  ] as const) {
    if (playerId) {
      assertUuid(playerId, `${label} player ID`);
      if (!lineupPlayerIds.has(playerId)) throw new Error(`${label} must be selected from this lineup.`);
    }
  }
}

function validatePointEvent(event: Partial<TournamentLineupPointEvent>, lineupPlayers: TeamLineup["players"] = [], totalGames = 1) {
  assertUuid(event.tournamentId, "Tournament ID");
  assertUuid(event.teamLineupId, "Lineup ID");
  if (Number(event.gameNo ?? 0) < 1) throw new Error("Game number must be at least 1.");
  if (Number(event.gameNo ?? 1) > Math.max(1, Number(totalGames))) throw new Error(`Game number cannot exceed ${Math.max(1, Number(totalGames))}.`);
  if (!event.eventType) throw new Error("Event type is required.");
  if ((event.note ?? "").length > 500) throw new Error("Note cannot exceed 500 characters.");
  const lineupPlayerIds = new Set(lineupPlayers.map((player) => player.playerId));
  const validatePlayer = (playerId: string | null | undefined, label: string, required = false) => {
    if (!playerId) {
      if (required) throw new Error(`${label} is required.`);
      return;
    }
    assertUuid(playerId, `${label} player ID`);
    if (!lineupPlayerIds.has(playerId)) throw new Error(`${label} must be selected from this lineup.`);
  };
  const isTeamPoint = event.eventType === "team_score" || event.eventType === "break";
  validatePlayer(event.scorerPlayerId, "Scorer", isTeamPoint);
  validatePlayer(event.assistPlayerId, "Assist");
  validatePlayer(event.blockPlayerId, "Block", event.eventType === "block");
  validatePlayer(event.turnoverPlayerId, "Turnover player", event.eventType === "turnover");
}

export async function createTournamentWithLineups(payload: TournamentFlowPayload): Promise<Tournament> {
  const { data, error } = await supabase.from("tournaments").insert(tournamentPayload(payload.tournament)).select("*").single<TournamentRow>();
  if (error) throw error;
  const tournament = mapTournament(data);
  if (payload.tournamentPlayers.length) {
    await supabase
      .from("tournament_players")
      .insert(payload.tournamentPlayers.map((row) => {
        assertUuid(row.playerId, "Player ID");
        return { tournament_id: tournament.id, player_id: row.playerId, role: fromTournamentRole(row.role) };
      }))
      .throwOnError();
  }
  for (const lineup of payload.lineups) {
    await addTournamentLineup(tournament.id, lineup);
  }
  return tournament;
}

export async function updateTournamentWithLineups(tournamentId: string, payload: Partial<TournamentFlowPayload>): Promise<void> {
  assertUuid(tournamentId, "Tournament ID");
  if (payload.tournament) await supabase.from("tournaments").update(tournamentPayload(payload.tournament)).eq("id", tournamentId).throwOnError();
  if (payload.tournamentPlayers) {
    await supabase.from("tournament_players").delete().eq("tournament_id", tournamentId).throwOnError();
    if (payload.tournamentPlayers.length) {
      await supabase
        .from("tournament_players")
        .insert(payload.tournamentPlayers.map((row) => {
          assertUuid(row.playerId, "Player ID");
          return { tournament_id: tournamentId, player_id: row.playerId, role: fromTournamentRole(row.role) };
        }))
        .throwOnError();
    }
  }
  if (payload.lineups) {
    const detail = await getTournamentDetail(tournamentId);
    const keep = new Set(payload.lineups.map((lineup) => ("id" in lineup && lineup.id ? String(lineup.id) : "")).filter((lineupId) => uuidPattern.test(lineupId)));
    for (const lineup of detail?.lineups ?? []) {
      if (!keep.has(lineup.id)) await deleteTournamentLineup(lineup.id);
    }
    for (const lineup of payload.lineups) {
      if ("id" in lineup && lineup.id && uuidPattern.test(String(lineup.id))) await updateTournamentLineup(String(lineup.id), lineup);
      else await addTournamentLineup(tournamentId, lineup);
    }
  }
}

export async function getTournamentDetail(tournamentId: string): Promise<TournamentDetail | null> {
  const [tournamentResult, playerResult, statsResult, lineupResult, lineupPlayerResult, lineupGameStatsResult, pointEventsResult] = await Promise.all([
    supabase.from("tournaments").select("*").eq("id", tournamentId).maybeSingle<TournamentRow>(),
    supabase.from("tournament_players").select("*").eq("tournament_id", tournamentId),
    supabase.from("tournament_player_stats").select("*").eq("tournament_id", tournamentId),
    supabase.from("team_lineups").select("*").eq("tournament_id", tournamentId),
    supabase.from("team_lineup_players").select("*"),
    supabase.from("tournament_lineup_game_stats").select("*").eq("tournament_id", tournamentId),
    supabase.from("tournament_lineup_point_events").select("*").eq("tournament_id", tournamentId),
  ]);
  if (tournamentResult.error) throw tournamentResult.error;
  if (playerResult.error) throw playerResult.error;
  if (statsResult.error) throw statsResult.error;
  if (lineupResult.error) throw lineupResult.error;
  if (lineupPlayerResult.error) throw lineupPlayerResult.error;
  if (lineupGameStatsResult.error) console.warn("Unable to load lineup game stats.", lineupGameStatsResult.error);
  if (pointEventsResult.error) console.warn("Unable to load lineup point events.", pointEventsResult.error);
  if (!tournamentResult.data) return null;

  const lineupIds = new Set((lineupResult.data ?? []).map((lineup) => lineup.id));
  return {
    tournament: mapTournament(tournamentResult.data),
    tournamentPlayers: ((playerResult.data ?? []) as TournamentPlayerRow[]).map(mapTournamentPlayer),
    stats: ((statsResult.data ?? []) as TournamentPlayerStatsRow[]).map(mapTournamentStats),
    lineupGameStats: ((lineupGameStatsResult.error ? [] : lineupGameStatsResult.data ?? []) as TournamentLineupGameStatsRow[]).map(mapTournamentLineupGameStats),
    pointEvents: ((pointEventsResult.error ? [] : pointEventsResult.data ?? []) as TournamentLineupPointEventRow[]).map(mapTournamentLineupPointEvent),
    lineups: mapLineups((lineupResult.data ?? []) as TeamLineupRow[], ((lineupPlayerResult.data ?? []) as TeamLineupPlayerRow[]).filter((row) => lineupIds.has(row.team_lineup_id))),
  };
}

export async function addTournamentLineup(tournamentId: string, lineup: Omit<TeamLineup, "id" | "tournamentId" | "createdAt">): Promise<TeamLineup> {
  assertUuid(tournamentId, "Tournament ID");
  const { data, error } = await supabase.from("team_lineups").insert({ tournament_id: tournamentId, lineup_name: lineup.name, ratio: lineup.ratio ?? "A", note: lineup.notes ?? "" }).select("*").single<TeamLineupRow>();
  if (error) throw error;
  const created: TeamLineup = { ...lineup, id: data.id, tournamentId, createdAt: data.created_at ?? new Date().toISOString() };
  const rows = lineupPlayerPayload(created.players, created.id);
  if (rows.length) await supabase.from("team_lineup_players").insert(rows).throwOnError();
  return created;
}

export async function updateTournamentLineup(lineupId: string, lineup: Partial<Omit<TeamLineup, "id" | "createdAt">>): Promise<void> {
  assertUuid(lineupId, "Lineup ID");
  await supabase.from("team_lineups").update({ lineup_name: lineup.name, ratio: lineup.ratio ?? "A", note: lineup.notes ?? "" }).eq("id", lineupId).throwOnError();
  if (lineup.players) {
    await supabase.from("team_lineup_players").delete().eq("team_lineup_id", lineupId).throwOnError();
    const rows = lineupPlayerPayload(lineup.players, lineupId);
    if (rows.length) await supabase.from("team_lineup_players").insert(rows).throwOnError();
  }
}

export async function deleteTournamentLineup(lineupId: string): Promise<void> {
  await supabase.from("team_lineups").delete().eq("id", lineupId).throwOnError();
}

export async function getTournamentLineupsWithStats(tournamentId: string): Promise<{ lineups: TeamLineup[]; stats: TournamentLineupGameStats[] }> {
  assertUuid(tournamentId, "Tournament ID");
  const detail = await getTournamentDetail(tournamentId);
  return { lineups: detail?.lineups ?? [], stats: detail?.lineupGameStats ?? [] };
}

export async function getLineupGameStats(tournamentId: string, teamLineupId: string): Promise<TournamentLineupGameStats[]> {
  assertUuid(tournamentId, "Tournament ID");
  assertUuid(teamLineupId, "Lineup ID");
  const { data, error } = await supabase.from("tournament_lineup_game_stats").select("*").eq("tournament_id", tournamentId).eq("team_lineup_id", teamLineupId);
  if (error) {
    console.warn("Unable to load lineup game stats.", error);
    return [];
  }
  return ((data ?? []) as TournamentLineupGameStatsRow[]).map(mapTournamentLineupGameStats);
}

export async function saveLineupGameStats(stats: Omit<TournamentLineupGameStats, "id" | "createdAt" | "updatedAt"> & { id?: string }, lineupPlayers: TeamLineup["players"] = [], totalGames = 1): Promise<TournamentLineupGameStats> {
  validateLineupGameStats(stats, lineupPlayers, totalGames);
  const { data, error } = await supabase
    .from("tournament_lineup_game_stats")
    .upsert({ id: stats.id ?? id("tlgs"), ...tournamentLineupGameStatsPayload(stats) }, { onConflict: "tournament_id,team_lineup_id,game_no" })
    .select("*")
    .single<TournamentLineupGameStatsRow>();
  if (error) throw error;
  return mapTournamentLineupGameStats(data);
}

export async function updateLineupGameStats(id: string, stats: Partial<TournamentLineupGameStats>, lineupPlayers: TeamLineup["players"] = [], totalGames = 1): Promise<void> {
  assertUuid(id, "Lineup stats ID");
  validateLineupGameStats(stats, lineupPlayers, totalGames);
  await supabase.from("tournament_lineup_game_stats").update(tournamentLineupGameStatsPayload(stats)).eq("id", id).throwOnError();
}

export async function deleteLineupGameStats(id: string): Promise<void> {
  assertUuid(id, "Lineup stats ID");
  await supabase.from("tournament_lineup_game_stats").delete().eq("id", id).throwOnError();
}

export async function updateLineupRatio(lineupId: string, ratio: LineupRatio): Promise<void> {
  assertUuid(lineupId, "Lineup ID");
  await supabase.from("team_lineups").update({ ratio }).eq("id", lineupId).throwOnError();
}

export async function getLineupPointEvents(tournamentId: string, teamLineupId: string, gameNo: number): Promise<TournamentLineupPointEvent[]> {
  assertUuid(tournamentId, "Tournament ID");
  assertUuid(teamLineupId, "Lineup ID");
  const { data, error } = await supabase
    .from("tournament_lineup_point_events")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("team_lineup_id", teamLineupId)
    .eq("game_no", Math.max(1, Number(gameNo)))
    .order("event_order")
    .order("point_no");
  if (error) {
    console.warn("Unable to load lineup point events.", error);
    return [];
  }
  return ((data ?? []) as TournamentLineupPointEventRow[]).map(mapTournamentLineupPointEvent);
}

export async function getGamePointEvents(tournamentId: string, gameNo: number): Promise<TournamentLineupPointEvent[]> {
  assertUuid(tournamentId, "Tournament ID");
  const { data, error } = await supabase
    .from("tournament_lineup_point_events")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("game_no", Math.max(1, Number(gameNo)))
    .order("event_order")
    .order("point_no");
  if (error) {
    console.warn("Unable to load game point events.", error);
    return [];
  }
  return ((data ?? []) as TournamentLineupPointEventRow[]).map(mapTournamentLineupPointEvent);
}

export async function getLatestGameScore(tournamentId: string, gameNo: number) {
  const events = await getGamePointEvents(tournamentId, gameNo);
  const latest = sortPointEvents(events).at(-1);
  return {
    teamScore: latest?.teamScoreAfter ?? 0,
    opponentScore: latest?.opponentScoreAfter ?? 0,
    eventOrder: latest?.eventOrder ?? latest?.pointNo ?? 0,
  };
}

export async function createGamePointEvent(event: Omit<TournamentLineupPointEvent, "id" | "createdAt" | "updatedAt" | "eventOrder"> & { eventOrder?: number }, lineupPlayers: TeamLineup["players"] = [], totalGames = 1): Promise<TournamentLineupPointEvent> {
  validatePointEvent(event, lineupPlayers, totalGames);
  const latest = await getLatestGameScore(event.tournamentId, event.gameNo);
  const eventOrder = latest.eventOrder + 1;
  const payload = {
    ...event,
    eventOrder,
    pointNo: eventOrder,
    teamScoreAfter: latest.teamScore + (event.eventType === "team_score" || event.eventType === "break" ? 1 : 0),
    opponentScoreAfter: latest.opponentScore + (event.eventType === "opponent_score" ? 1 : 0),
  };
  const { data, error } = await supabase.from("tournament_lineup_point_events").insert(tournamentLineupPointEventPayload(payload)).select("*").single<TournamentLineupPointEventRow>();
  if (error) throw error;
  return mapTournamentLineupPointEvent(data);
}

export const createLineupPointEvent = createGamePointEvent;

export async function updateGamePointEvent(id: string, event: Partial<TournamentLineupPointEvent>, lineupPlayers: TeamLineup["players"] = [], totalGames = 1): Promise<void> {
  assertUuid(id, "Point event ID");
  validatePointEvent(event, lineupPlayers, totalGames);
  await supabase.from("tournament_lineup_point_events").update(tournamentLineupPointEventPayload(event)).eq("id", id).throwOnError();
  if (event.tournamentId && event.gameNo) await recalculateGameScores(event.tournamentId, event.gameNo);
}

export const updateLineupPointEvent = updateGamePointEvent;

export async function deleteGamePointEvent(id: string): Promise<void> {
  assertUuid(id, "Point event ID");
  const { data: existing, error } = await supabase.from("tournament_lineup_point_events").select("*").eq("id", id).maybeSingle<TournamentLineupPointEventRow>();
  if (error) throw error;
  await supabase.from("tournament_lineup_point_events").delete().eq("id", id).throwOnError();
  if (existing) await recalculateGameScores(existing.tournament_id, Math.max(1, Number(existing.game_no ?? 1)));
}

export const deleteLineupPointEvent = deleteGamePointEvent;

export async function recalculateGameScores(tournamentId: string, gameNo: number): Promise<void> {
  const events = await getGamePointEvents(tournamentId, gameNo);
  const recalculated = recalculatePointEvents(events);
  for (const event of recalculated) {
    await supabase
      .from("tournament_lineup_point_events")
      .update({
        event_order: event.eventOrder,
        point_no: event.pointNo,
        team_score_after: event.teamScoreAfter,
        opponent_score_after: event.opponentScoreAfter,
      })
      .eq("id", event.id)
      .throwOnError();
  }
}

export async function getLineupStatsFromPointEvents(tournamentId: string, teamLineupId: string) {
  assertUuid(tournamentId, "Tournament ID");
  assertUuid(teamLineupId, "Lineup ID");
  const { data, error } = await supabase.from("tournament_lineup_point_events").select("*").eq("tournament_id", tournamentId).eq("team_lineup_id", teamLineupId);
  if (error) {
    console.warn("Unable to load lineup point stats.", error);
    return lineupPointSummary([]);
  }
  return lineupPointSummary(((data ?? []) as TournamentLineupPointEventRow[]).map(mapTournamentLineupPointEvent));
}

export async function getLineupGameSummary(tournamentId: string, teamLineupId: string, gameNo: number) {
  const events = await getLineupPointEvents(tournamentId, teamLineupId, gameNo);
  return lineupPointSummary(events);
}

export async function getTournamentPointSummary(tournamentId: string) {
  assertUuid(tournamentId, "Tournament ID");
  const { data, error } = await supabase.from("tournament_lineup_point_events").select("*").eq("tournament_id", tournamentId);
  if (error) {
    console.warn("Unable to load tournament point summary.", error);
    return lineupPointSummary([]);
  }
  return lineupPointSummary(((data ?? []) as TournamentLineupPointEventRow[]).map(mapTournamentLineupPointEvent));
}

export const getTournamentSummaryFromPointEvents = getTournamentPointSummary;

function lineupPointSummary(events: TournamentLineupPointEvent[]) {
  const sorted = sortPointEvents(events);
  const latest = sorted.at(-1);
  const scoringEvents = sorted.filter((event) => event.eventType === "team_score" || event.eventType === "break");
  return {
    teamScore: latest?.teamScoreAfter ?? 0,
    opponentScore: latest?.opponentScoreAfter ?? 0,
    pointsAgainst: latest?.opponentScoreAfter ?? 0,
    turnovers: sorted.filter((event) => event.eventType === "turnover").length,
    blocks: sorted.filter((event) => event.eventType === "block").length + scoringEvents.filter((event) => event.blockPlayerId).length,
    breaks: sorted.filter((event) => event.eventType === "break").length,
    assists: scoringEvents.filter((event) => event.assistPlayerId).length,
    goals: scoringEvents.length,
  };
}

function sortPointEvents(events: TournamentLineupPointEvent[]) {
  return [...events].sort((a, b) => (a.eventOrder || a.pointNo) - (b.eventOrder || b.pointNo));
}

function recalculatePointEvents(events: TournamentLineupPointEvent[]) {
  let teamScore = 0;
  let opponentScore = 0;
  return sortPointEvents(events).map((event, index) => {
    if (event.eventType === "team_score" || event.eventType === "break") teamScore += 1;
    if (event.eventType === "opponent_score") opponentScore += 1;
    return { ...event, eventOrder: index + 1, pointNo: index + 1, teamScoreAfter: teamScore, opponentScoreAfter: opponentScore };
  });
}

export async function saveGameStats(tournamentId: string, gameNo: number, lineupId: string | null, stats: (Omit<TournamentStats, "id" | "tournamentId" | "gameNo" | "teamLineupId"> & { id?: string })[]): Promise<void> {
  if (!stats.length) return;
  await supabase
    .from("tournament_player_stats")
    .upsert(stats.map((row) => ({ id: row.id ?? id("ts"), ...tournamentStatsPayload({ ...row, tournamentId, gameNo, teamLineupId: lineupId }) })))
    .throwOnError();
}

export async function getTournamentStats(tournamentId: string): Promise<TournamentStats[]> {
  const { data, error } = await supabase.from("tournament_player_stats").select("*").eq("tournament_id", tournamentId);
  if (error) throw error;
  return ((data ?? []) as TournamentPlayerStatsRow[]).map(mapTournamentStats);
}

export async function getPlayerTournamentStats(playerId: string): Promise<TournamentStats[]> {
  const { data, error } = await supabase.from("tournament_player_stats").select("*").eq("player_id", playerId);
  if (error) throw error;
  return ((data ?? []) as TournamentPlayerStatsRow[]).map(mapTournamentStats);
}
