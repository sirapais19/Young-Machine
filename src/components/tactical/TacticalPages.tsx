import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Arrow, Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import { ArrowLeft, Disc3, Eraser, Eye, FilePenLine, MousePointer2, MoveRight, Pause, Play, Plus, RotateCcw, Save, Send, SkipBack, SkipForward, Trash2, Users2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import {
  createTacticalBoard,
  deleteTacticalBoard,
  emptyBoardData,
  getSharedTacticalBoardById,
  getTacticalBoardById,
  getTacticalBoards,
  updateTacticalBoard,
  type TacticalBoard,
  type TacticalBoardData,
  type TacticalSequenceStep,
  type TacticalFieldType,
  type TacticalStatus,
  type TacticalVisibility,
  type TacticalArrowToken,
} from "@/services/tacticalService";
import type { Player } from "@/types/app";

const fieldTypes: TacticalFieldType[] = ["full_field", "half_field", "endzone", "vertical_stack", "horizontal_stack"];
const visibilityOptions: TacticalVisibility[] = ["coach_only", "players", "public"];
const statusOptions: TacticalStatus[] = ["draft", "published"];
const boardWidth = 1000;
const boardHeight = 420;
type ToolMode = "select" | "add_player" | "add_disc" | "draw_movement" | "draw_pass" | "erase";
type Selection = { type: "player" | "disc" | "arrow"; id: string } | null;
type DraftArrow = { type: "movement" | "pass"; fromX: number; fromY: number } | null;
type SpeedMode = "slow" | "normal" | "fast";

const speedDurations: Record<SpeedMode, number> = {
  slow: 1400,
  normal: 900,
  fast: 500,
};

export function TacticalListPage() {
  const { data } = useAppData();
  const [boards, setBoards] = useState<TacticalBoard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBoards = useCallback(async () => {
    setLoading(true);
    try {
      setBoards(await getTacticalBoards());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load tactical boards.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  return (
    <DashboardLayout title="Tactical Lab">
      <TacticalHeader
        eyebrow="Tactical Lab"
        title="Digital frisbee tactics."
        description="Create tactical boards for training sessions, tournaments, player preparation, and match review."
        action={<PrimaryActionLink to="/dashboard/tactical/create" label="Create Tactical Board" icon={Plus} />}
      />

      {loading ? (
        <div className="machine-panel p-5 text-sm text-silver-muted">Loading tactical boards...</div>
      ) : boards.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {boards.map((board) => (
            <TacticalBoardCard
              key={board.id}
              board={board}
              trainingTitle={data.trainingSessions.find((item) => item.id === board.training_session_id)?.title}
              tournamentName={data.tournaments.find((item) => item.id === board.tournament_id)?.name}
              onDelete={async () => {
                if (!window.confirm(`Delete ${board.title}? This removes the tactical board.`)) return;
                await deleteTacticalBoard(board.id);
                toast.success("Tactical board deleted.");
                await loadBoards();
              }}
            />
          ))}
        </div>
      ) : (
        <div className="machine-panel p-6">
          <div className="text-xl font-black">No tactical boards yet.</div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-silver-muted">Start with a field layout, add player tokens, place the disc, and publish the board for players when it is ready.</p>
          <PrimaryActionLink to="/dashboard/tactical/create" label="Create Tactical Board" icon={Plus} className="mt-5" />
        </div>
      )}
    </DashboardLayout>
  );
}

export function TacticalCreatePage() {
  return <TacticalFormPage mode="create" />;
}

export function TacticalEditPage({ tacticalId }: { tacticalId: string }) {
  return <TacticalFormPage mode="edit" tacticalId={tacticalId} />;
}

export function TacticalDetailPage({ tacticalId }: { tacticalId: string }) {
  return <TacticalReadOnlyPage tacticalId={tacticalId} scope="dashboard" />;
}

export function PlayerTacticsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === "/player/tactics" ? <PlayerTacticsListPage /> : <Outlet />;
}

function PlayerTacticsListPage() {
  const { data } = useAppData();
  const [boards, setBoards] = useState<TacticalBoard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getTacticalBoards()
      .then((items) => {
        if (active) setBoards(items.filter((board) => board.status === "published" && (board.visibility === "players" || board.visibility === "public")));
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load tactics."))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <PlayerLayout title="My Tactics">
      <section className="mb-4">
        <div className="machine-section-label">Player tactics</div>
        <h1 className="mt-2 text-3xl font-black">My Tactics</h1>
        <p className="mt-2 text-sm leading-6 text-silver-muted">Read-only tactical boards shared by the coaching staff.</p>
      </section>

      {loading ? (
        <div className="machine-panel p-5 text-sm text-silver-muted">Loading tactics...</div>
      ) : boards.length ? (
        <div className="grid gap-3">
          {boards.map((board) => (
            <Link
              key={board.id}
              to="/player/tactics/$tacticalId"
              params={{ tacticalId: board.id }}
              className="machine-panel group block cursor-pointer p-4 transition duration-200 hover:-translate-y-0.5 hover:border-cyan/30 hover:bg-cyan/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-lg font-black">{board.title}</div>
                  {board.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-silver-muted">{board.description}</p>}
                  <div className="mt-1 text-xs text-silver-muted">{fieldLabel(board.field_type)} - {linkedLabel(board, data)}</div>
                </div>
                <StatusBadge tone={board.status === "published" ? "green" : "silver"}>{statusLabel(board.status)}</StatusBadge>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan/25 bg-cyan/10 px-3 py-2 text-xs font-black text-cyan transition group-hover:border-cyan/45 group-hover:bg-cyan/15">
                <Eye className="h-4 w-4" />
                View tactic
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="machine-panel p-5 text-sm text-silver-muted">No player tactics have been shared yet.</div>
      )}
    </PlayerLayout>
  );
}

export function PlayerTacticalDetailPage({ tacticalId }: { tacticalId: string }) {
  return <TacticalReadOnlyPage tacticalId={tacticalId} scope="player" />;
}

function TacticalFormPage({ mode, tacticalId }: { mode: "create" | "edit"; tacticalId?: string }) {
  const navigate = useNavigate();
  const { data } = useAppData();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fieldType, setFieldType] = useState<TacticalFieldType>("full_field");
  const [visibility, setVisibility] = useState<TacticalVisibility>("coach_only");
  const [status, setStatus] = useState<TacticalStatus>("draft");
  const [trainingSessionId, setTrainingSessionId] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [boardData, setBoardData] = useState<TacticalBoardData>(emptyBoardData);

  useEffect(() => {
    if (mode !== "edit" || !tacticalId) return;
    let active = true;
    void getTacticalBoardById(tacticalId)
      .then((board) => {
        if (!active) return;
        if (!board) {
          toast.error("Tactical board not found.");
          navigate({ to: "/dashboard/tactical" });
          return;
        }
        setTitle(board.title);
        setDescription(board.description ?? "");
        setFieldType(board.field_type);
        setVisibility(board.visibility);
        setStatus(board.status);
        setTrainingSessionId(board.training_session_id ?? "");
        setTournamentId(board.tournament_id ?? "");
        setBoardData(board.board_data);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load tactical board."))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [mode, navigate, tacticalId]);

  const saveBoard = async () => {
    if (!title.trim()) {
      toast.error("Add a tactical board title first.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        field_type: fieldType,
        created_by: currentUser?.id ?? null,
        training_session_id: trainingSessionId || null,
        tournament_id: tournamentId || null,
        visibility,
        status,
        board_data: boardData,
      };

      const board = mode === "create" ? await createTacticalBoard(payload) : await updateTacticalBoard(tacticalId as string, payload);
      toast.success(mode === "create" ? "Tactical board created." : "Tactical board saved.");
      navigate({ to: "/dashboard/tactical/$tacticalId", params: { tacticalId: board.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save tactical board.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Tactical Lab">
        <div className="machine-panel p-5 text-sm text-silver-muted">Loading tactical board...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={mode === "create" ? "Create Tactic" : "Edit Tactic"}>
      <TacticalHeader
        eyebrow="Tactical editor"
        title={mode === "create" ? "Create Tactical Board" : "Edit Tactical Board"}
        description="Build a draggable field board, save coach notes, and choose who can read it."
        action={<button onClick={saveBoard} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm font-black text-cyan glow-cyan disabled:opacity-60"><Save className="h-4 w-4" />{saving ? "Saving..." : "Save"}</button>}
      />

      <div className="grid gap-4 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <section className="machine-panel p-5">
          <div className="mb-4 text-xl font-black">Board setup</div>
          <div className="grid gap-4">
            <TacticalField label="Title">
              <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Example: Pull play - sideline trap" />
            </TacticalField>
            <TacticalField label="Description">
              <textarea className={`${inputClass} min-h-24`} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short tactical summary" />
            </TacticalField>
            <TacticalField label="Field type">
              <select className={inputClass} value={fieldType} onChange={(event) => setFieldType(event.target.value as TacticalFieldType)}>
                {fieldTypes.map((type) => <option key={type} value={type}>{fieldLabel(type)}</option>)}
              </select>
            </TacticalField>
            <TacticalField label="Visibility">
              <select className={inputClass} value={visibility} onChange={(event) => setVisibility(event.target.value as TacticalVisibility)}>
                {visibilityOptions.map((option) => <option key={option} value={option}>{visibilityLabel(option)}</option>)}
              </select>
            </TacticalField>
            <TacticalField label="Status">
              <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value as TacticalStatus)}>
                {statusOptions.map((option) => <option key={option} value={option}>{statusLabel(option)}</option>)}
              </select>
            </TacticalField>
            <TacticalField label="Training session">
              <select className={inputClass} value={trainingSessionId} onChange={(event) => setTrainingSessionId(event.target.value)}>
                <option value="">No training link</option>
                {data.trainingSessions.map((session) => <option key={session.id} value={session.id}>{session.title}</option>)}
              </select>
            </TacticalField>
            <TacticalField label="Tournament">
              <select className={inputClass} value={tournamentId} onChange={(event) => setTournamentId(event.target.value)}>
                <option value="">No tournament link</option>
                {data.tournaments.map((tournament) => <option key={tournament.id} value={tournament.id}>{tournament.name}</option>)}
              </select>
            </TacticalField>
          </div>
        </section>

        <TacticalBoardEditor data={boardData} players={data.players} onChange={setBoardData} onSave={saveBoard} saving={saving} editable />
      </div>
    </DashboardLayout>
  );
}

function TacticalReadOnlyPage({ tacticalId, scope }: { tacticalId: string; scope: "dashboard" | "player" }) {
  const { data } = useAppData();
  const navigate = useNavigate();
  const [board, setBoard] = useState<TacticalBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const Layout = scope === "dashboard" ? DashboardLayout : PlayerLayout;
  const title = scope === "dashboard" ? "Tactical Lab" : "Tactic";

  useEffect(() => {
    let active = true;
    const request = scope === "player" ? getSharedTacticalBoardById(tacticalId) : getTacticalBoardById(tacticalId);
    void request
      .then((item) => {
        if (!active) return;
        setBoard(item);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load tactical board."))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [scope, tacticalId]);

  if (loading) {
    return (
      <Layout title={title}>
        <div className="machine-panel p-5 text-sm text-silver-muted">Loading tactical board...</div>
      </Layout>
    );
  }

  if (!board) {
    return (
      <Layout title={title}>
        <div className="machine-panel p-5">
          <div className="machine-section-label">TACTIC NOT AVAILABLE</div>
          <div className="mt-2 text-xl font-black">{scope === "player" ? "Tactic not available." : "Tactical board not found."}</div>
          <p className="mt-2 text-sm text-silver-muted">
            {scope === "player" ? "This tactical board is not shared with players or no longer exists." : "This board may have been removed."}
          </p>
          <Link
            to={scope === "player" ? "/player/tactics" : "/dashboard/tactical"}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-black"
          >
            <ArrowLeft className="h-4 w-4" />
            {scope === "player" ? "Back to My Tactics" : "Back to Tactical Lab"}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={board.title}>
      <section className="machine-panel mb-4 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="machine-section-label">Tactical board</div>
            <h1 className="mt-2 text-3xl font-black">{board.title}</h1>
            {board.description && <p className="mt-2 max-w-3xl text-sm leading-6 text-silver-muted">{board.description}</p>}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <StatusBadge tone="cyan">{fieldLabel(board.field_type)}</StatusBadge>
              <StatusBadge tone={board.visibility === "coach_only" ? "silver" : "green"}>{visibilityLabel(board.visibility)}</StatusBadge>
              <StatusBadge tone={board.status === "published" ? "green" : "silver"}>{statusLabel(board.status)}</StatusBadge>
              <StatusBadge tone="silver">{linkedLabel(board, data)}</StatusBadge>
            </div>
          </div>
          {scope === "player" ? (
            <Link to="/player/tactics" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-black">
              <ArrowLeft className="h-4 w-4" />
              Back to My Tactics
            </Link>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Link to="/dashboard/tactical" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-black">
                Back
              </Link>
              <Link to="/dashboard/tactical/$tacticalId/edit" params={{ tacticalId: board.id }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-black">
                <FilePenLine className="h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={async () => {
                  if (!window.confirm(`Delete ${board.title}? This removes the tactical board.`)) return;
                  await deleteTacticalBoard(board.id);
                  toast.success("Tactical board deleted.");
                  navigate({ to: "/dashboard/tactical" });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-black text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </section>

      <TacticalBoardEditor data={board.board_data} players={data.players} onChange={() => undefined} editable={false} />
    </Layout>
  );
}

function TacticalBoardEditor({
  data,
  players,
  onChange,
  onSave,
  saving,
  editable,
}: {
  data: TacticalBoardData;
  players: Player[];
  onChange: (data: TacticalBoardData) => void;
  onSave?: () => void;
  saving?: boolean;
  editable: boolean;
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id ?? "");
  const [tool, setTool] = useState<ToolMode>("select");
  const [selected, setSelected] = useState<Selection>(null);
  const [draftArrow, setDraftArrow] = useState<DraftArrow>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewStep, setPreviewStep] = useState<TacticalSequenceStep | null>(null);
  const [speed, setSpeed] = useState<SpeedMode>("normal");
  const frameRef = useRef<number | null>(null);

  const steps = data.sequence.steps.length ? data.sequence.steps : [makeStepFromBoard(data, 0)];
  const safeStepIndex = Math.min(stepIndex, steps.length - 1);
  const currentStep = steps[safeStepIndex];
  const canvasStep = previewStep ?? currentStep;

  useEffect(() => {
    if (!selectedPlayerId && players[0]) setSelectedPlayerId(players[0].id);
  }, [players, selectedPlayerId]);

  useEffect(() => {
    if (stepIndex > steps.length - 1) setStepIndex(Math.max(0, steps.length - 1));
  }, [stepIndex, steps.length]);

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const commitStep = (step: TacticalSequenceStep) => {
    const nextSteps = steps.map((item, index) => (index === safeStepIndex ? step : item));
    onChange(syncBoardWithSequence(data, nextSteps, safeStepIndex, data.sequence.durationMs));
  };

  const changeCurrentStep = (stepData: TacticalBoardData) => {
    commitStep({
      ...currentStep,
      players: stepData.players,
      disc: stepData.disc,
      arrows: stepData.arrows,
    });
  };

  const updateStepMeta = (patch: Partial<Pick<TacticalSequenceStep, "title" | "notes">>) => {
    commitStep({ ...currentStep, ...patch });
  };

  const addPlayer = () => {
    const source = players.find((player) => player.id === selectedPlayerId);
    if (!source) {
      toast.error("Select a player first.");
      return;
    }
    if (currentStep.players.some((player) => player.playerId === source.id) && !window.confirm(`${source.name} is already on this step. Add another token?`)) {
      return;
    }
    const tokenIndex = currentStep.players.length + 1;
    const token = {
      id: `token-${Date.now()}`,
      playerId: source.id,
      name: source.name,
      jersey: String(source.jersey),
      position: source.position,
      x: clamp(430 + (tokenIndex % 4) * 28, 44, boardWidth - 44),
      y: clamp(190 + Math.floor(tokenIndex / 4) * 42, 48, boardHeight - 62),
    };
    commitStep({ ...currentStep, players: [...currentStep.players, token] });
    setSelected({ type: "player", id: token.id });
    setTool("select");
  };

  const addDisc = () => {
    const disc = currentStep.disc ?? { id: "disc-1", x: boardWidth / 2, y: boardHeight / 2 };
    commitStep({ ...currentStep, disc });
    setSelected({ type: "disc", id: disc.id });
    setTool("select");
  };

  const clearBoard = () => {
    if (!window.confirm("Clear every token and arrow from this board?")) return;
    commitStep({ ...currentStep, players: [], disc: null, arrows: [] });
    setSelected(null);
    setDraftArrow(null);
  };

  const deleteSelected = () => {
    if (!selected) {
      toast.error("Select a player, disc, or arrow first.");
      return;
    }
    if (selected.type === "player") commitStep({ ...currentStep, players: currentStep.players.filter((player) => player.id !== selected.id) });
    if (selected.type === "disc") commitStep({ ...currentStep, disc: null });
    if (selected.type === "arrow") commitStep({ ...currentStep, arrows: currentStep.arrows.filter((arrow) => arrow.id !== selected.id) });
    setSelected(null);
  };

  const addStep = () => {
    const newStep = cloneStep(currentStep, steps.length);
    const nextSteps = [...steps.slice(0, safeStepIndex + 1), newStep, ...steps.slice(safeStepIndex + 1)];
    onChange(syncBoardWithSequence(data, nextSteps, safeStepIndex + 1, data.sequence.durationMs));
    setStepIndex(safeStepIndex + 1);
    setSelected(null);
    toast.success("Step added from current setup.");
  };

  const duplicateStep = () => {
    const newStep = cloneStep(currentStep, steps.length);
    const nextSteps = [...steps.slice(0, safeStepIndex + 1), newStep, ...steps.slice(safeStepIndex + 1)];
    onChange(syncBoardWithSequence(data, nextSteps, safeStepIndex + 1, data.sequence.durationMs));
    setStepIndex(safeStepIndex + 1);
    toast.success("Step duplicated.");
  };

  const deleteStep = () => {
    if (steps.length <= 1) {
      toast.error("Keep at least one step.");
      return;
    }
    if (!window.confirm(`Delete ${currentStep.title}?`)) return;
    const nextSteps = steps.filter((_, index) => index !== safeStepIndex);
    const nextIndex = Math.max(0, safeStepIndex - 1);
    onChange(syncBoardWithSequence(data, nextSteps, nextIndex, data.sequence.durationMs));
    setStepIndex(nextIndex);
    setSelected(null);
  };

  const saveStep = () => {
    onChange(syncBoardWithSequence(data, steps, safeStepIndex, speedDurations[speed]));
    toast.success(`${currentStep.title} saved in sequence.`);
  };

  const goToStep = (index: number) => {
    stopPlayback(false);
    setStepIndex(clamp(index, 0, steps.length - 1));
    setPreviewStep(null);
    setSelected(null);
  };

  const stopPlayback = (resetPreview = true) => {
    setIsPlaying(false);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    if (resetPreview) setPreviewStep(null);
  };

  const resetPlayback = () => {
    stopPlayback();
    setStepIndex(0);
  };

  const animateToStep = (fromIndex: number) => {
    if (fromIndex >= steps.length - 1) {
      stopPlayback();
      return;
    }
    const from = steps[fromIndex];
    const to = steps[fromIndex + 1];
    const duration = speedDurations[speed];
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = easeInOut(progress);
      setPreviewStep(interpolateStep(from, to, eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setStepIndex(fromIndex + 1);
        setPreviewStep(null);
        frameRef.current = requestAnimationFrame(() => animateToStep(fromIndex + 1));
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  };

  const play = () => {
    if (steps.length <= 1) {
      toast.error("Add another step to play the sequence.");
      return;
    }
    stopPlayback(false);
    setIsPlaying(true);
    animateToStep(safeStepIndex >= steps.length - 1 ? 0 : safeStepIndex);
    if (safeStepIndex >= steps.length - 1) setStepIndex(0);
  };

  return (
    <section className="machine-panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xl font-black">Field board</div>
          <p className="mt-1 text-sm text-silver-muted">
            {editable ? drawHint(tool, draftArrow) : "Read-only tactical view."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge tone="cyan">Step {safeStepIndex + 1} of {steps.length}</StatusBadge>
            <StatusBadge tone="silver">{canvasStep.title}</StatusBadge>
            {isPlaying && <StatusBadge tone="green">Playing</StatusBadge>}
          </div>
        </div>
        {editable && (
          <div className="hidden max-w-full flex-wrap items-center justify-end gap-2 md:flex">
            <select className={`${inputClass} w-48`} value={selectedPlayerId} onChange={(event) => setSelectedPlayerId(event.target.value)}>
              {players.length ? players.map((player) => <option key={player.id} value={player.id}>{player.name} #{player.jersey}</option>) : <option value="">Select player</option>}
            </select>
            <TacticalToolButton active={tool === "select"} onClick={() => { setTool("select"); setDraftArrow(null); }} icon={MousePointer2}>Select</TacticalToolButton>
            <TacticalToolButton active={tool === "add_player"} onClick={() => { setTool("add_player"); addPlayer(); }} icon={Users2}>Add Player</TacticalToolButton>
            <TacticalToolButton active={tool === "add_disc"} onClick={() => { setTool("add_disc"); addDisc(); }} icon={Disc3}>Add Disc</TacticalToolButton>
            <TacticalToolButton active={tool === "draw_movement"} onClick={() => { setTool("draw_movement"); setDraftArrow(null); }} icon={MoveRight}>Movement</TacticalToolButton>
            <TacticalToolButton active={tool === "draw_pass"} onClick={() => { setTool("draw_pass"); setDraftArrow(null); }} icon={Send}>Pass</TacticalToolButton>
            <TacticalToolButton active={tool === "erase"} onClick={() => { setTool("erase"); setDraftArrow(null); }} icon={Eraser}>Erase</TacticalToolButton>
            <TacticalButton onClick={deleteSelected} icon={Trash2} tone="danger">Delete</TacticalButton>
            <TacticalButton onClick={clearBoard} icon={RotateCcw} tone="danger">Clear</TacticalButton>
            {onSave && <TacticalButton onClick={onSave} icon={Save} tone="primary">{saving ? "Saving..." : "Save"}</TacticalButton>}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <TacticalSequenceControls
          editable={editable}
          currentIndex={safeStepIndex}
          stepCount={steps.length}
          speed={speed}
          setSpeed={(nextSpeed) => {
            setSpeed(nextSpeed);
            onChange(syncBoardWithSequence(data, steps, safeStepIndex, speedDurations[nextSpeed]));
          }}
          isPlaying={isPlaying}
          onPlay={play}
          onPause={() => stopPlayback(false)}
          onReset={resetPlayback}
          onPrevious={() => goToStep(safeStepIndex - 1)}
          onNext={() => goToStep(safeStepIndex + 1)}
          onAdd={addStep}
          onDuplicate={duplicateStep}
          onDelete={deleteStep}
          onSaveStep={saveStep}
        />
        <TacticalStepPanel editable={editable} step={currentStep} onChange={updateStepMeta} />
        <TacticalCanvas
          data={{ players: canvasStep.players, disc: canvasStep.disc, arrows: canvasStep.arrows, notes: canvasStep.notes, sequence: data.sequence }}
          onChange={changeCurrentStep}
          editable={editable && !isPlaying}
          tool={tool}
          setTool={setTool}
          selected={selected}
          setSelected={setSelected}
          draftArrow={draftArrow}
          setDraftArrow={setDraftArrow}
        />
        <label className="mt-4 grid gap-2 text-xs font-bold text-silver-muted">
          Main board notes
          <textarea
            className={`${inputClass} min-h-28`}
            value={data.notes}
            readOnly={!editable}
            onChange={(event) => onChange({ ...data, notes: event.target.value })}
            placeholder="Coach tactic notes"
          />
        </label>
      </div>

      {editable && (
        <div className="sticky bottom-0 z-10 grid gap-2 border-t border-white/10 bg-[#050505]/95 p-3 backdrop-blur-xl md:hidden">
          <select className={inputClass} value={selectedPlayerId} onChange={(event) => setSelectedPlayerId(event.target.value)}>
            {players.length ? players.map((player) => <option key={player.id} value={player.id}>{player.name} #{player.jersey}</option>) : <option value="">Select player</option>}
          </select>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <MobileToolButton active={tool === "select"} onClick={() => { setTool("select"); setDraftArrow(null); }} icon={MousePointer2} label="Select" />
            <MobileToolButton active={tool === "add_player"} onClick={() => { setTool("add_player"); addPlayer(); }} icon={Users2} label="Player" />
            <MobileToolButton active={tool === "add_disc"} onClick={() => { setTool("add_disc"); addDisc(); }} icon={Disc3} label="Disc" />
            <MobileToolButton active={tool === "draw_movement"} onClick={() => { setTool("draw_movement"); setDraftArrow(null); }} icon={MoveRight} label="Move" />
            <MobileToolButton active={tool === "draw_pass"} onClick={() => { setTool("draw_pass"); setDraftArrow(null); }} icon={Send} label="Pass" />
            <MobileToolButton active={tool === "erase"} onClick={() => { setTool("erase"); setDraftArrow(null); }} icon={Eraser} label="Erase" />
            <MobileToolButton onClick={deleteSelected} icon={Trash2} label="Delete" danger />
            <MobileToolButton onClick={clearBoard} icon={RotateCcw} label="Clear" danger />
            {onSave && <MobileToolButton onClick={onSave} icon={Save} label={saving ? "Saving" : "Save"} primary />}
          </div>
        </div>
      )}
    </section>
  );
}

function TacticalSequenceControls({
  editable,
  currentIndex,
  stepCount,
  speed,
  setSpeed,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onPrevious,
  onNext,
  onAdd,
  onDuplicate,
  onDelete,
  onSaveStep,
}: {
  editable: boolean;
  currentIndex: number;
  stepCount: number;
  speed: SpeedMode;
  setSpeed: (speed: SpeedMode) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onAdd: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSaveStep: () => void;
}) {
  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-cyan">Tactical sequence</div>
          <div className="mt-1 text-sm font-bold text-silver">Step {currentIndex + 1} of {stepCount}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <TacticalButton onClick={onPrevious} icon={SkipBack}>Previous</TacticalButton>
          {isPlaying ? <TacticalButton onClick={onPause} icon={Pause} tone="primary">Pause</TacticalButton> : <TacticalButton onClick={onPlay} icon={Play} tone="primary">Play</TacticalButton>}
          <TacticalButton onClick={onReset} icon={RotateCcw}>Reset</TacticalButton>
          <TacticalButton onClick={onNext} icon={SkipForward}>Next</TacticalButton>
          <select className={`${inputClass} w-28 py-2 text-xs`} value={speed} onChange={(event) => setSpeed(event.target.value as SpeedMode)} aria-label="Animation speed">
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>
      </div>
      {editable && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
          <TacticalButton onClick={onAdd} icon={Plus}>Add Step</TacticalButton>
          <TacticalButton onClick={onDuplicate} icon={FilePenLine}>Duplicate</TacticalButton>
          <TacticalButton onClick={onDelete} icon={Trash2} tone="danger">Delete Step</TacticalButton>
          <TacticalButton onClick={onSaveStep} icon={Save} tone="primary">Save Step</TacticalButton>
        </div>
      )}
    </div>
  );
}

function TacticalStepPanel({ editable, step, onChange }: { editable: boolean; step: TacticalSequenceStep; onChange: (patch: Partial<Pick<TacticalSequenceStep, "title" | "notes">>) => void }) {
  return (
    <div className="mb-4 grid gap-3 rounded-2xl border border-cyan/20 bg-cyan/5 p-3 md:grid-cols-[18rem_1fr]">
      <label className="grid gap-2 text-xs font-bold text-silver-muted">
        Step title
        <input className={inputClass} value={step.title} readOnly={!editable} onChange={(event) => onChange({ title: event.target.value })} />
      </label>
      <label className="grid gap-2 text-xs font-bold text-silver-muted">
        Step notes
        <input className={inputClass} value={step.notes} readOnly={!editable} onChange={(event) => onChange({ notes: event.target.value })} placeholder="What should players understand in this phase?" />
      </label>
    </div>
  );
}

function TacticalCanvas({
  data,
  onChange,
  editable,
  tool,
  setTool,
  selected,
  setSelected,
  draftArrow,
  setDraftArrow,
}: {
  data: TacticalBoardData;
  onChange: (data: TacticalBoardData) => void;
  editable: boolean;
  tool: ToolMode;
  setTool: (tool: ToolMode) => void;
  selected: Selection;
  setSelected: (selection: Selection) => void;
  draftArrow: DraftArrow;
  setDraftArrow: (draft: DraftArrow) => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(boardWidth);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const update = () => setWidth(Math.max(280, node.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scale = width / boardWidth;
  const height = boardHeight * scale;

  const updatePlayer = (id: string, x: number, y: number) => {
    onChange({ ...data, players: data.players.map((player) => (player.id === id ? { ...player, x: clamp(x, 36, boardWidth - 36), y: clamp(y, 42, boardHeight - 58) } : player)) });
  };

  const updateDisc = (x: number, y: number) => {
    onChange({ ...data, disc: { id: data.disc?.id ?? "disc-1", x: clamp(x, 24, boardWidth - 24), y: clamp(y, 24, boardHeight - 24) } });
  };

  const eraseSelection = (selection: Selection) => {
    if (!selection) return;
    if (selection.type === "player") onChange({ ...data, players: data.players.filter((player) => player.id !== selection.id) });
    if (selection.type === "disc") onChange({ ...data, disc: null });
    if (selection.type === "arrow") onChange({ ...data, arrows: data.arrows.filter((arrow) => arrow.id !== selection.id) });
    setSelected(null);
  };

  const handleBoardPoint = (x: number, y: number) => {
    if (!editable) return;
    if (tool !== "draw_movement" && tool !== "draw_pass") {
      setSelected(null);
      return;
    }
    const type = tool === "draw_pass" ? "pass" : "movement";
    if (!draftArrow) {
      setDraftArrow({ type, fromX: x, fromY: y });
      return;
    }
    const arrow: TacticalArrowToken = {
      id: `arrow-${Date.now()}`,
      type,
      fromX: draftArrow.fromX,
      fromY: draftArrow.fromY,
      toX: x,
      toY: y,
    };
    onChange({ ...data, arrows: [...data.arrows, arrow] });
    setSelected({ type: "arrow", id: arrow.id });
    setDraftArrow(null);
    setTool("select");
  };

  const handleStageClick = (event: any) => {
    const stage = event.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    handleBoardPoint(pointer.x / scale, pointer.y / scale);
  };

  return (
    <div ref={wrapRef} className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black/35">
      <Stage width={width} height={height} scaleX={scale} scaleY={scale} onMouseDown={handleStageClick} onTouchStart={handleStageClick}>
        <Layer>
          <Rect x={0} y={0} width={boardWidth} height={boardHeight} fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: boardWidth, y: boardHeight }} fillLinearGradientColorStops={[0, "#123D2F", 0.58, "#0F3D2E", 1, "#09251E"]} cornerRadius={18} />
          {Array.from({ length: 24 }).map((_, index) => (
            <Line key={`v-${index}`} points={[index * 44, 0, index * 44, boardHeight]} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
          ))}
          {Array.from({ length: 12 }).map((_, index) => (
            <Line key={`h-${index}`} points={[0, index * 40, boardWidth, index * 40]} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
          ))}
          <Rect x={34} y={28} width={boardWidth - 68} height={boardHeight - 56} stroke="rgba(255,255,255,0.75)" strokeWidth={2.5} cornerRadius={12} />
          <Rect x={34} y={28} width={160} height={boardHeight - 56} stroke="rgba(255,255,255,0.72)" strokeWidth={2} />
          <Rect x={boardWidth - 194} y={28} width={160} height={boardHeight - 56} stroke="rgba(255,255,255,0.72)" strokeWidth={2} />
          <Line points={[boardWidth / 2, 28, boardWidth / 2, boardHeight - 28]} stroke="rgba(255,255,255,0.68)" strokeWidth={2} dash={[12, 10]} />
          <Line points={[194, 28, 194, boardHeight - 28]} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
          <Line points={[boardWidth - 194, 28, boardWidth - 194, boardHeight - 28]} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
          <Text x={64} y={48} text="ENDZONE" fill="rgba(255,255,255,0.58)" fontSize={18} fontStyle="bold" />
          <Text x={boardWidth - 164} y={boardHeight - 70} text="ENDZONE" fill="rgba(255,255,255,0.58)" fontSize={18} fontStyle="bold" />

          {data.arrows.map((arrow) => {
            const isSelected = selected?.type === "arrow" && selected.id === arrow.id;
            const isPass = arrow.type === "pass";
            return (
              <Arrow
                key={arrow.id}
                points={[arrow.fromX, arrow.fromY, arrow.toX, arrow.toY]}
                pointerLength={16}
                pointerWidth={14}
                stroke={isSelected ? "#38DDF8" : isPass ? "rgba(235,242,245,0.82)" : "#38DDF8"}
                fill={isSelected ? "#38DDF8" : isPass ? "rgba(235,242,245,0.82)" : "#38DDF8"}
                strokeWidth={isSelected ? 5 : 3}
                dash={isPass ? [14, 10] : undefined}
                shadowColor="#38DDF8"
                shadowBlur={isSelected ? 18 : 8}
                opacity={isSelected ? 1 : 0.85}
                onClick={(event) => {
                  event.cancelBubble = true;
                  if (!editable) return;
                  const selection = { type: "arrow", id: arrow.id } as const;
                  if (tool === "erase") eraseSelection(selection);
                  else setSelected(selection);
                }}
                onTap={(event) => {
                  event.cancelBubble = true;
                  if (!editable) return;
                  const selection = { type: "arrow", id: arrow.id } as const;
                  if (tool === "erase") eraseSelection(selection);
                  else setSelected(selection);
                }}
              />
            );
          })}

          {draftArrow && (
            <Circle x={draftArrow.fromX} y={draftArrow.fromY} radius={8} fill="#38DDF8" shadowColor="#38DDF8" shadowBlur={14} />
          )}

          {data.players.map((player) => (
            <Group
              key={player.id}
              x={player.x}
              y={player.y}
              draggable={editable && tool === "select"}
              onDragEnd={(event) => updatePlayer(player.id, event.target.x(), event.target.y())}
              onClick={(event) => {
                event.cancelBubble = true;
                if (!editable) return;
                const selection = { type: "player", id: player.id } as const;
                if (tool === "erase") eraseSelection(selection);
                else if (tool === "draw_movement" || tool === "draw_pass") handleBoardPoint(player.x, player.y);
                else setSelected(selection);
              }}
              onTap={(event) => {
                event.cancelBubble = true;
                if (!editable) return;
                const selection = { type: "player", id: player.id } as const;
                if (tool === "erase") eraseSelection(selection);
                else if (tool === "draw_movement" || tool === "draw_pass") handleBoardPoint(player.x, player.y);
                else setSelected(selection);
              }}
            >
              <Circle radius={30} fill="#0d1012" stroke={selected?.type === "player" && selected.id === player.id ? "#38DDF8" : "#d7dee3"} strokeWidth={selected?.type === "player" && selected.id === player.id ? 4 : 2.5} shadowColor="#38DDF8" shadowBlur={selected?.type === "player" && selected.id === player.id ? 18 : 5} />
              <Circle radius={22} fillLinearGradientStartPoint={{ x: -18, y: -18 }} fillLinearGradientEndPoint={{ x: 18, y: 18 }} fillLinearGradientColorStops={[0, "#d7dee3", 0.62, "#8fb4bb", 1, "#111416"]} opacity={0.95} />
              <Text x={-22} y={-11} width={44} align="center" text={player.jersey} fill="#020303" fontSize={18} fontStyle="bold" />
              <Text x={-46} y={34} width={92} align="center" text={player.name} fill="#f4f7f8" fontSize={12} fontStyle="bold" />
              <Text x={-46} y={49} width={92} align="center" text={player.position} fill="#9daab3" fontSize={10} />
            </Group>
          ))}

          {data.disc && (
            <Group
              x={data.disc.x}
              y={data.disc.y}
              draggable={editable && tool === "select"}
              onDragEnd={(event) => updateDisc(event.target.x(), event.target.y())}
              onClick={(event) => {
                event.cancelBubble = true;
                if (!editable) return;
                const selection = { type: "disc", id: data.disc?.id ?? "disc-1" } as const;
                if (tool === "erase") eraseSelection(selection);
                else if (tool === "draw_movement" || tool === "draw_pass") handleBoardPoint(data.disc?.x ?? boardWidth / 2, data.disc?.y ?? boardHeight / 2);
                else setSelected(selection);
              }}
              onTap={(event) => {
                event.cancelBubble = true;
                if (!editable) return;
                const selection = { type: "disc", id: data.disc?.id ?? "disc-1" } as const;
                if (tool === "erase") eraseSelection(selection);
                else if (tool === "draw_movement" || tool === "draw_pass") handleBoardPoint(data.disc?.x ?? boardWidth / 2, data.disc?.y ?? boardHeight / 2);
                else setSelected(selection);
              }}
            >
              <Circle radius={16} fill="#d7dee3" stroke={selected?.type === "disc" ? "#38DDF8" : "#f4f7f8"} strokeWidth={selected?.type === "disc" ? 4 : 2} shadowColor="#38DDF8" shadowBlur={selected?.type === "disc" ? 18 : 10} />
              <Circle radius={7} fill="#050707" opacity={0.8} />
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
}

function TacticalBoardCard({ board, trainingTitle, tournamentName, onDelete }: { board: TacticalBoard; trainingTitle?: string; tournamentName?: string; onDelete: () => Promise<void> }) {
  const [deleting, setDeleting] = useState(false);

  return (
    <article className="machine-panel p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="machine-section-label">Tactic</div>
          <h2 className="mt-2 truncate text-2xl font-black">{board.title}</h2>
          {board.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-silver-muted">{board.description}</p>}
        </div>
        <StatusBadge tone={board.status === "published" ? "green" : "silver"}>{statusLabel(board.status)}</StatusBadge>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <InfoPill label="Field" value={fieldLabel(board.field_type)} />
        <InfoPill label="Visibility" value={visibilityLabel(board.visibility)} />
        <InfoPill label="Linked" value={trainingTitle ?? tournamentName ?? "No linked event"} />
        <InfoPill label="Updated" value={formatDate(board.updated_at)} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <CardLink to="/dashboard/tactical/$tacticalId" id={board.id} label="View" icon={Eye} />
        <CardLink to="/dashboard/tactical/$tacticalId/edit" id={board.id} label="Edit" icon={FilePenLine} />
        <button
          onClick={async () => {
            setDeleting(true);
            try {
              await onDelete();
            } finally {
              setDeleting(false);
            }
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-black text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

function TacticalHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
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

function TacticalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-silver-muted">
      {label}
      {children}
    </label>
  );
}

function TacticalToolButton({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof Plus; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black transition ${active ? "border-cyan/40 bg-cyan/15 text-cyan shadow-[0_0_22px_rgba(56,221,248,0.16)]" : "border-white/10 bg-white/[0.045] text-silver hover:border-white/20"}`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function TacticalButton({ onClick, icon: Icon, children, tone = "default" }: { onClick: () => void; icon: typeof Plus; children: React.ReactNode; tone?: "default" | "danger" | "primary" }) {
  const toneClass = tone === "primary" ? "border-cyan/30 bg-cyan/10 text-cyan" : tone === "danger" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-white/10 bg-white/[0.045] text-silver";
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black ${toneClass}`}>
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function MobileToolButton({ active, onClick, icon: Icon, label, primary, danger }: { active?: boolean; onClick: () => void; icon: typeof Plus; label: string; primary?: boolean; danger?: boolean }) {
  const tone = active
    ? "border-cyan/40 bg-cyan/15 text-cyan"
    : primary
      ? "border-cyan/30 bg-cyan/10 text-cyan"
      : danger
        ? "border-destructive/30 bg-destructive/10 text-destructive"
        : "border-white/10 bg-white/[0.045] text-silver";
  return (
    <button onClick={onClick} className={`grid min-w-16 place-items-center gap-1 rounded-xl border px-3 py-2 text-[10px] font-black ${tone}`} aria-label={label} title={label}>
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
}

function IconOnlyButton({ onClick, icon: Icon, label, primary, danger }: { onClick: () => void; icon: typeof Plus; label: string; primary?: boolean; danger?: boolean }) {
  const tone = primary ? "border-cyan/30 bg-cyan/10 text-cyan" : danger ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-white/10 bg-white/[0.045] text-silver";
  return (
    <button onClick={onClick} className={`grid h-12 place-items-center rounded-xl border text-xs font-black ${tone}`} aria-label={label} title={label}>
      <Icon className="h-5 w-5" />
    </button>
  );
}

function PrimaryActionLink({ to, label, icon: Icon, className = "" }: { to: string; label: string; icon: typeof Plus; className?: string }) {
  return (
    <Link to={to} className={`inline-flex items-center justify-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm font-black text-cyan glow-cyan ${className}`}>
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function CardLink({ to, id, label, icon: Icon }: { to: string; id: string; label: string; icon: typeof Eye }) {
  return (
    <Link to={to} params={{ tacticalId: id }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-black">
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
      <div className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-silver-muted">{label}</div>
      <div className="mt-1 truncate text-sm font-bold">{value}</div>
    </div>
  );
}

function fieldLabel(value: TacticalFieldType) {
  return {
    full_field: "Full field",
    half_field: "Half field",
    endzone: "Endzone",
    vertical_stack: "Vertical stack",
    horizontal_stack: "Horizontal stack",
  }[value];
}

function visibilityLabel(value: TacticalVisibility) {
  return {
    coach_only: "Coach only",
    players: "Players",
    public: "Public",
  }[value];
}

function statusLabel(value: TacticalStatus) {
  return value === "published" ? "Published" : "Draft";
}

function drawHint(tool: ToolMode, draftArrow: DraftArrow) {
  if (tool === "draw_movement") return draftArrow ? "Movement: click the end point." : "Movement: click a player, disc, or field point to start.";
  if (tool === "draw_pass") return draftArrow ? "Pass: click the end point." : "Pass: click a player, disc, or field point to start.";
  if (tool === "erase") return "Erase: click a player, disc, or arrow to remove it.";
  return "Select, place, draw, erase, then save the board.";
}

function clonePlayers(players: TacticalSequenceStep["players"]) {
  return players.map((player) => ({ ...player }));
}

function cloneDisc(disc: TacticalSequenceStep["disc"]) {
  return disc ? { ...disc } : null;
}

function cloneArrows(arrows: TacticalSequenceStep["arrows"]) {
  return arrows.map((arrow) => ({ ...arrow }));
}

function makeStepFromBoard(data: TacticalBoardData, index: number): TacticalSequenceStep {
  return {
    id: `step-${index + 1}`,
    title: index === 0 ? "Setup" : `Step ${index + 1}`,
    notes: index === 0 ? data.notes : "",
    players: clonePlayers(data.players),
    disc: cloneDisc(data.disc),
    arrows: cloneArrows(data.arrows),
  };
}

function cloneStep(step: TacticalSequenceStep, index: number): TacticalSequenceStep {
  return {
    id: `step-${Date.now()}-${index + 1}`,
    title: `Step ${index + 1}`,
    notes: step.notes,
    players: clonePlayers(step.players),
    disc: cloneDisc(step.disc),
    arrows: cloneArrows(step.arrows),
  };
}

function syncBoardWithSequence(data: TacticalBoardData, steps: TacticalSequenceStep[], activeIndex: number, durationMs: number): TacticalBoardData {
  const normalizedSteps = steps.length ? steps : [makeStepFromBoard(data, 0)];
  const safeIndex = clamp(activeIndex, 0, normalizedSteps.length - 1);
  const activeStep = normalizedSteps[safeIndex];

  return {
    ...data,
    players: clonePlayers(activeStep.players),
    disc: cloneDisc(activeStep.disc),
    arrows: cloneArrows(activeStep.arrows),
    sequence: {
      enabled: true,
      durationMs,
      steps: normalizedSteps.map((step) => ({
        ...step,
        players: clonePlayers(step.players),
        disc: cloneDisc(step.disc),
        arrows: cloneArrows(step.arrows),
      })),
    },
  };
}

function easeInOut(progress: number) {
  return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
}

function interpolateValue(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function interpolateStep(from: TacticalSequenceStep, to: TacticalSequenceStep, progress: number): TacticalSequenceStep {
  const fromPlayers = new Map(from.players.map((player) => [player.id, player]));
  const players = to.players.map((target) => {
    const source = fromPlayers.get(target.id) ?? target;
    return {
      ...target,
      x: interpolateValue(source.x, target.x, progress),
      y: interpolateValue(source.y, target.y, progress),
    };
  });

  const disc = to.disc
    ? {
        ...to.disc,
        x: interpolateValue(from.disc?.x ?? to.disc.x, to.disc.x, progress),
        y: interpolateValue(from.disc?.y ?? to.disc.y, to.disc.y, progress),
      }
    : null;

  return {
    ...to,
    players,
    disc,
    arrows: progress < 0.2 ? cloneArrows(from.arrows) : cloneArrows(to.arrows),
  };
}

function linkedLabel(board: TacticalBoard, data: ReturnType<typeof useAppData>["data"]) {
  const training = data.trainingSessions.find((item) => item.id === board.training_session_id);
  const tournament = data.tournaments.find((item) => item.id === board.tournament_id);
  return training?.title ?? tournament?.name ?? "No linked event";
}

function formatDate(value: string | null) {
  if (!value) return "Not saved";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const inputClass = "machine-input w-full px-3 py-3 text-sm text-foreground outline-none placeholder:text-silver-muted focus:border-cyan/35";
