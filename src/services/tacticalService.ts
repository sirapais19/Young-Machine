import { supabase } from "@/lib/supabase";

export type TacticalFieldType = "full_field" | "half_field" | "endzone" | "vertical_stack" | "horizontal_stack";
export type TacticalVisibility = "coach_only" | "players" | "public";
export type TacticalStatus = "draft" | "published";

export interface TacticalPlayerToken {
  id: string;
  playerId?: string;
  name: string;
  jersey: string;
  position: string;
  x: number;
  y: number;
}

export interface TacticalDiscToken {
  id: string;
  x: number;
  y: number;
}

export interface TacticalArrowToken {
  id: string;
  type: "movement" | "pass";
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface TacticalSequenceStep {
  id: string;
  title: string;
  notes: string;
  players: TacticalPlayerToken[];
  disc: TacticalDiscToken | null;
  arrows: TacticalArrowToken[];
}

export interface TacticalSequence {
  enabled: boolean;
  steps: TacticalSequenceStep[];
  durationMs: number;
}

export interface TacticalBoardData {
  players: TacticalPlayerToken[];
  disc: TacticalDiscToken | null;
  arrows: TacticalArrowToken[];
  notes: string;
  sequence: TacticalSequence;
}

export interface TacticalBoard {
  id: string;
  title: string;
  description: string | null;
  field_type: TacticalFieldType;
  created_by: string | null;
  training_session_id: string | null;
  tournament_id: string | null;
  visibility: TacticalVisibility;
  status: TacticalStatus;
  board_data: TacticalBoardData;
  created_at: string | null;
  updated_at: string | null;
}

export type TacticalBoardPayload = {
  title: string;
  description?: string | null;
  field_type: TacticalFieldType;
  created_by?: string | null;
  training_session_id?: string | null;
  tournament_id?: string | null;
  visibility: TacticalVisibility;
  status: TacticalStatus;
  board_data: TacticalBoardData;
};

export const emptyBoardData = (): TacticalBoardData => ({
  players: [],
  disc: null,
  arrows: [],
  notes: "",
  sequence: {
    enabled: true,
    durationMs: 900,
    steps: [{ id: "step-1", title: "Setup", notes: "", players: [], disc: null, arrows: [] }],
  },
});

function normalizeBoard(row: Record<string, unknown>): TacticalBoard {
  return {
    id: String(row.id),
    title: String(row.title ?? "Untitled tactic"),
    description: (row.description as string | null | undefined) ?? null,
    field_type: (row.field_type as TacticalFieldType | null | undefined) ?? "full_field",
    created_by: (row.created_by as string | null | undefined) ?? null,
    training_session_id: (row.training_session_id as string | null | undefined) ?? null,
    tournament_id: (row.tournament_id as string | null | undefined) ?? null,
    visibility: (row.visibility as TacticalVisibility | null | undefined) ?? "coach_only",
    status: (row.status as TacticalStatus | null | undefined) ?? "draft",
    board_data: normalizeBoardData(row.board_data),
    created_at: (row.created_at as string | null | undefined) ?? null,
    updated_at: (row.updated_at as string | null | undefined) ?? null,
  };
}

function normalizeBoardData(value: unknown): TacticalBoardData {
  const data = value && typeof value === "object" ? (value as Partial<TacticalBoardData>) : {};
  const players = normalizePlayers(data.players);
  const disc = normalizeDisc(data.disc);
  const arrows = normalizeArrows(data.arrows);
  const notes = String(data.notes ?? "");
  const sequence = normalizeSequence(data.sequence, { players, disc, arrows, notes });

  return {
    players,
    disc,
    arrows,
    notes,
    sequence,
  };
}

function normalizePlayers(value: unknown): TacticalPlayerToken[] {
  return Array.isArray(value)
    ? value.map((player, index) => ({
        id: String(player.id ?? `token-${index}`),
        playerId: player.playerId ? String(player.playerId) : undefined,
        name: String(player.name ?? "Player"),
        jersey: String(player.jersey ?? index + 1),
        position: String(player.position ?? "Hybrid"),
        x: Number(player.x ?? 120 + index * 34),
        y: Number(player.y ?? 220),
      }))
    : [];
}

function normalizeDisc(value: unknown): TacticalDiscToken | null {
  if (!value || typeof value !== "object") return null;
  const disc = value as Partial<TacticalDiscToken>;
  return { id: String(disc.id ?? "disc-1"), x: Number(disc.x ?? 300), y: Number(disc.y ?? 220) };
}

function normalizeArrows(value: unknown): TacticalArrowToken[] {
  return Array.isArray(value)
    ? value
        .filter((arrow) => arrow && typeof arrow === "object")
        .map((arrow, index) => ({
          id: String(arrow.id ?? `arrow-${index}`),
          type: arrow.type === "pass" ? "pass" : "movement",
          fromX: Number(arrow.fromX ?? 160),
          fromY: Number(arrow.fromY ?? 210),
          toX: Number(arrow.toX ?? 320),
          toY: Number(arrow.toY ?? 210),
        }))
    : [];
}

function normalizeSequence(value: unknown, fallback: { players: TacticalPlayerToken[]; disc: TacticalDiscToken | null; arrows: TacticalArrowToken[]; notes: string }): TacticalSequence {
  const sequence = value && typeof value === "object" ? (value as Partial<TacticalSequence>) : null;
  const fallbackStep: TacticalSequenceStep = {
    id: "step-1",
    title: "Setup",
    notes: fallback.notes,
    players: fallback.players,
    disc: fallback.disc,
    arrows: fallback.arrows,
  };

  const steps = Array.isArray(sequence?.steps)
    ? sequence.steps.map((step, index) => ({
        id: String(step.id ?? `step-${index + 1}`),
        title: String(step.title ?? `Step ${index + 1}`),
        notes: String(step.notes ?? ""),
        players: normalizePlayers(step.players),
        disc: normalizeDisc(step.disc),
        arrows: normalizeArrows(step.arrows),
      }))
    : [];

  return {
    enabled: sequence?.enabled ?? true,
    durationMs: Number(sequence?.durationMs ?? 900),
    steps: steps.length ? steps : [fallbackStep],
  };
}

export async function getTacticalBoards(): Promise<TacticalBoard[]> {
  const { data, error } = await supabase.from("tactical_boards").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => normalizeBoard(row as Record<string, unknown>));
}

export async function getTacticalBoardById(id: string): Promise<TacticalBoard | null> {
  const { data, error } = await supabase.from("tactical_boards").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? normalizeBoard(data as Record<string, unknown>) : null;
}

export async function getSharedTacticalBoardById(id: string): Promise<TacticalBoard | null> {
  const { data, error } = await supabase
    .from("tactical_boards")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .in("visibility", ["players", "public"])
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeBoard(data as Record<string, unknown>) : null;
}

export async function createTacticalBoard(payload: TacticalBoardPayload): Promise<TacticalBoard> {
  const { data, error } = await supabase.from("tactical_boards").insert(payload).select("*").single();
  if (error) throw error;
  return normalizeBoard(data as Record<string, unknown>);
}

export async function updateTacticalBoard(id: string, payload: Partial<TacticalBoardPayload>): Promise<TacticalBoard> {
  const { data, error } = await supabase.from("tactical_boards").update(payload).eq("id", id).select("*").single();
  if (error) throw error;
  return normalizeBoard(data as Record<string, unknown>);
}

export async function deleteTacticalBoard(id: string): Promise<void> {
  const { error } = await supabase.from("tactical_boards").delete().eq("id", id);
  if (error) throw error;
}
