import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Copy, MapPin, Pencil, Plus, RotateCcw, Save, Search, Trash2, Trophy, Users2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import type { LineupPlayerRole, LineupPointEventType, LineupRatio, Player, TeamLineup, TeamLineupPlayer, Tournament, TournamentEventType, TournamentLineupGameStats, TournamentLineupPointEvent, TournamentPlayer, TournamentRole, TournamentStats, TournamentStatus } from "@/types/app";

const eventTypes: TournamentEventType[] = ["Tournament", "Friendly"];
const statuses: TournamentStatus[] = ["Draft", "Upcoming", "Completed", "Cancelled"];
const tournamentRoles: TournamentRole[] = ["main player", "reserve", "captain"];
const lineupRoles: LineupPlayerRole[] = ["Handler", "Cutter", "Hybrid", "Defender", "Captain", "Reserve"];
const lineupRatios: LineupRatio[] = ["A", "B"];
const pointEventTypes: LineupPointEventType[] = ["team_score", "break", "opponent_score", "turnover", "block", "timeout", "note"];
const inputClass = "machine-input w-full px-3 py-3 text-sm outline-none placeholder:text-silver-muted focus:border-cyan/35";

type RosterDraft = Record<string, TournamentRole>;
type LineupDraft = Omit<TeamLineup, "tournamentId" | "createdAt">;

const makeDraftId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;

const emptyTournament = (): Omit<Tournament, "id"> => ({
  name: "",
  location: "",
  eventType: "Tournament",
  start: "",
  end: "",
  description: "",
  status: "Upcoming",
  totalGames: 1,
  result: "",
});

export function TournamentsListPage() {
  const { data } = useAppData();
  return (
    <DashboardLayout title="Tournaments">
      <PageHeader eyebrow="Competition calendar" title="Tournament operations" description="Create events, select players, build lineups, and track game-by-game stats." action={<PrimaryLink to="/dashboard/tournaments/create" label="Add tournament" icon={Plus} />} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.tournaments.map((tournament) => (
          <Link key={tournament.id} to="/dashboard/tournaments/$tournamentId" params={{ tournamentId: tournament.id }} className="panel panel-hover block p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-black">{tournament.name}</div>
                <div className="mt-2 text-xs text-silver-muted">{tournament.location} | {tournament.start} to {tournament.end}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge tone={tournament.eventType === "Friendly" ? "silver" : "cyan"}>{tournament.eventType}</StatusBadge>
                <StatusBadge tone={statusTone(tournament.status)}>{tournament.status}</StatusBadge>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-silver-muted">{tournament.description || "No description added."}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniMetric label="Players" value={data.tournamentPlayers.filter((row) => row.tournamentId === tournament.id).length} />
              <MiniMetric label="Lineups" value={data.teamLineups.filter((row) => row.tournamentId === tournament.id).length} />
              <MiniMetric label="Games" value={tournament.totalGames} />
            </div>
            {tournament.result && <div className="mt-3 text-sm font-bold text-cyan">{tournament.result}</div>}
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}

export function TournamentCreatePage() {
  return <TournamentFlowForm mode="create" />;
}

export function TournamentEditPage({ tournamentId }: { tournamentId: string }) {
  const { data } = useAppData();
  const tournament = data.tournaments.find((item) => item.id === tournamentId);
  if (!tournament) return <MissingDashboard title="Tournament not found" />;
  return <TournamentFlowForm mode="edit" tournament={tournament} />;
}

function TournamentFlowForm({ mode, tournament }: { mode: "create" | "edit"; tournament?: Tournament }) {
  const navigate = useNavigate();
  const { data, createTournamentWithLineups, updateTournamentWithLineups } = useAppData();
  const [form, setForm] = useState<Omit<Tournament, "id">>(tournament ? { ...tournament } : emptyTournament());
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [roster, setRoster] = useState<RosterDraft>(() => {
    if (!tournament) return {};
    return Object.fromEntries(data.tournamentPlayers.filter((row) => row.tournamentId === tournament.id).map((row) => [row.playerId, row.role]));
  });
  const [lineups, setLineups] = useState<LineupDraft[]>(() => {
    if (!tournament) return [];
    return data.teamLineups.filter((lineup) => lineup.tournamentId === tournament.id).map((lineup) => ({ id: lineup.id, name: lineup.name, ratio: lineup.ratio ?? "A", notes: lineup.notes, players: lineup.players.map((player) => ({ ...player })) }));
  });

  const selectedIds = Object.keys(roster);
  const filteredPlayers = data.players.filter((player) => `${player.name} ${player.email} ${player.jersey}`.toLowerCase().includes(query.toLowerCase()));

  const setTournamentField = <K extends keyof Omit<Tournament, "id">>(key: K, value: Omit<Tournament, "id">[K]) => setForm((current) => ({ ...current, [key]: value }));
  const selectPlayer = (playerId: string, checked: boolean) => {
    setRoster((current) => {
      const next = { ...current };
      if (checked) next[playerId] = next[playerId] ?? "main player";
      else delete next[playerId];
      return next;
    });
    if (!checked) setLineups((current) => current.map((lineup) => ({ ...lineup, players: lineup.players.filter((player) => player.playerId !== playerId) })));
  };
  const selectedPlayers = data.players.filter((player) => selectedIds.includes(player.id));

  const createLineupFromSelected = () => {
    if (!selectedPlayers.length) {
      toast.error("Select at least 1 player before creating a lineup.");
      return;
    }
    setLineups((current) => [
      ...current,
      {
        id: makeDraftId("lineup"),
        name: `Line ${String.fromCharCode(65 + current.length)}`,
        ratio: "A",
        notes: "",
        players: selectedPlayers.map((player, index) => ({ id: makeDraftId("lp"), playerId: player.id, position: player.position, lineOrder: index + 1 })),
      },
    ]);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const error = validateTournament(form, selectedIds, lineups);
    if (error) {
      toast.error(error);
      return;
    }

    const tournamentPlayers = selectedIds.map((playerId) => ({ playerId, role: roster[playerId] }));
    const cleanedLineups = lineups.map((lineup) => ({
      ...lineup,
      name: lineup.name.trim(),
      players: lineup.players
        .filter((player) => selectedIds.includes(player.playerId))
        .sort((a, b) => a.lineOrder - b.lineOrder)
        .map((player, index) => ({ ...player, lineOrder: Math.max(1, Number(player.lineOrder || index + 1)) })),
    }));

    setSaving(true);
    try {
      if (mode === "create") {
        const created = await createTournamentWithLineups({ tournament: form, tournamentPlayers, lineups: cleanedLineups });
        toast.success("Tournament, roster, and lineups created.");
        navigate({ to: "/dashboard/tournaments/$tournamentId", params: { tournamentId: created.id } });
        return;
      }

      updateTournamentWithLineups(tournament!.id, { tournament: form, tournamentPlayers, lineups: cleanedLineups });
      toast.success("Tournament flow saved.");
      navigate({ to: "/dashboard/tournaments/$tournamentId", params: { tournamentId: tournament!.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save tournament flow.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title={mode === "create" ? "Create tournament" : "Edit tournament"}>
      <PageHeader eyebrow="Tournament command" title={mode === "create" ? "Create tournament flow" : `Edit ${tournament?.name}`} description="Set the event details, select the roster, build game lineups, then save everything into the tournament." />
      <form onSubmit={save} className="grid gap-5">
        <section className="panel p-5">
          <SectionTitle step="01" title="Tournament Details" detail="Core event information shown to coaches, players, and the public calendar." />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Name"><input className={inputClass} value={form.name} onChange={(event) => setTournamentField("name", event.target.value)} required /></Field>
            <Field label="Location"><input className={inputClass} value={form.location} onChange={(event) => setTournamentField("location", event.target.value)} required /></Field>
            <Field label="Event type"><Select value={form.eventType} onChange={(value) => setTournamentField("eventType", value as TournamentEventType)} options={eventTypes} /></Field>
            <Field label="Status"><Select value={form.status} onChange={(value) => setTournamentField("status", value as TournamentStatus)} options={statuses} /></Field>
            <TextField label="Start date" type="date" value={form.start} onChange={(value) => setTournamentField("start", value)} required />
            <TextField label="End date" type="date" value={form.end} onChange={(value) => setTournamentField("end", value)} required />
            <Field label="Total games"><input className={inputClass} type="number" min={1} value={form.totalGames} onChange={(event) => setTournamentField("totalGames", Math.max(1, Number(event.target.value)))} required /></Field>
            <Field label="Result"><input className={inputClass} value={form.result ?? ""} onChange={(event) => setTournamentField("result", event.target.value)} placeholder="Example: Champion, 6W-0L" /></Field>
            <Field label="Description"><textarea className={`${inputClass} min-h-28`} value={form.description} onChange={(event) => setTournamentField("description", event.target.value)} required /></Field>
          </div>
        </section>

        <section className="panel p-5">
          <SectionTitle step="02" title="Player Selection" detail="Choose the tournament roster first. Lineups are built from these players." action={<StatusBadge tone="cyan">{selectedIds.length} selected</StatusBadge>} />
          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <SearchInput value={query} onChange={setQuery} placeholder="Search players, jersey, email" />
            <button type="button" onClick={() => setRoster(Object.fromEntries(data.players.map((player) => [player.id, "main player" as TournamentRole])))} className="rounded-xl border border-cyan/25 bg-cyan/10 px-4 py-3 text-sm font-black text-cyan">Select all</button>
            <button type="button" onClick={() => { setRoster({}); setLineups([]); }} className="rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-black">Clear all</button>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {filteredPlayers.map((player) => (
              <PlayerPickCard key={player.id} player={player} selected={selectedIds.includes(player.id)} role={roster[player.id]} onToggle={(checked) => selectPlayer(player.id, checked)} onRoleChange={(role) => setRoster((current) => ({ ...current, [player.id]: role }))} />
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <SectionTitle
            step="03"
            title="Lineup Builder"
            detail="Players can appear in multiple lineups for different games."
            action={<button type="button" onClick={createLineupFromSelected} className="rounded-xl border border-cyan/25 bg-cyan/10 px-4 py-3 text-sm font-black text-cyan">Create lineup from selected players</button>}
          />
          <div className="mt-5 grid gap-4">
            {lineups.map((lineup, index) => (
              <LineupDraftEditor key={lineup.id} lineup={lineup} selectedPlayers={selectedPlayers} onChange={(next) => setLineups((current) => current.map((item) => (item.id === lineup.id ? next : item)))} onDuplicate={() => setLineups((current) => [...current, { ...lineup, id: makeDraftId("lineup"), name: `${lineup.name} copy`, ratio: lineup.ratio ?? "A", players: lineup.players.map((player) => ({ ...player, id: makeDraftId("lp") })) }])} onDelete={() => setLineups((current) => current.filter((item) => item.id !== lineup.id))} index={index} />
            ))}
            {!lineups.length && <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-silver-muted">No lineups yet. Select players, then create a lineup from the selected roster.</div>}
          </div>
        </section>

        <section className="panel p-5">
          <SectionTitle step="04" title="Review & Save" detail="Saving creates the tournament, roster rows, lineup rows, and lineup player rows." />
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <MiniMetric label="Event type" value={form.eventType} />
            <MiniMetric label="Players" value={selectedIds.length} />
            <MiniMetric label="Lineups" value={lineups.length} />
            <MiniMetric label="Games" value={form.totalGames} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-5 py-3 text-sm font-black text-cyan glow-cyan disabled:opacity-60"><Save className="h-4 w-4" />{saving ? "Saving..." : "Save tournament flow"}</button>
            <Link to={mode === "edit" && tournament ? "/dashboard/tournaments/$tournamentId" : "/dashboard/tournaments"} params={tournament ? { tournamentId: tournament.id } : undefined} className="rounded-xl border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-bold">Cancel</Link>
          </div>
        </section>
      </form>
    </DashboardLayout>
  );
}

export function TournamentDetailPage({ tournamentId }: { tournamentId: string }) {
  const { data, deleteTournament, removeTournamentPlayer, selectTournamentPlayer, updateTournamentPlayerRole, createLineup, deleteLineup } = useAppData();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");
  const [scoreLineupId, setScoreLineupId] = useState("");
  const [scoreGameNo, setScoreGameNo] = useState(1);
  const tournament = data.tournaments.find((item) => item.id === tournamentId);
  if (!tournament) return <MissingDashboard title="Tournament not found" />;

  const selected = data.tournamentPlayers.filter((row) => row.tournamentId === tournament.id);
  const lineups = data.teamLineups.filter((lineup) => lineup.tournamentId === tournament.id);
  const stats = data.tournamentStats.filter((row) => row.tournamentId === tournament.id);
  const pointEvents = data.tournamentLineupPointEvents.filter((row) => row.tournamentId === tournament.id);
  const totals = calculatePointTournamentTotals(pointEvents, lineups, data.players);

  return (
    <DashboardLayout title={tournament.name}>
      <PageHeader
        eyebrow="Tournament detail"
        title={tournament.name}
        description={`${tournament.location} | ${tournament.start} to ${tournament.end}`}
        action={
          <div className="flex flex-wrap gap-2">
            <PrimaryLink to="/dashboard/tournaments/$tournamentId/edit" params={{ tournamentId }} label="Edit tournament" icon={Pencil} />
            <button
              onClick={() => {
                if (window.confirm(`Delete ${tournament.name}? Selected players, stats, and lineups will also be removed.`)) {
                  deleteTournament(tournament.id);
                  toast.success("Tournament deleted.");
                  navigate({ to: "/dashboard/tournaments" });
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-3 text-sm font-bold text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MiniMetric label="Event" value={tournament.eventType} />
        <MiniMetric label="Status" value={tournament.status} />
        <MiniMetric label="Games" value={tournament.totalGames} />
        <MiniMetric label="Players" value={selected.length} />
        <MiniMetric label="Lineups" value={lineups.length} />
        <MiniMetric label="Location" value={tournament.location} />
      </div>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {["Overview", "Players", "Lineups", "Score Breakdown", "Summary Stats"].map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black ${tab === item ? "border-cyan/40 bg-cyan/15 text-cyan" : "border-white/10 bg-white/[0.045] text-silver-muted"}`}>
            {item}
          </button>
        ))}
      </div>
      {tab === "Overview" && <TournamentOverview tournament={tournament} selectedCount={selected.length} lineupCount={lineups.length} statsCount={stats.length} />}
      {tab === "Players" && <TournamentPlayersPanel tournament={tournament} selected={selected} />}
      {tab === "Lineups" && <TournamentLineupsPanel tournament={tournament} lineups={lineups} pointEvents={pointEvents} onAddScoreEvent={(lineupId, gameNo) => { setScoreLineupId(lineupId); setScoreGameNo(gameNo); setTab("Score Breakdown"); }} onDuplicate={(lineup) => createLineup({ tournamentId: tournament.id, name: `${lineup.name} copy`, ratio: lineup.ratio ?? "A", notes: lineup.notes, players: lineup.players.map((player) => ({ ...player, id: makeDraftId("lp") })) })} onDelete={deleteLineup} />}
      {tab === "Score Breakdown" && <ScoreBreakdownPanel tournament={tournament} lineups={lineups} players={data.players} pointEvents={pointEvents} selectedLineupId={scoreLineupId} onSelectedLineupChange={setScoreLineupId} selectedGameNo={scoreGameNo} onSelectedGameChange={setScoreGameNo} />}
      {tab === "Summary Stats" && <TournamentSummaryPanel totals={totals} />}
    </DashboardLayout>
  );
}

export function TeamLineupPage() {
  const { data, deleteLineup } = useAppData();
  const tournaments = data.tournaments.filter((tournament) => data.teamLineups.some((lineup) => lineup.tournamentId === tournament.id));
  return (
    <DashboardLayout title="Team Lineup">
      <PageHeader eyebrow="Line builder" title="Tournament lineups" description="Lineups are grouped by tournament and connected back to selected tournament players." action={<PrimaryLink to="/dashboard/team-lineup/create" label="Create lineup" icon={Plus} />} />
      <div className="grid gap-4">
        {tournaments.map((tournament) => (
          <section key={tournament.id} className="panel p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-2xl font-black">{tournament.name}</div>
                <div className="text-xs text-silver-muted">{tournament.location} | {tournament.eventType}</div>
              </div>
              <StatusBadge tone="cyan">{data.teamLineups.filter((lineup) => lineup.tournamentId === tournament.id).length} lineups</StatusBadge>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {data.teamLineups.filter((lineup) => lineup.tournamentId === tournament.id).map((lineup) => (
                <LineupCard key={lineup.id} lineup={lineup} players={data.players} tournamentName={tournament.name} pointEvents={data.tournamentLineupPointEvents.filter((row) => row.teamLineupId === lineup.id)} onDelete={() => deleteLineup(lineup.id)} />
              ))}
            </div>
          </section>
        ))}
        {!tournaments.length && <div className="panel p-5 text-sm text-silver-muted">No tournament lineups yet.</div>}
      </div>
    </DashboardLayout>
  );
}

export function TeamLineupCreatePage() {
  const { data, createLineup } = useAppData();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [ratio, setRatio] = useState<LineupRatio>("A");
  const [notes, setNotes] = useState("");
  const [tournamentId, setTournamentId] = useState(data.tournaments[0]?.id ?? "");
  const [allowAllPlayers, setAllowAllPlayers] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const tournamentPlayerIds = data.tournamentPlayers.filter((row) => row.tournamentId === tournamentId).map((row) => row.playerId);
  const availablePlayers = allowAllPlayers ? data.players : data.players.filter((player) => tournamentPlayerIds.includes(player.id));

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!tournamentId || !name.trim()) {
      toast.error("Select a tournament and add a lineup name.");
      return;
    }
    createLineup({
      name: name.trim(),
      ratio,
      tournamentId,
      notes,
      players: selected.map((playerId, index) => ({ id: makeDraftId("lp"), playerId, position: data.players.find((player) => player.id === playerId)?.position ?? "Hybrid", lineOrder: index + 1 })),
    });
    toast.success("Lineup created.");
    navigate({ to: "/dashboard/team-lineup" });
  };

  return (
    <DashboardLayout title="Create lineup">
      <FormShell title="Create tournament lineup" onSubmit={save}>
        <TextField label="Lineup name" value={name} onChange={setName} required />
        <Field label="Ratio"><Select value={ratio} onChange={(value) => setRatio(value as LineupRatio)} options={lineupRatios} labels={{ A: "Ratio A - male ratio", B: "Ratio B - female ratio" }} /></Field>
        <TextField label="Notes" value={notes} onChange={setNotes} />
        <Field label="Tournament"><Select value={tournamentId} onChange={(value) => { setTournamentId(value); setSelected([]); }} options={data.tournaments.map((item) => item.id)} labels={Object.fromEntries(data.tournaments.map((item) => [item.id, item.name]))} /></Field>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 text-sm">
          <input type="checkbox" checked={allowAllPlayers} onChange={(event) => setAllowAllPlayers(event.target.checked)} />
          Add from all club players
        </label>
        <CheckboxGrid label={allowAllPlayers ? "All players" : "Tournament selected players"} items={availablePlayers.map((player) => ({ id: player.id, label: `${player.name} #${player.jersey}` }))} selected={selected} onChange={setSelected} />
      </FormShell>
    </DashboardLayout>
  );
}

export function TeamLineupEditPage({ lineupId }: { lineupId: string }) {
  const { data, updateLineup } = useAppData();
  const navigate = useNavigate();
  const lineup = data.teamLineups.find((item) => item.id === lineupId);
  const [name, setName] = useState(lineup?.name ?? "");
  const [ratio, setRatio] = useState<LineupRatio>(lineup?.ratio ?? "A");
  const [notes, setNotes] = useState(lineup?.notes ?? "");
  const [selected, setSelected] = useState<string[]>(lineup?.players.map((player) => player.playerId) ?? []);

  if (!lineup) return <MissingDashboard title="Lineup not found" />;

  const tournamentPlayerIds = data.tournamentPlayers.filter((row) => row.tournamentId === lineup.tournamentId).map((row) => row.playerId);
  const availablePlayers = data.players.filter((player) => tournamentPlayerIds.includes(player.id) || selected.includes(player.id));

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Add a lineup name.");
      return;
    }
    updateLineup({
      id: lineup.id,
      name: name.trim(),
      ratio,
      notes,
      players: selected.map((playerId, index) => ({
        id: lineup.players.find((player) => player.playerId === playerId)?.id ?? makeDraftId("lp"),
        playerId,
        position: lineup.players.find((player) => player.playerId === playerId)?.position ?? data.players.find((player) => player.id === playerId)?.position ?? "Hybrid",
        lineOrder: index + 1,
      })),
    });
    toast.success("Lineup updated.");
    navigate({ to: "/dashboard/team-lineup" });
  };

  return (
    <DashboardLayout title="Edit lineup">
      <FormShell title={`Edit ${lineup.name}`} onSubmit={save}>
        <TextField label="Lineup name" value={name} onChange={setName} required />
        <Field label="Ratio"><Select value={ratio} onChange={(value) => setRatio(value as LineupRatio)} options={lineupRatios} labels={{ A: "Ratio A - male ratio", B: "Ratio B - female ratio" }} /></Field>
        <TextField label="Notes" value={notes} onChange={setNotes} />
        <CheckboxGrid label="Lineup players" items={availablePlayers.map((player) => ({ id: player.id, label: `${player.name} #${player.jersey}` }))} selected={selected} onChange={setSelected} />
      </FormShell>
    </DashboardLayout>
  );
}

export function PlayerTournamentsPage() {
  const { data } = useAppData();
  const { currentUser } = useAuth();
  const playerId = currentUser?.playerId ?? "p1";
  const rows = data.tournamentPlayers.filter((item) => item.playerId === playerId);
  return (
    <PlayerLayout title="My Tournaments">
      <div className="space-y-3">
        {rows.map((row) => {
          const tournament = data.tournaments.find((item) => item.id === row.tournamentId);
          const lineups = data.teamLineups.filter((lineup) => lineup.tournamentId === row.tournamentId && lineup.players.some((player) => player.playerId === playerId));
          const pointEvents = data.tournamentLineupPointEvents.filter((event) => event.tournamentId === row.tournamentId && lineups.some((lineup) => lineup.id === event.teamLineupId));
          const playerActionStats = pointEvents.filter((event) => event.scorerPlayerId === playerId || event.assistPlayerId === playerId || event.blockPlayerId === playerId);
          const lineTotals = pointEventTotals(pointEvents);
          if (!tournament) return null;
          return (
            <article key={row.id} className="panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-black">{tournament.name}</div>
                  <div className="mt-1 text-xs text-silver-muted">{tournament.location} | {tournament.start} to {tournament.end}</div>
                </div>
                <StatusBadge tone={statusTone(tournament.status)}>{tournament.status}</StatusBadge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge tone="cyan">{tournament.eventType}</StatusBadge>
                <StatusBadge tone="silver">{row.role}</StatusBadge>
                <StatusBadge tone={lineups.length ? "green" : "silver"}>{lineups.length ? `${lineups.length} lineup assignments` : "No lineup yet"}</StatusBadge>
              </div>
              <div className="mt-4 grid gap-2">
                {lineups.map((lineup) => (
                  <div key={lineup.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-black">{lineup.name}</div>
                      <RatioBadge ratio={lineup.ratio} />
                    </div>
                    <div className="text-xs text-silver-muted">Role: {lineup.players.find((player) => player.playerId === playerId)?.position}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MiniMetric label="Scores" value={playerActionStats.filter((stat) => stat.scorerPlayerId === playerId).length} />
                <MiniMetric label="Assists" value={playerActionStats.filter((stat) => stat.assistPlayerId === playerId).length} />
                <MiniMetric label="Blocks" value={playerActionStats.filter((stat) => stat.blockPlayerId === playerId).length} />
                <MiniMetric label="Line score" value={lineTotals.teamScore} />
                <MiniMetric label="Breaks" value={lineTotals.breaks} />
                <MiniMetric label="Turnovers" value={lineTotals.turnovers} />
                <MiniMetric label="Points against" value={lineTotals.pointsAgainst} />
              </div>
              <div className="mt-4 grid gap-2">
                {playerActionStats.slice(0, 4).map((event) => (
                  <PointTimelineRow key={event.id} event={event} players={data.players} compact />
                ))}
              </div>
            </article>
          );
        })}
        {!rows.length && <div className="panel p-5 text-sm text-silver-muted">You are not selected for a tournament yet.</div>}
      </div>
    </PlayerLayout>
  );
}

function TournamentOverview({ tournament, selectedCount, lineupCount, statsCount }: { tournament: Tournament; selectedCount: number; lineupCount: number; statsCount: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="panel p-5">
        <div className="text-xl font-black">Tournament information</div>
        <p className="mt-3 text-sm leading-6 text-silver-muted">{tournament.description || "No description added."}</p>
        {tournament.result && <div className="mt-4 rounded-2xl border border-cyan/25 bg-cyan/10 p-3 text-sm font-black text-cyan">{tournament.result}</div>}
      </div>
      <div className="panel p-5">
        <div className="text-xl font-black">Operations snapshot</div>
        <div className="mt-4 grid gap-2">
          <InfoRow label="Date" value={`${tournament.start} to ${tournament.end}`} />
          <InfoRow label="Roster" value={`${selectedCount} selected players`} />
          <InfoRow label="Lineups" value={`${lineupCount} saved lineups`} />
          <InfoRow label="Stats entries" value={`${statsCount} player game entries`} />
        </div>
      </div>
    </div>
  );
}

function TournamentPlayersPanel({ tournament, selected }: { tournament: Tournament; selected: TournamentPlayer[] }) {
  const { data, removeTournamentPlayer, selectTournamentPlayer, updateTournamentPlayerRole } = useAppData();
  return (
    <div className="panel p-5">
      <SectionTitle step="Roster" title="Tournament Players" detail="Add or remove players and set tournament-level roles." action={<StatusBadge tone="cyan">{selected.length} selected</StatusBadge>} />
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {data.players.map((player) => {
          const row = selected.find((item) => item.playerId === player.id);
          return <PlayerPickCard key={player.id} player={player} selected={Boolean(row)} role={row?.role} onToggle={(checked) => (checked ? selectTournamentPlayer(tournament.id, player.id, "reserve") : removeTournamentPlayer(tournament.id, player.id))} onRoleChange={(role) => updateTournamentPlayerRole(tournament.id, player.id, role)} />;
        })}
      </div>
    </div>
  );
}

function TournamentLineupsPanel({ tournament, lineups, pointEvents, onAddScoreEvent, onDuplicate, onDelete }: { tournament: Tournament; lineups: TeamLineup[]; pointEvents: TournamentLineupPointEvent[]; onAddScoreEvent: (lineupId: string, gameNo: number) => void; onDuplicate: (lineup: TeamLineup) => void; onDelete: (lineupId: string) => void }) {
  const { data } = useAppData();
  return (
    <div className="grid gap-4">
      {lineups.map((lineup) => (
        <LineupStatsCard
          key={lineup.id}
          tournament={tournament}
          lineup={lineup}
          players={data.players}
          pointEvents={pointEvents.filter((row) => row.teamLineupId === lineup.id)}
          onAddScoreEvent={(gameNo) => onAddScoreEvent(lineup.id, gameNo)}
          onDuplicate={() => {
            onDuplicate(lineup);
            toast.success("Lineup duplicated.");
          }}
          onDelete={() => {
            if (window.confirm(`Delete ${lineup.name}?`)) {
              onDelete(lineup.id);
              toast.success("Lineup deleted.");
            }
          }}
        />
      ))}
      <Link to="/dashboard/team-lineup/create" className="panel panel-hover grid min-h-32 place-items-center p-5 text-center">
        <div>
          <Plus className="mx-auto h-6 w-6 text-cyan" />
          <div className="mt-2 font-black">Add tournament lineup</div>
          <div className="mt-1 text-xs text-silver-muted">Create from selected tournament players.</div>
        </div>
      </Link>
    </div>
  );
}

function LineupStatsCard({ tournament, lineup, players, pointEvents, onAddScoreEvent, onDuplicate, onDelete }: { tournament: Tournament; lineup: TeamLineup; players: Player[]; pointEvents: TournamentLineupPointEvent[]; onAddScoreEvent: (gameNo: number) => void; onDuplicate: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedGame, setSelectedGame] = useState("1");
  const gameOptions = ["all", ...Array.from({ length: Math.max(1, Number(tournament.totalGames)) }, (_, index) => String(index + 1))];
  const gameLabels = { all: "All games", ...Object.fromEntries(gameOptions.filter((option) => option !== "all").map((option) => [option, `Game ${option}`])) };
  const visibleEvents = selectedGame === "all" ? pointEvents : pointEvents.filter((event) => event.gameNo === Number(selectedGame));
  const totals = pointEventTotals(visibleEvents);
  const addScoreGameNo = selectedGame === "all" ? 1 : Number(selectedGame);
  const gameGroups = Array.from({ length: Math.max(1, Number(tournament.totalGames)) }, (_, index) => ({
    gameNo: index + 1,
    events: sortPointEvents(pointEvents.filter((event) => event.gameNo === index + 1)),
  })).filter((group) => group.events.length);
  return (
    <article className="panel p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-black">{lineup.name}</h3>
            <RatioBadge ratio={lineup.ratio} />
            <StatusBadge tone="silver">{lineup.players.length} players</StatusBadge>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-silver-muted">{lineup.notes || "No lineup notes."}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <div className="min-w-36 sm:min-w-40">
            <Select value={selectedGame} onChange={setSelectedGame} options={gameOptions} labels={gameLabels} />
          </div>
          <button onClick={() => setExpanded((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan/25 bg-cyan/10 px-4 py-3 text-sm font-black text-cyan">
            <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Hide stats" : "View stats"}
          </button>
          <Link to="/dashboard/team-lineup/$lineupId/edit" params={{ lineupId: lineup.id }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-bold">
            <Pencil className="h-4 w-4" />
            Edit lineup
          </Link>
          <button onClick={onDuplicate} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.045]" aria-label={`Duplicate ${lineup.name}`}><Copy className="h-4 w-4" /></button>
          <button onClick={onDelete} className="grid h-11 w-11 place-items-center rounded-xl border border-destructive/25 bg-destructive/10 text-destructive" aria-label={`Delete ${lineup.name}`}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
        <MiniMetric label="Games played" value={totals.games} />
        <MiniMetric label="Goals" value={totals.goals} />
        <MiniMetric label="Assists" value={totals.assists} />
        <MiniMetric label="Blocks" value={totals.blocks} />
        <MiniMetric label="Breaks" value={totals.breaks} />
        <MiniMetric label="Turnovers" value={totals.turnovers} />
        <MiniMetric label="Points against" value={totals.pointsAgainst} />
      </div>
      {expanded && (
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <LineupPlayersList lineup={lineup} players={players} />
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-black">Lineup events</div>
                <p className="mt-1 text-sm text-silver-muted">Stats here are filtered from the shared game scoreboard.</p>
              </div>
              <button onClick={() => onAddScoreEvent(addScoreGameNo)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm font-black text-cyan"><Plus className="h-4 w-4" />Add score event</button>
            </div>
            <div className="mt-4 grid gap-2">
              {selectedGame === "all"
                ? gameGroups.map((group) => (
                    <div key={group.gameNo} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-cyan">Game {group.gameNo}</div>
                      <div className="grid gap-2">
                        {group.events.map((event) => <PointTimelineRow key={event.id} event={event} players={players} compact />)}
                      </div>
                    </div>
                  ))
                : sortPointEvents(visibleEvents).slice(-6).reverse().map((event) => <PointTimelineRow key={event.id} event={event} players={players} compact />)}
              {!visibleEvents.length && <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-silver-muted">No score events logged for {selectedGame === "all" ? "this lineup" : `Game ${selectedGame}`} yet.</div>}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function LineupPlayersList({ lineup, players }: { lineup: TeamLineup; players: Player[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 text-lg font-black">Lineup Players</div>
      <div className="grid gap-2">
        {[...lineup.players].sort((a, b) => a.lineOrder - b.lineOrder).map((entry) => {
          const player = players.find((item) => item.id === entry.playerId);
          return player ? (
            <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <div className="metric-nums grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan/20 bg-cyan/10 text-sm font-black text-cyan">#{entry.lineOrder}</div>
              <PlayerAvatar name={player.name} hue={player.avatarHue} size={38} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-black">{player.name}</div>
                <div className="text-xs text-silver-muted">Jersey #{player.jersey} | {entry.position}</div>
              </div>
            </div>
          ) : null;
        })}
        {!lineup.players.length && <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-silver-muted">No players in this lineup.</div>}
      </div>
    </section>
  );
}

function ScoreBreakdownPanel({ tournament, lineups, players, pointEvents, selectedLineupId, onSelectedLineupChange, selectedGameNo, onSelectedGameChange }: { tournament: Tournament; lineups: TeamLineup[]; players: Player[]; pointEvents: TournamentLineupPointEvent[]; selectedLineupId: string; onSelectedLineupChange: (lineupId: string) => void; selectedGameNo: number; onSelectedGameChange: (gameNo: number) => void }) {
  const { createLineupPointEvent, updateLineupPointEvent, deleteLineupPointEvent } = useAppData();
  const gameNo = selectedGameNo;
  const setGameNo = onSelectedGameChange;
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState<PointEventDraft>(() => emptyPointEventDraft());
  const lineupId = selectedLineupId || lineups[0]?.id || "";
  const lineup = lineups.find((item) => item.id === lineupId);
  const gameEvents = sortPointEvents(pointEvents.filter((event) => event.gameNo === gameNo));
  const score = pointEventTotals(gameEvents);
  const lastScore = [...gameEvents].reverse().find((event) => event.eventType === "team_score" || event.eventType === "break" || event.eventType === "opponent_score");
  const lastScorer = lastScore?.scorerPlayerId ? players.find((player) => player.id === lastScore.scorerPlayerId)?.name : "";
  const lastLineup = lastScore ? lineups.find((item) => item.id === lastScore.teamLineupId)?.name : "";
  const editingEvent = gameEvents.find((event) => event.id === editingId);
  const lineupPlayers = lineup ? lineup.players.map((entry) => players.find((player) => player.id === entry.playerId)).filter(Boolean) as Player[] : [];
  const playerOptions = ["", ...lineupPlayers.map((player) => player.id)];
  const playerLabels = { "": "None", ...Object.fromEntries(lineupPlayers.map((player) => [player.id, `${player.name} #${player.jersey}`])) };

  useEffect(() => {
    if (!selectedLineupId && lineups[0]) onSelectedLineupChange(lineups[0].id);
  }, [lineups.length, selectedLineupId]);

  useEffect(() => {
    setEditingId("");
    setDraft(emptyPointEventDraft());
  }, [gameNo, lineupId]);

  const reset = () => {
    setEditingId("");
    setDraft(emptyPointEventDraft());
  };

  const save = () => {
    if (!lineup) {
      toast.error("Lineup is required.");
      return;
    }
    const error = validatePointEventDraft(draft, lineup);
    if (error) {
      toast.error(error);
      return;
    }
    const previous = editingEvent ? previousScoreBeforeEvent(gameEvents, editingEvent.id) : score;
    const nextScore = nextScoreForEvent(draft.eventType, previous);
    const payload = {
      tournamentId: tournament.id,
      teamLineupId: lineup.id,
      gameNo,
      pointNo: editingEvent?.pointNo ?? gameEvents.length + 1,
      eventOrder: editingEvent?.eventOrder ?? gameEvents.length + 1,
      eventType: draft.eventType,
      teamScoreAfter: nextScore.teamScore,
      opponentScoreAfter: nextScore.opponentScore,
      scorerPlayerId: draft.eventType === "team_score" || draft.eventType === "break" ? draft.scorerPlayerId || null : null,
      assistPlayerId: draft.eventType === "team_score" || draft.eventType === "break" ? draft.assistPlayerId || null : null,
      blockPlayerId: draft.eventType === "team_score" || draft.eventType === "break" || draft.eventType === "block" ? draft.blockPlayerId || null : null,
      turnoverPlayerId: draft.eventType === "turnover" ? draft.turnoverPlayerId || null : null,
      note: draft.note,
    };
    if (editingEvent) {
      updateLineupPointEvent({ id: editingEvent.id, ...payload });
      toast.success("Score event updated.");
    } else {
      createLineupPointEvent(payload);
      toast.success(pointEventSaveLabel(draft.eventType));
    }
    reset();
  };

  const edit = (event: TournamentLineupPointEvent) => {
    onSelectedLineupChange(event.teamLineupId);
    setEditingId(event.id);
    setDraft(pointEventToDraft(event));
  };

  return (
    <div className="grid gap-4">
      <section className="panel p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Field label="Game selector"><Select value={String(gameNo)} onChange={(value) => setGameNo(Number(value))} options={Array.from({ length: tournament.totalGames }, (_, index) => String(index + 1))} labels={Object.fromEntries(Array.from({ length: tournament.totalGames }, (_, index) => [String(index + 1), `Game ${index + 1}`]))} /></Field>
          <MiniMetric label="YM score" value={score.teamScore} />
          <MiniMetric label="Opponent score" value={score.opponentScore} />
          <MiniMetric label="Events logged" value={gameEvents.length} />
          <MiniMetric label="Last lineup" value={lastLineup || "No score"} />
          <MiniMetric label="Last scorer" value={lastScorer || "No scorer"} />
        </div>
      </section>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.8fr)]">
        <section className="panel p-5">
          <SectionTitle step="Timeline" title={`Game ${gameNo} score breakdown`} detail="All lineups share this scoreboard for the selected game." />
          <div className="mt-5 grid gap-2">
            {gameEvents.map((event) => (
              <PointTimelineRow
                key={event.id}
                event={event}
                players={players}
                lineupName={lineups.find((item) => item.id === event.teamLineupId)?.name}
                onEdit={() => edit(event)}
                onDelete={() => {
                  if (window.confirm(`Delete event ${event.eventOrder || event.pointNo}? The game score will be recalculated.`)) {
                    deleteLineupPointEvent(event.id);
                    toast.success("Score event deleted.");
                  }
                }}
              />
            ))}
            {!gameEvents.length && <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm text-silver-muted">No events yet. Add the first score event for Game {gameNo}.</div>}
          </div>
        </section>
        <section className="panel p-5">
          <SectionTitle step="Add event" title={editingEvent ? "Edit score event" : "Add score event"} detail="Players shown here come only from the selected lineup." />
          <div className="mt-5 grid gap-3">
            <Field label="Lineup on field"><Select value={lineupId} onChange={onSelectedLineupChange} options={lineups.map((item) => item.id)} labels={Object.fromEntries(lineups.map((item) => [item.id, `${item.name} - Ratio ${item.ratio}`]))} /></Field>
            <Field label="Event type"><Select value={draft.eventType} onChange={(value) => setDraft((current) => ({ ...emptyPointEventDraft(), eventType: value as LineupPointEventType, note: current.note }))} options={pointEventTypes} labels={pointEventLabels} /></Field>
            {(draft.eventType === "team_score" || draft.eventType === "break") && <Field label="Scorer"><Select value={draft.scorerPlayerId} onChange={(value) => setDraft((current) => ({ ...current, scorerPlayerId: value }))} options={playerOptions} labels={playerLabels} /></Field>}
            {(draft.eventType === "team_score" || draft.eventType === "break") && <Field label="Assist"><Select value={draft.assistPlayerId} onChange={(value) => setDraft((current) => ({ ...current, assistPlayerId: value }))} options={playerOptions} labels={playerLabels} /></Field>}
            {(draft.eventType === "team_score" || draft.eventType === "break" || draft.eventType === "block") && <Field label={draft.eventType === "block" ? "Block player" : "Block optional"}><Select value={draft.blockPlayerId} onChange={(value) => setDraft((current) => ({ ...current, blockPlayerId: value }))} options={playerOptions} labels={playerLabels} /></Field>}
            {draft.eventType === "turnover" && <Field label="Turnover player"><Select value={draft.turnoverPlayerId} onChange={(value) => setDraft((current) => ({ ...current, turnoverPlayerId: value }))} options={playerOptions} labels={playerLabels} /></Field>}
            <Field label="Note"><textarea className={`${inputClass} min-h-24`} maxLength={500} value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} /></Field>
            <div className="flex flex-wrap gap-2">
              <button onClick={save} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm font-black text-cyan"><Save className="h-4 w-4" />{editingEvent ? "Update Event" : saveButtonLabel(draft.eventType)}</button>
              <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-bold"><RotateCcw className="h-4 w-4" />Reset</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LineupPointEventWorkspace({ tournament, lineup, players, pointEvents }: { tournament: Tournament; lineup: TeamLineup; players: Player[]; pointEvents: TournamentLineupPointEvent[] }) {
  const { createLineupPointEvent, updateLineupPointEvent, deleteLineupPointEvent } = useAppData();
  const [gameNo, setGameNo] = useState(1);
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState<PointEventDraft>(() => emptyPointEventDraft());
  const gameEvents = pointEvents.filter((event) => event.gameNo === gameNo).sort((a, b) => a.pointNo - b.pointNo);
  const score = pointEventTotals(gameEvents);
  const editingEvent = gameEvents.find((event) => event.id === editingId);
  const lineupPlayers = lineup.players.map((entry) => players.find((player) => player.id === entry.playerId)).filter(Boolean) as Player[];
  const playerOptions = ["", ...lineupPlayers.map((player) => player.id)];
  const playerLabels = { "": "None", ...Object.fromEntries(lineupPlayers.map((player) => [player.id, `${player.name} #${player.jersey}`])) };

  useEffect(() => {
    setEditingId("");
    setDraft(emptyPointEventDraft());
  }, [gameNo, lineup.id]);

  const reset = () => {
    setEditingId("");
    setDraft(emptyPointEventDraft());
  };
  const save = () => {
    const error = validatePointEventDraft(draft, lineup);
    if (error) {
      toast.error(error);
      return;
    }
    const previous = editingEvent ? previousScoreBeforeEvent(gameEvents, editingEvent.id) : score;
    const nextScore = nextScoreForEvent(draft.eventType, previous);
    const payload = {
      tournamentId: tournament.id,
      teamLineupId: lineup.id,
      gameNo,
      pointNo: editingEvent?.pointNo ?? gameEvents.length + 1,
      eventType: draft.eventType,
      teamScoreAfter: nextScore.teamScore,
      opponentScoreAfter: nextScore.opponentScore,
      scorerPlayerId: draft.eventType === "team_score" || draft.eventType === "break" ? draft.scorerPlayerId || null : null,
      assistPlayerId: draft.eventType === "team_score" || draft.eventType === "break" ? draft.assistPlayerId || null : null,
      blockPlayerId: draft.eventType === "team_score" || draft.eventType === "break" || draft.eventType === "block" ? draft.blockPlayerId || null : null,
      turnoverPlayerId: draft.eventType === "turnover" ? draft.turnoverPlayerId || null : null,
      note: draft.note,
    };
    if (editingEvent) {
      updateLineupPointEvent({ id: editingEvent.id, ...payload });
      toast.success("Point event updated.");
    } else {
      createLineupPointEvent(payload);
      toast.success(pointEventSaveLabel(draft.eventType));
    }
    reset();
  };

  const edit = (event: TournamentLineupPointEvent) => {
    setEditingId(event.id);
    setDraft(pointEventToDraft(event));
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-lg font-black">Score Event Form</div>
          <p className="mt-1 text-sm text-silver-muted">Point events are logged only with players inside {lineup.name}.</p>
        </div>
        <Field label="Game"><Select value={String(gameNo)} onChange={(value) => setGameNo(Number(value))} options={Array.from({ length: tournament.totalGames }, (_, index) => String(index + 1))} labels={Object.fromEntries(Array.from({ length: tournament.totalGames }, (_, index) => [String(index + 1), `Game ${index + 1}`]))} /></Field>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <MiniMetric label="Current score" value={`YM ${score.teamScore} - ${score.opponentScore}`} />
        <MiniMetric label="Points against" value={score.pointsAgainst} />
        <MiniMetric label="Events logged" value={gameEvents.length} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field label="Event type"><Select value={draft.eventType} onChange={(value) => setDraft((current) => ({ ...emptyPointEventDraft(), eventType: value as LineupPointEventType, note: current.note }))} options={pointEventTypes} labels={pointEventLabels} /></Field>
        {(draft.eventType === "team_score" || draft.eventType === "break") && <Field label="Scorer"><Select value={draft.scorerPlayerId} onChange={(value) => setDraft((current) => ({ ...current, scorerPlayerId: value }))} options={playerOptions} labels={playerLabels} /></Field>}
        {(draft.eventType === "team_score" || draft.eventType === "break") && <Field label="Assist"><Select value={draft.assistPlayerId} onChange={(value) => setDraft((current) => ({ ...current, assistPlayerId: value }))} options={playerOptions} labels={playerLabels} /></Field>}
        {(draft.eventType === "team_score" || draft.eventType === "break" || draft.eventType === "block") && <Field label={draft.eventType === "block" ? "Block player" : "Block optional"}><Select value={draft.blockPlayerId} onChange={(value) => setDraft((current) => ({ ...current, blockPlayerId: value }))} options={playerOptions} labels={playerLabels} /></Field>}
        {draft.eventType === "turnover" && <Field label="Turnover player"><Select value={draft.turnoverPlayerId} onChange={(value) => setDraft((current) => ({ ...current, turnoverPlayerId: value }))} options={playerOptions} labels={playerLabels} /></Field>}
      </div>
      <Field label="Coach note">
        <textarea className={`${inputClass} mt-3 min-h-24`} maxLength={500} value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Point notes, sideline context, or tactical adjustment" />
      </Field>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={save} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm font-black text-cyan"><Save className="h-4 w-4" />{editingEvent ? "Update Event" : saveButtonLabel(draft.eventType)}</button>
        <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-bold"><RotateCcw className="h-4 w-4" />Reset fields</button>
      </div>
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="mb-3 text-lg font-black">Score Breakdown Timeline</div>
        <div className="grid gap-2">
          {gameEvents.map((event) => (
            <PointTimelineRow
              key={event.id}
              event={event}
              players={players}
              onEdit={() => edit(event)}
              onDelete={() => {
                if (window.confirm(`Delete event ${event.pointNo}?`)) {
                  deleteLineupPointEvent(event.id);
                  toast.success("Point event deleted.");
                }
              }}
            />
          ))}
          {!gameEvents.length && <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-silver-muted">No point events yet for Game {gameNo}.</div>}
        </div>
      </div>
    </section>
  );
}

function TournamentGameStatsPanel({ tournament, lineups, selected }: { tournament: Tournament; lineups: TeamLineup[]; selected: TournamentPlayer[] }) {
  const { data, saveGameStats } = useAppData();
  const [gameNo, setGameNo] = useState(1);
  const [lineupId, setLineupId] = useState(lineups[0]?.id ?? "");
  const lineup = lineups.find((item) => item.id === lineupId);
  const statPlayers = lineup ? lineup.players.map((entry) => ({ playerId: entry.playerId, role: entry.position })) : selected.map((entry) => ({ playerId: entry.playerId, role: entry.role }));
  const [drafts, setDrafts] = useState<Record<string, StatDraft>>({});

  useEffect(() => {
    const nextDrafts: Record<string, StatDraft> = {};
    statPlayers.forEach((entry) => {
      const existing = data.tournamentStats.find((stats) => stats.tournamentId === tournament.id && stats.playerId === entry.playerId && stats.gameNo === gameNo && (stats.teamLineupId ?? "") === (lineupId || ""));
      nextDrafts[entry.playerId] = statToDraft(existing);
    });
    setDrafts(nextDrafts);
  }, [data.tournamentStats, gameNo, lineupId, statPlayers.map((entry) => entry.playerId).join("|"), tournament.id]);

  const save = () => {
    const rows = statPlayers.map((entry) => {
      const draft = drafts[entry.playerId] ?? statToDraft();
      return {
        id: draft.id,
        playerId: entry.playerId,
        score: nonNegative(draft.score),
        assist: nonNegative(draft.assist),
        blocks: nonNegative(draft.blocks),
        turnovers: nonNegative(draft.turnovers),
        catches: nonNegative(draft.catches),
        drops: nonNegative(draft.drops),
        pointsPlayed: nonNegative(draft.pointsPlayed),
        plusMinus: Number(draft.plusMinus || 0),
        gamesPlayed: 1,
        note: draft.note,
      };
    });
    saveGameStats(tournament.id, gameNo, lineupId || null, rows);
    toast.success("Game stats saved.");
  };

  return (
    <div className="panel p-5">
      <SectionTitle step="Stats" title="Game Stats" detail="Choose a game and lineup, then save player stats together." action={<button onClick={save} className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm font-black text-cyan"><Save className="mr-2 inline h-4 w-4" />Save Game Stats</button>} />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Field label="Game number"><Select value={String(gameNo)} onChange={(value) => setGameNo(Number(value))} options={Array.from({ length: tournament.totalGames }, (_, index) => String(index + 1))} /></Field>
        <Field label="Lineup"><Select value={lineupId} onChange={setLineupId} options={["", ...lineups.map((item) => item.id)]} labels={{ "": "All selected players", ...Object.fromEntries(lineups.map((item) => [item.id, item.name])) }} /></Field>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {statPlayers.map((entry) => {
          const player = data.players.find((item) => item.id === entry.playerId);
          const draft = drafts[entry.playerId] ?? statToDraft();
          return player ? <GameStatCard key={entry.playerId} player={player} role={String(entry.role)} draft={draft} onChange={(next) => setDrafts((current) => ({ ...current, [entry.playerId]: next }))} /> : null;
        })}
        {!statPlayers.length && <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-silver-muted">Add tournament players or a lineup before entering stats.</div>}
      </div>
    </div>
  );
}

function TournamentSummaryPanel({ totals }: { totals: TournamentSummary }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MiniMetric label="Total goals" value={totals.lineScore} />
        <MiniMetric label="Total breaks" value={totals.breaks} />
        <MiniMetric label="Total assists" value={totals.assists} />
        <MiniMetric label="Total blocks" value={totals.blocks} />
        <MiniMetric label="Total turnovers" value={totals.turnovers} />
        <MiniMetric label="Points against" value={totals.pointsAgainst} />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <SummaryLeader title="Best lineup by goals" value={totals.bestScoreLineup} />
        <SummaryLeader title="Best lineup by breaks" value={totals.bestBreakLineup} />
        <SummaryLeader title="Highest turnover lineup" value={totals.highestTurnoverLineup} />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <PlayerSummaryList title="Player scoring summary" rows={totals.playerScores} />
        <PlayerSummaryList title="Player assist summary" rows={totals.playerAssists} />
        <PlayerSummaryList title="Player block summary" rows={totals.playerBlocks} />
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <LineupPerformanceTable rows={totals.lineupPerformance} />
        <PlayerPerformanceTable rows={totals.playerPerformance} />
      </div>
    </div>
  );
}

function LineupDraftEditor({ lineup, selectedPlayers, onChange, onDuplicate, onDelete, index }: { lineup: LineupDraft; selectedPlayers: Player[]; onChange: (lineup: LineupDraft) => void; onDuplicate: () => void; onDelete: () => void; index: number }) {
  const toggle = (player: Player, checked: boolean) => {
    if (!checked) {
      onChange({ ...lineup, players: lineup.players.filter((entry) => entry.playerId !== player.id) });
      return;
    }
    onChange({ ...lineup, players: [...lineup.players, { id: makeDraftId("lp"), playerId: player.id, position: player.position, lineOrder: lineup.players.length + 1 }] });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-3">
          <Field label={`Lineup ${index + 1} name`}><input className={inputClass} value={lineup.name} onChange={(event) => onChange({ ...lineup, name: event.target.value })} required /></Field>
          <Field label="Ratio"><Select value={lineup.ratio ?? "A"} onChange={(value) => onChange({ ...lineup, ratio: value as LineupRatio })} options={lineupRatios} labels={{ A: "Ratio A - male ratio", B: "Ratio B - female ratio" }} /></Field>
          <Field label="Notes"><input className={inputClass} value={lineup.notes ?? ""} onChange={(event) => onChange({ ...lineup, notes: event.target.value })} /></Field>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onDuplicate} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.045]" aria-label="Duplicate lineup"><Copy className="h-4 w-4" /></button>
          <button type="button" onClick={onDelete} className="grid h-11 w-11 place-items-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive" aria-label="Delete lineup"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {selectedPlayers.map((player) => {
          const entry = lineup.players.find((item) => item.playerId === player.id);
          return (
            <div key={player.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <label className="flex items-center gap-3 text-sm font-bold">
                <input type="checkbox" checked={Boolean(entry)} onChange={(event) => toggle(player, event.target.checked)} />
                <PlayerAvatar name={player.name} hue={player.avatarHue} size={36} />
                <span className="min-w-0 flex-1 truncate">{player.name}</span>
              </label>
              {entry && (
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_6rem]">
                  <Select value={String(entry.position)} onChange={(value) => onChange({ ...lineup, players: lineup.players.map((item) => (item.playerId === player.id ? { ...item, position: value as LineupPlayerRole } : item)) })} options={lineupRoles} />
                  <input className={inputClass} type="number" min={1} value={entry.lineOrder} onChange={(event) => onChange({ ...lineup, players: lineup.players.map((item) => (item.playerId === player.id ? { ...item, lineOrder: Math.max(1, Number(event.target.value)) } : item)) })} aria-label={`${player.name} line order`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayerPickCard({ player, selected, role, onToggle, onRoleChange }: { player: Player; selected: boolean; role?: TournamentRole; onToggle: (checked: boolean) => void; onRoleChange: (role: TournamentRole) => void }) {
  return (
    <div className={`rounded-2xl border p-3 ${selected ? "border-cyan/30 bg-cyan/10" : "border-white/10 bg-white/[0.035]"}`}>
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={selected} onChange={(event) => onToggle(event.target.checked)} />
        <PlayerAvatar name={player.name} hue={player.avatarHue} size={44} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-black">{player.name}</div>
          <div className="text-xs text-silver-muted">#{player.jersey} | {player.position}</div>
        </div>
      </div>
      {selected && <div className="mt-3"><Select value={role ?? "main player"} onChange={(value) => onRoleChange(value as TournamentRole)} options={tournamentRoles} /></div>}
    </div>
  );
}

function LineupCard({ lineup, players, tournamentName, pointEvents = [], onDuplicate, onDelete }: { lineup: TeamLineup; players: Player[]; tournamentName: string; pointEvents?: TournamentLineupPointEvent[]; onDuplicate?: () => void; onDelete?: () => void }) {
  const totals = pointEventTotals(pointEvents);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xl font-black">{lineup.name}</div>
            <RatioBadge ratio={lineup.ratio} />
          </div>
          <div className="text-xs text-silver-muted">{tournamentName} | {lineup.players.length} players</div>
          {lineup.notes && <p className="mt-2 text-sm text-silver-muted">{lineup.notes}</p>}
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/team-lineup/$lineupId/edit" params={{ lineupId: lineup.id }} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.045]" aria-label={`Edit ${lineup.name}`}><Pencil className="h-4 w-4" /></Link>
          {onDuplicate && <button onClick={onDuplicate} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.045]" aria-label={`Duplicate ${lineup.name}`}><Copy className="h-4 w-4" /></button>}
          {onDelete && <button onClick={onDelete} className="grid h-10 w-10 place-items-center rounded-xl border border-destructive/25 bg-destructive/10 text-destructive" aria-label={`Delete ${lineup.name}`}><Trash2 className="h-4 w-4" /></button>}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {[...lineup.players].sort((a, b) => a.lineOrder - b.lineOrder).map((entry) => {
          const player = players.find((item) => item.id === entry.playerId);
          return player ? <div key={entry.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="metric-nums text-cyan">#{entry.lineOrder}</div><div className="font-bold">{player.name}</div><div className="text-xs text-silver-muted">{entry.position}</div></div> : null;
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniMetric label="Score" value={totals.teamScore} />
        <MiniMetric label="Breaks" value={totals.breaks} />
        <MiniMetric label="Turns" value={totals.turnovers} />
        <MiniMetric label="Against" value={totals.pointsAgainst} />
      </div>
    </div>
  );
}

type StatDraft = {
  id?: string;
  score: string;
  assist: string;
  blocks: string;
  turnovers: string;
  catches: string;
  drops: string;
  pointsPlayed: string;
  plusMinus: string;
  note: string;
};

type PointEventDraft = {
  eventType: LineupPointEventType;
  scorerPlayerId: string;
  assistPlayerId: string;
  blockPlayerId: string;
  turnoverPlayerId: string;
  note: string;
};

const pointEventLabels: Record<LineupPointEventType, string> = {
  team_score: "Team Score",
  break: "Break",
  opponent_score: "Opponent Score",
  turnover: "Turnover",
  block: "Block",
  timeout: "Timeout",
  note: "Note",
};

function emptyPointEventDraft(): PointEventDraft {
  return {
    eventType: "team_score",
    scorerPlayerId: "",
    assistPlayerId: "",
    blockPlayerId: "",
    turnoverPlayerId: "",
    note: "",
  };
}

function pointEventToDraft(event: TournamentLineupPointEvent): PointEventDraft {
  return {
    eventType: event.eventType,
    scorerPlayerId: event.scorerPlayerId ?? "",
    assistPlayerId: event.assistPlayerId ?? "",
    blockPlayerId: event.blockPlayerId ?? "",
    turnoverPlayerId: event.turnoverPlayerId ?? "",
    note: event.note ?? "",
  };
}

function validatePointEventDraft(draft: PointEventDraft, lineup: TeamLineup) {
  if (!draft.eventType) return "Event type is required.";
  if (!lineup.players.length) return "Cannot save stats if lineup has no players.";
  if ((draft.eventType === "team_score" || draft.eventType === "break") && !draft.scorerPlayerId) return `Scorer is required for ${pointEventLabels[draft.eventType]}.`;
  if (draft.eventType === "turnover" && !draft.turnoverPlayerId) return "Turnover player is required.";
  if (draft.eventType === "block" && !draft.blockPlayerId) return "Block player is required.";
  if (draft.note.length > 500) return "Note cannot exceed 500 characters.";
  const lineupPlayerIds = new Set(lineup.players.map((player) => player.playerId));
  for (const [label, playerId] of [
    ["Scorer", draft.scorerPlayerId],
    ["Assist", draft.assistPlayerId],
    ["Block", draft.blockPlayerId],
    ["Turnover player", draft.turnoverPlayerId],
  ] as const) {
    if (playerId && !lineupPlayerIds.has(playerId)) return `${label} must be selected from this lineup.`;
  }
  return "";
}

function GameStatCard({ player, role, draft, onChange }: { player: Player; role: string; draft: StatDraft; onChange: (draft: StatDraft) => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-4 flex items-center gap-3">
        <PlayerAvatar name={player.name} hue={player.avatarHue} size={44} />
        <div>
          <div className="font-black">{player.name}</div>
          <div className="text-xs text-silver-muted">#{player.jersey} | {player.position} | {role}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatNumberField label="Goals" value={draft.score} onChange={(value) => onChange({ ...draft, score: value })} ariaLabel={`${player.name} goals`} />
        <StatNumberField label="Assists" value={draft.assist} onChange={(value) => onChange({ ...draft, assist: value })} ariaLabel={`${player.name} assists`} />
        <StatNumberField label="Blocks" value={draft.blocks} onChange={(value) => onChange({ ...draft, blocks: value })} ariaLabel={`${player.name} blocks`} />
        <StatNumberField label="Turnovers" value={draft.turnovers} onChange={(value) => onChange({ ...draft, turnovers: value })} ariaLabel={`${player.name} turnovers`} />
        <StatNumberField label="Catches" value={draft.catches} onChange={(value) => onChange({ ...draft, catches: value })} ariaLabel={`${player.name} catches`} />
        <StatNumberField label="Drops" value={draft.drops} onChange={(value) => onChange({ ...draft, drops: value })} ariaLabel={`${player.name} drops`} />
        <StatNumberField label="Points" value={draft.pointsPlayed} onChange={(value) => onChange({ ...draft, pointsPlayed: value })} ariaLabel={`${player.name} points played`} />
        <StatNumberField label="+/-" value={draft.plusMinus} onChange={(value) => onChange({ ...draft, plusMinus: value })} ariaLabel={`${player.name} plus minus`} min="-99" />
      </div>
      <label className="mt-3 grid gap-1.5 text-xs font-bold text-silver-muted">
        Note
        <input className={inputClass} value={draft.note} onChange={(event) => onChange({ ...draft, note: event.target.value })} placeholder="Short game note" />
      </label>
    </div>
  );
}

function PointTimelineRow({ event, players, lineupName, compact = false, onEdit, onDelete }: { event: TournamentLineupPointEvent; players: Player[]; lineupName?: string; compact?: boolean; onEdit?: () => void; onDelete?: () => void }) {
  const scorer = event.scorerPlayerId ? players.find((player) => player.id === event.scorerPlayerId) : undefined;
  const assist = event.assistPlayerId ? players.find((player) => player.id === event.assistPlayerId) : undefined;
  const block = event.blockPlayerId ? players.find((player) => player.id === event.blockPlayerId) : undefined;
  const turnover = event.turnoverPlayerId ? players.find((player) => player.id === event.turnoverPlayerId) : undefined;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="metric-nums text-cyan">#{event.eventOrder || event.pointNo}</span>
            <StatusBadge tone="silver">Game {event.gameNo}</StatusBadge>
            <StatusBadge tone={event.eventType === "team_score" || event.eventType === "break" ? "green" : event.eventType === "opponent_score" ? "red" : "silver"}>{pointEventLabels[event.eventType]}</StatusBadge>
            <span className="font-black">YM {event.teamScoreAfter} - {event.opponentScoreAfter} Opponent</span>
          </div>
          <div className="mt-2 text-sm text-silver-muted">{lineupName ? `${lineupName}: ` : ""}{pointEventDescription(event, scorer?.name, assist?.name, block?.name, turnover?.name)}</div>
          {event.note && <p className="mt-2 text-sm leading-6 text-silver-muted">{event.note}</p>}
        </div>
        {!compact && (onEdit || onDelete) && (
          <div className="flex shrink-0 gap-2">
            {onEdit && <button onClick={onEdit} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.045]" aria-label={`Edit event ${event.pointNo}`}><Pencil className="h-4 w-4" /></button>}
            {onDelete && <button onClick={onDelete} className="grid h-9 w-9 place-items-center rounded-xl border border-destructive/25 bg-destructive/10 text-destructive" aria-label={`Delete event ${event.pointNo}`}><Trash2 className="h-4 w-4" /></button>}
          </div>
        )}
      </div>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <section className="machine-panel mb-5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="machine-section-label mb-3">{eyebrow}</div>
          <h2 className="text-3xl font-black sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-[62ch] text-sm leading-6 text-silver-muted">{description}</p>
        </div>
        {action}
      </div>
    </section>
  );
}

function SectionTitle({ step, title, detail, action }: { step: string; title: string; detail: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-cyan">{step}</div>
        <div className="mt-1 text-2xl font-black">{title}</div>
        <p className="mt-1 text-sm leading-6 text-silver-muted">{detail}</p>
      </div>
      {action}
    </div>
  );
}

function FormShell({ title, onSubmit, children }: { title: string; onSubmit: (event: React.FormEvent) => void; children: React.ReactNode }) {
  return (
    <form onSubmit={onSubmit} className="machine-panel mx-auto grid max-w-4xl gap-4 p-5 sm:grid-cols-2 sm:p-6">
      <div className="sm:col-span-2"><h2 className="text-3xl font-black">{title}</h2></div>
      {children}
      <div className="flex gap-3 sm:col-span-2">
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-5 py-3 text-sm font-black text-cyan glow-cyan"><Save className="h-4 w-4" />Save</button>
        <Link to="/dashboard/team-lineup" className="rounded-xl border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-bold">Cancel</Link>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-semibold text-silver-muted">{label}{children}</label>;
}

function TextField({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <Field label={label}>
      <input className={inputClass} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </Field>
  );
}

function Select({ value, onChange, options, labels }: { value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) {
  return (
    <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option} value={option} className="bg-surface-2 text-foreground">{labels?.[option] ?? option}</option>)}
    </select>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="machine-input flex items-center gap-2 px-3">
      <Search className="h-4 w-4 text-silver-muted" />
      <input className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-silver-muted" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function CheckboxGrid({ label, items, selected, onChange }: { label: string; items: { id: string; label: string }[]; selected: string[]; onChange: (ids: string[]) => void }) {
  return (
    <div className="grid gap-2 sm:col-span-2">
      <div className="text-sm font-semibold text-silver-muted">{label}</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-sm">
            <input type="checkbox" checked={selected.includes(item.id)} onChange={(event) => onChange(event.target.checked ? [...selected, item.id] : selected.filter((id) => id !== item.id))} />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function PrimaryLink({ to, params, label, icon: Icon }: { to: string; params?: Record<string, string>; label: string; icon: typeof Plus }) {
  return <Link to={to} params={params} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-5 py-3 text-sm font-black text-cyan glow-cyan"><Icon className="h-4 w-4" />{label}</Link>;
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-silver-muted">{label}</div><div className="mt-1 truncate text-lg font-black text-silver">{value}</div></div>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm"><span className="text-silver-muted">{label}</span><span className="text-right font-black">{value}</span></div>;
}

function StatNumberField({ label, value, onChange, ariaLabel, min = "0" }: { label: string; value: string; onChange: (value: string) => void; ariaLabel: string; min?: string }) {
  return <label className="grid gap-1.5 text-xs font-bold text-silver-muted">{label}<input className={`${inputClass} metric-nums font-bold text-foreground`} type="number" min={min} value={value} onChange={(event) => onChange(event.target.value)} aria-label={ariaLabel} /></label>;
}

function SummaryLeader({ title, value }: { title: string; value: string }) {
  return <div className="panel p-5"><div className="text-sm font-black text-cyan">{title}</div><div className="mt-2 text-2xl font-black">{value}</div></div>;
}

function PlayerSummaryList({ title, rows }: { title: string; rows: { playerId: string; name: string; count: number }[] }) {
  return (
    <div className="panel p-5">
      <div className="text-sm font-black text-cyan">{title}</div>
      <div className="mt-3 grid gap-2">
        {rows.map((row) => (
          <div key={row.playerId} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm">
            <span className="min-w-0 truncate font-bold">{row.name}</span>
            <span className="metric-nums text-cyan">{row.count}</span>
          </div>
        ))}
        {!rows.length && <div className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-silver-muted">No actions logged yet.</div>}
      </div>
    </div>
  );
}

function LineupPerformanceTable({ rows }: { rows: TournamentSummary["lineupPerformance"] }) {
  return (
    <div className="panel p-5">
      <div className="text-sm font-black text-cyan">Lineup performance</div>
      <div className="mt-3 grid gap-2">
        {rows.map((row) => (
          <div key={row.lineupId} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-black">{row.name}</div>
              <RatioBadge ratio={row.ratio} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              <MiniMetric label="Goals" value={row.goals} />
              <MiniMetric label="Breaks" value={row.breaks} />
              <MiniMetric label="Assists" value={row.assists} />
              <MiniMetric label="Blocks" value={row.blocks} />
              <MiniMetric label="Turns" value={row.turnovers} />
              <MiniMetric label="Against" value={row.pointsAgainst} />
            </div>
          </div>
        ))}
        {!rows.length && <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-silver-muted">No lineup events yet.</div>}
      </div>
    </div>
  );
}

function PlayerPerformanceTable({ rows }: { rows: TournamentSummary["playerPerformance"] }) {
  return (
    <div className="panel p-5">
      <div className="text-sm font-black text-cyan">Player performance</div>
      <div className="mt-3 grid gap-2">
        {rows.map((row) => (
          <div key={row.playerId} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <div className="font-black">{row.name}</div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              <MiniMetric label="Goals" value={row.goals} />
              <MiniMetric label="Assists" value={row.assists} />
              <MiniMetric label="Blocks" value={row.blocks} />
              <MiniMetric label="Turns" value={row.turnovers} />
            </div>
          </div>
        ))}
        {!rows.length && <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-silver-muted">No player actions yet.</div>}
      </div>
    </div>
  );
}

function RatioBadge({ ratio }: { ratio?: LineupRatio }) {
  const value = ratio === "B" ? "B" : "A";
  return <StatusBadge tone={value === "A" ? "cyan" : "silver"}>Ratio {value}</StatusBadge>;
}

function MissingDashboard({ title }: { title: string }) {
  return <DashboardLayout title={title}><div className="panel p-5 text-sm text-silver-muted">{title}</div></DashboardLayout>;
}

function statusTone(status: TournamentStatus) {
  if (status === "Completed") return "green";
  if (status === "Upcoming") return "cyan";
  if (status === "Cancelled") return "red";
  return "silver";
}

function validateTournament(form: Omit<Tournament, "id">, selectedIds: string[], lineups: LineupDraft[]) {
  if (!form.name.trim()) return "Name is required.";
  if (!form.location.trim()) return "Location is required.";
  if (!form.eventType) return "Event type is required.";
  if (!form.start) return "Start date is required.";
  if (!form.end) return "End date is required.";
  if (form.end < form.start) return "End date cannot be before start date.";
  if (Number(form.totalGames) < 1) return "Total games must be at least 1.";
  if (lineups.some((lineup) => !lineup.name.trim())) return "Lineup name is required.";
  if (lineups.some((lineup) => lineup.ratio !== "A" && lineup.ratio !== "B")) return "Lineup ratio is required.";
  if (lineups.some((lineup) => lineup.players.length && !selectedIds.length)) return "Select at least 1 player before creating lineup.";
  return "";
}

function statToDraft(stats?: TournamentStats): StatDraft {
  return {
    id: stats?.id,
    score: String(stats?.score ?? 0),
    assist: String(stats?.assist ?? 0),
    blocks: String(stats?.blocks ?? 0),
    turnovers: String(stats?.turnovers ?? 0),
    catches: String(stats?.catches ?? 0),
    drops: String(stats?.drops ?? 0),
    pointsPlayed: String(stats?.pointsPlayed ?? stats?.gamesPlayed ?? 0),
    plusMinus: String(stats?.plusMinus ?? 0),
    note: stats?.note ?? "",
  };
}

function nonNegative(value: string) {
  return Math.max(0, Number(value || 0));
}

function sortPointEvents(events: TournamentLineupPointEvent[]) {
  return [...events].sort((a, b) => (a.eventOrder || a.pointNo) - (b.eventOrder || b.pointNo));
}

type TournamentSummary = {
  lineScore: number;
  opponentScore: number;
  pointsAgainst: number;
  breaks: number;
  assists: number;
  blocks: number;
  turnovers: number;
  bestScoreLineup: string;
  bestBreakLineup: string;
  highestTurnoverLineup: string;
  playerScores: { playerId: string; name: string; count: number }[];
  playerAssists: { playerId: string; name: string; count: number }[];
  playerBlocks: { playerId: string; name: string; count: number }[];
  lineupPerformance: { lineupId: string; name: string; ratio: LineupRatio; goals: number; assists: number; blocks: number; breaks: number; turnovers: number; pointsAgainst: number }[];
  playerPerformance: { playerId: string; name: string; goals: number; assists: number; blocks: number; turnovers: number }[];
};

function pointEventTotals(events: TournamentLineupPointEvent[]) {
  const sorted = sortPointEvents(events);
  const latest = sorted.at(-1);
  const gameCount = new Set(sorted.map((row) => row.gameNo)).size;
  const scoringEvents = sorted.filter((event) => event.eventType === "team_score" || event.eventType === "break");
  const teamScore = gameCount > 1 ? scoringEvents.length : latest?.teamScoreAfter ?? 0;
  const opponentScore = gameCount > 1 ? sorted.filter((event) => event.eventType === "opponent_score").length : latest?.opponentScoreAfter ?? 0;
  return {
    games: gameCount,
    teamScore,
    opponentScore,
    pointsAgainst: opponentScore,
    breaks: sorted.filter((event) => event.eventType === "break").length,
    assists: scoringEvents.filter((event) => event.assistPlayerId).length,
    turnovers: sorted.filter((event) => event.eventType === "turnover").length,
    blocks: sorted.filter((event) => event.eventType === "block").length + scoringEvents.filter((event) => event.blockPlayerId).length,
    goals: scoringEvents.length,
  };
}

function calculatePointTournamentTotals(events: TournamentLineupPointEvent[], lineups: TeamLineup[], players: Player[]): TournamentSummary {
  const byLineup = new Map<string, ReturnType<typeof pointEventTotals>>();
  lineups.forEach((lineup) => byLineup.set(lineup.id, pointEventTotals(events.filter((row) => row.teamLineupId === lineup.id))));
  const lineupLeader = (key: "teamScore" | "breaks" | "turnovers", empty = "No lineup stats") => {
    const [lineupId, total] = [...byLineup.entries()].sort((a, b) => b[1][key] - a[1][key])[0] ?? [];
    const lineup = lineups.find((item) => item.id === lineupId);
    return lineup && total[key] > 0 ? `${lineup.name} (${total[key]})` : empty;
  };
  const playerRows = (key: "scorerPlayerId" | "assistPlayerId" | "blockPlayerId") => {
    const counts = new Map<string, number>();
    events.forEach((row) => {
      if ((key === "scorerPlayerId" || key === "assistPlayerId") && row.eventType !== "team_score" && row.eventType !== "break") return;
      if (key === "blockPlayerId" && row.eventType !== "block" && row.eventType !== "team_score" && row.eventType !== "break") return;
      const playerId = row[key];
      if (playerId) counts.set(playerId, (counts.get(playerId) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([playerId, count]) => ({ playerId, name: players.find((player) => player.id === playerId)?.name ?? "Unknown player", count }))
      .sort((a, b) => b.count - a.count);
  };
  const lineupPerformance = lineups.map((lineup) => {
    const lineupEvents = events.filter((event) => event.teamLineupId === lineup.id);
    const scoringEvents = lineupEvents.filter((event) => event.eventType === "team_score" || event.eventType === "break");
    return {
      lineupId: lineup.id,
      name: lineup.name,
      ratio: lineup.ratio,
      goals: scoringEvents.length,
      assists: scoringEvents.filter((event) => event.assistPlayerId).length,
      blocks: lineupEvents.filter((event) => event.eventType === "block").length + scoringEvents.filter((event) => event.blockPlayerId).length,
      breaks: lineupEvents.filter((event) => event.eventType === "break").length,
      turnovers: lineupEvents.filter((event) => event.eventType === "turnover").length,
      pointsAgainst: lineupEvents.filter((event) => event.eventType === "opponent_score").length,
    };
  });
  const playerIds = new Set<string>();
  events.forEach((event) => {
    if (event.scorerPlayerId) playerIds.add(event.scorerPlayerId);
    if (event.assistPlayerId) playerIds.add(event.assistPlayerId);
    if (event.blockPlayerId) playerIds.add(event.blockPlayerId);
    if (event.turnoverPlayerId) playerIds.add(event.turnoverPlayerId);
  });
  const playerPerformance = [...playerIds].map((playerId) => {
    const player = players.find((item) => item.id === playerId);
    return {
      playerId,
      name: player?.name ?? "Unknown player",
      goals: events.filter((event) => (event.eventType === "team_score" || event.eventType === "break") && event.scorerPlayerId === playerId).length,
      assists: events.filter((event) => (event.eventType === "team_score" || event.eventType === "break") && event.assistPlayerId === playerId).length,
      blocks: events.filter((event) => (event.eventType === "block" && event.blockPlayerId === playerId) || ((event.eventType === "team_score" || event.eventType === "break") && event.blockPlayerId === playerId)).length,
      turnovers: events.filter((event) => event.turnoverPlayerId === playerId).length,
    };
  }).sort((a, b) => (b.goals + b.assists + b.blocks) - (a.goals + a.assists + a.blocks));
  const scoringEvents = events.filter((event) => event.eventType === "team_score" || event.eventType === "break");
  return {
    lineScore: scoringEvents.length,
    opponentScore: events.filter((event) => event.eventType === "opponent_score").length,
    pointsAgainst: events.filter((event) => event.eventType === "opponent_score").length,
    breaks: events.filter((event) => event.eventType === "break").length,
    assists: scoringEvents.filter((event) => event.assistPlayerId).length,
    blocks: events.filter((event) => event.eventType === "block").length + scoringEvents.filter((event) => event.blockPlayerId).length,
    turnovers: events.filter((event) => event.eventType === "turnover").length,
    bestScoreLineup: lineupLeader("teamScore"),
    bestBreakLineup: lineupLeader("breaks"),
    highestTurnoverLineup: lineupLeader("turnovers"),
    playerScores: playerRows("scorerPlayerId"),
    playerAssists: playerRows("assistPlayerId"),
    playerBlocks: playerRows("blockPlayerId"),
    lineupPerformance,
    playerPerformance,
  };
}

function previousScoreBeforeEvent(events: TournamentLineupPointEvent[], eventId: string) {
  const index = events.findIndex((event) => event.id === eventId);
  return pointEventTotals(index > 0 ? events.slice(0, index) : []);
}

function nextScoreForEvent(eventType: LineupPointEventType, previous: ReturnType<typeof pointEventTotals>) {
  return {
    teamScore: previous.teamScore + (eventType === "team_score" || eventType === "break" ? 1 : 0),
    opponentScore: previous.opponentScore + (eventType === "opponent_score" ? 1 : 0),
  };
}

function saveButtonLabel(eventType: LineupPointEventType) {
  if (eventType === "break") return "Save Break";
  if (eventType === "opponent_score") return "Save Opponent Point";
  if (eventType === "turnover") return "Save Turnover";
  if (eventType === "block") return "Save Block";
  if (eventType === "timeout") return "Save Timeout";
  if (eventType === "note") return "Save Note";
  return "Save Point";
}

function pointEventSaveLabel(eventType: LineupPointEventType) {
  if (eventType === "break") return "Break saved.";
  if (eventType === "opponent_score") return "Opponent point saved.";
  if (eventType === "turnover") return "Turnover saved.";
  if (eventType === "block") return "Block saved.";
  if (eventType === "timeout") return "Timeout saved.";
  if (eventType === "note") return "Note saved.";
  return "Point saved.";
}

function pointEventDescription(event: TournamentLineupPointEvent, scorer?: string, assist?: string, block?: string, turnover?: string) {
  if (event.eventType === "team_score") {
    const parts = [`${scorer ?? "Unknown player"} scored`];
    if (assist) parts.push(`assisted by ${assist}`);
    if (block) parts.push(`block by ${block}`);
    return parts.join(", ");
  }
  if (event.eventType === "break") {
    const parts = [`${scorer ?? "Unknown player"} scored a break`];
    if (assist) parts.push(`assisted by ${assist}`);
    if (block) parts.push(`block by ${block}`);
    return parts.join(", ");
  }
  if (event.eventType === "opponent_score") return "Opponent scored";
  if (event.eventType === "turnover") return `${turnover ?? "Unknown player"} turnover`;
  if (event.eventType === "block") return `${block ?? "Unknown player"} block`;
  if (event.eventType === "timeout") return "Timeout logged";
  return "Coach note";
}

function sum<T extends object>(rows: T[], key: keyof T) {
  return rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
}
