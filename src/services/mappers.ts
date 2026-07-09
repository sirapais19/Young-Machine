import type {
  Achievement,
  AppData,
  AttendanceRecord,
  AttendanceStatus,
  ClubPage,
  FitnessRecord,
  Gallery,
  GalleryImage,
  InjuryRecord,
  Notification,
  Player,
  Position,
  PublishStatus,
  RecoveryStatus,
  TeamLineup,
  Tournament,
  TournamentPlayer,
  TournamentRole,
  TournamentStats,
  TournamentStatus,
  TrainingSession,
  TrainingStatus,
  WorkoutAssignment,
  WorkoutPlan,
  WorkoutStatus,
  WorkoutSubmission,
  WorkoutTask,
  WorkoutTaskType,
} from "@/types/app";
import type {
  AchievementRow,
  ClubPageRow,
  FitnessRecordRow,
  GalleryImageRow,
  GalleryRow,
  InjuryRecordRow,
  NotificationRow,
  PlayerWithProfileRow,
  TeamLineupPlayerRow,
  TeamLineupRow,
  TournamentPlayerRow,
  TournamentPlayerStatsRow,
  TournamentRow,
  TrainingAttendanceRow,
  TrainingSessionRow,
  WorkoutAssignmentRow,
  WorkoutPlanRow,
  WorkoutSubmissionRow,
  WorkoutTaskRow,
} from "@/types/supabase";

const positionFallback: Position = "Hybrid";

export function toTrainingStatus(status?: string | null): TrainingStatus {
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  return "Upcoming";
}

export function fromTrainingStatus(status: TrainingStatus): string {
  return status === "Completed" ? "completed" : status === "Cancelled" ? "cancelled" : "scheduled";
}

export function toAttendanceStatus(status?: string | null): AttendanceStatus {
  if (status === "will_attend") return "Going";
  if (status === "not_attend") return "Out";
  if (status === "maybe") return "Maybe";
  if (status === "attended") return "Attended";
  if (status === "absent") return "Absent";
  return "No response";
}

export function fromAttendanceStatus(status: AttendanceStatus): string {
  if (status === "Going") return "will_attend";
  if (status === "Out") return "not_attend";
  if (status === "Maybe") return "maybe";
  if (status === "Attended") return "attended";
  if (status === "Absent") return "absent";
  return "maybe";
}

export function toWorkoutStatus(status?: string | null): WorkoutStatus {
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Draft";
  return status === "active" ? "Active" : "Draft";
}

export function fromWorkoutStatus(status: WorkoutStatus): string {
  return status === "Completed" ? "completed" : status === "Draft" ? "cancelled" : "active";
}

export function toWorkoutTaskType(type?: string | null): WorkoutTaskType {
  const normalized = `${type ?? "other"}`.toLowerCase();
  if (normalized === "strength") return "Strength";
  if (normalized === "running") return "Running";
  if (normalized === "conditioning") return "Conditioning";
  if (normalized === "skill") return "Skill";
  if (normalized === "recovery") return "Recovery";
  return "Other";
}

export function fromWorkoutTaskType(type: WorkoutTaskType): string {
  return type.toLowerCase();
}

export function toTournamentStatus(status?: string | null): TournamentStatus {
  if (status === "draft") return "Draft";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  return "Upcoming";
}

export function fromTournamentStatus(status: TournamentStatus): string {
  return status.toLowerCase();
}

export function toTournamentRole(role?: string | null): TournamentRole {
  return role === "main_player" ? "main player" : role === "captain" ? "captain" : "reserve";
}

export function fromTournamentRole(role: TournamentRole): string {
  return role === "main player" ? "main_player" : role;
}

export function toRecoveryStatus(status?: string | null): RecoveryStatus {
  if (status === "recovering") return "Recovering";
  if (status === "recovered") return "Recovered";
  return "Active";
}

export function fromRecoveryStatus(status: RecoveryStatus): string {
  return status.toLowerCase();
}

export function toPublishStatus(status?: string | null): PublishStatus {
  return status === "published" ? "Published" : "Draft";
}

export function fromPublishStatus(status: PublishStatus): string {
  return status.toLowerCase();
}

export function mapPlayers(rows: PlayerWithProfileRow[], statsRows: TournamentPlayerStatsRow[], attendanceRows: TrainingAttendanceRow[], completedTrainingCount: number): Player[] {
  return rows.map((row, index) => {
    const profile = row.profile ?? row.profiles;
    const stats = statsRows.filter((item) => item.player_id === row.id);
    const attended = attendanceRows.filter((item) => item.player_id === row.id && item.attendance_status === "attended").length;
    const willAttend = attendanceRows.filter((item) => item.player_id === row.id && item.attendance_status === "will_attend").length;
    const attendanceBase = completedTrainingCount || attendanceRows.filter((item) => item.player_id === row.id).length;
    const attendanceValue = attendanceBase ? Math.round(((completedTrainingCount ? attended : willAttend) / attendanceBase) * 100) : 0;

    return {
      id: row.id,
      name: profile?.full_name?.trim() || "Unnamed player",
      email: profile?.email ?? "",
      jersey: Number(row.jersey_no ?? 0),
      position: isPosition(row.position) ? row.position : positionFallback,
      dateOfBirth: row.date_of_birth ?? "",
      gender: row.gender === "Female" || row.gender === "Other" ? row.gender : "Male",
      height: row.height_cm == null ? "" : String(row.height_cm),
      weight: row.weight_kg == null ? "" : String(row.weight_kg),
      hand: row.dominant_hand === "Left" ? "Left" : "Right",
      experience: row.experience_level ?? "",
      profileImage: row.profile_photo ?? "",
      bio: row.bio ?? "",
      attendance: attendanceValue,
      score: stats.reduce((total, item) => total + Number(item.total_score ?? 0), 0),
      assist: stats.reduce((total, item) => total + Number(item.total_assist ?? 0), 0),
      blocks: stats.reduce((total, item) => total + Number(item.total_blocks ?? 0), 0),
      turnovers: stats.reduce((total, item) => total + Number(item.total_turnovers ?? 0), 0),
      injury: null,
      isPublic: Boolean(row.is_public_profile),
      avatarHue: 180 + ((index * 19) % 60),
    };
  });
}

function isPosition(value: unknown): value is Position {
  return value === "Handler" || value === "Cutter" || value === "Hybrid" || value === "Defender";
}

export const mapTrainingSession = (row: TrainingSessionRow): TrainingSession => ({
  id: row.id,
  title: row.title,
  date: row.training_date,
  start: row.start_time,
  end: row.end_time,
  location: row.location,
  note: row.note ?? "",
  status: toTrainingStatus(row.status),
});

export const trainingPayload = (training: Partial<TrainingSession>) => ({
  title: training.title,
  training_date: training.date,
  start_time: training.start,
  end_time: training.end,
  location: training.location,
  note: training.note ?? "",
  status: training.status ? fromTrainingStatus(training.status) : undefined,
});

export const mapAttendance = (row: TrainingAttendanceRow): AttendanceRecord => ({
  id: row.id,
  trainingId: row.training_session_id,
  playerId: row.player_id,
  response: toAttendanceStatus(row.attendance_status),
  coachStatus: toAttendanceStatus(row.attendance_status),
  updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
});

export const mapWorkoutPlan = (row: WorkoutPlanRow): WorkoutPlan => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  start: row.start_date,
  end: row.end_date,
  status: toWorkoutStatus(row.status),
});

export const workoutPlanPayload = (plan: Partial<WorkoutPlan>) => ({
  title: plan.title,
  description: plan.description ?? "",
  start_date: plan.start,
  end_date: plan.end,
  status: plan.status ? fromWorkoutStatus(plan.status) : undefined,
});

export const mapWorkoutTask = (row: WorkoutTaskRow): WorkoutTask => ({
  id: row.id,
  planId: row.workout_plan_id,
  date: row.task_date,
  day: row.day_name,
  title: row.task_title,
  description: row.task_description ?? "",
  type: toWorkoutTaskType(row.task_type),
});

export const workoutTaskPayload = (task: Partial<WorkoutTask>, planId = task.planId) => ({
  workout_plan_id: planId,
  task_date: task.date,
  day_name: task.day,
  task_title: task.title,
  task_description: task.description ?? "",
  task_type: task.type ? fromWorkoutTaskType(task.type) : undefined,
});

export const mapWorkoutAssignment = (row: WorkoutAssignmentRow): WorkoutAssignment => ({
  id: row.id,
  planId: row.workout_plan_id,
  playerId: row.player_id,
});

export const mapWorkoutSubmission = (row: WorkoutSubmissionRow, taskToPlan: Map<string, string>): WorkoutSubmission => ({
  id: row.id,
  taskId: row.workout_task_id,
  planId: taskToPlan.get(row.workout_task_id) ?? "",
  playerId: row.player_id,
  status: row.status === "not_done" ? "not done" : "done",
  proofName: row.proof_image ?? "",
  note: row.note ?? "",
  reviewed: false,
  submittedAt: row.submitted_at ?? row.created_at ?? new Date().toISOString(),
});

export const mapTournament = (row: TournamentRow): Tournament => ({
  id: row.id,
  name: row.name,
  location: row.location,
  start: row.start_date,
  end: row.end_date,
  description: row.description ?? "",
  result: row.result ?? "",
  status: toTournamentStatus(row.status),
});

export const tournamentPayload = (tournament: Partial<Tournament>) => ({
  name: tournament.name,
  location: tournament.location,
  start_date: tournament.start,
  end_date: tournament.end,
  description: tournament.description ?? "",
  result: tournament.result ?? "",
  status: tournament.status ? fromTournamentStatus(tournament.status) : undefined,
});

export const mapTournamentPlayer = (row: TournamentPlayerRow): TournamentPlayer => ({
  id: row.id,
  tournamentId: row.tournament_id,
  playerId: row.player_id,
  role: toTournamentRole(row.role),
});

export const mapTournamentStats = (row: TournamentPlayerStatsRow): TournamentStats => ({
  id: row.id,
  tournamentId: row.tournament_id,
  playerId: row.player_id,
  score: Number(row.total_score ?? 0),
  assist: Number(row.total_assist ?? 0),
  blocks: Number(row.total_blocks ?? 0),
  turnovers: Number(row.total_turnovers ?? 0),
  gamesPlayed: Number(row.total_games_played ?? 0),
  note: row.note ?? "",
});

export const tournamentStatsPayload = (stats: Partial<TournamentStats>) => ({
  tournament_id: stats.tournamentId,
  player_id: stats.playerId,
  total_score: stats.score ?? 0,
  total_assist: stats.assist ?? 0,
  total_blocks: stats.blocks ?? 0,
  total_turnovers: stats.turnovers ?? 0,
  total_games_played: stats.gamesPlayed ?? 0,
  note: stats.note ?? "",
});

export function mapLineups(lineups: TeamLineupRow[], players: TeamLineupPlayerRow[]): TeamLineup[] {
  return lineups.map((lineup) => ({
    id: lineup.id,
    tournamentId: lineup.tournament_id,
    name: lineup.lineup_name,
    notes: lineup.note ?? "",
    createdAt: lineup.created_at ?? new Date().toISOString(),
    players: players
      .filter((row) => row.team_lineup_id === lineup.id)
      .map((row) => ({ id: row.id, playerId: row.player_id, position: row.position, lineOrder: row.line_order })),
  }));
}

export const mapFitnessRecord = (row: FitnessRecordRow): FitnessRecord => ({
  id: row.id,
  playerId: row.player_id,
  date: row.record_date,
  weightKg: Number(row.weight_kg ?? 0),
  sprintSeconds: Number(row.sprint_time_seconds ?? 0),
  endurance: row.endurance_result ?? "",
  fitnessScore: Number(row.fitness_test_score ?? 0),
  note: row.note ?? "",
});

export const fitnessPayload = (record: Partial<FitnessRecord>) => ({
  player_id: record.playerId,
  record_date: record.date,
  weight_kg: record.weightKg,
  sprint_time_seconds: record.sprintSeconds,
  endurance_result: record.endurance,
  fitness_test_score: record.fitnessScore,
  note: record.note ?? "",
});

export const mapInjuryRecord = (row: InjuryRecordRow): InjuryRecord => ({
  id: row.id,
  playerId: row.player_id,
  type: row.injury_type,
  date: row.injury_date,
  status: toRecoveryStatus(row.recovery_status),
  expectedReturn: row.expected_return_date ?? "",
  note: row.note ?? "",
});

export const injuryPayload = (record: Partial<InjuryRecord>) => ({
  player_id: record.playerId,
  injury_type: record.type,
  injury_date: record.date,
  recovery_status: record.status ? fromRecoveryStatus(record.status) : undefined,
  expected_return_date: record.expectedReturn ?? null,
  note: record.note ?? "",
});

export const mapNotification = (row: NotificationRow): Notification => ({
  id: row.id,
  title: row.title,
  body: row.message,
  time: row.created_at ? new Date(row.created_at).toLocaleString() : "Just now",
  type: row.type === "training" || row.type === "workout" || row.type === "tournament" ? row.type : "general",
  read: Boolean(row.is_read),
  targetRole: "all",
  relatedPath: relatedPathForType(row.type),
});

function relatedPathForType(type: string | null | undefined) {
  if (type === "training") return "/player/training";
  if (type === "workout") return "/player/workouts";
  if (type === "tournament") return "/player/tournaments";
  return "/dashboard/notifications";
}

export const mapClubPage = (row: ClubPageRow): ClubPage => ({
  id: row.id,
  slug: row.page_key === "mission" || row.page_key === "values" || row.page_key === "contact" ? row.page_key : "about",
  title: row.title,
  body: row.content ?? "",
  status: toPublishStatus(row.status),
});

export const mapAchievement = (row: AchievementRow): Achievement => ({
  id: row.id,
  title: row.title,
  date: row.achievement_date,
  description: row.description ?? "",
  status: toPublishStatus(row.status),
});

export const achievementPayload = (achievement: Partial<Achievement>) => ({
  title: achievement.title,
  achievement_date: achievement.date,
  description: achievement.description ?? "",
  status: achievement.status ? fromPublishStatus(achievement.status) : undefined,
});

export const mapGallery = (row: GalleryRow): Gallery => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  status: toPublishStatus(row.status),
  createdAt: row.created_at ?? new Date().toISOString(),
});

export const galleryPayload = (gallery: Partial<Gallery>) => ({
  title: gallery.title,
  description: gallery.description ?? "",
  status: gallery.status ? fromPublishStatus(gallery.status) : undefined,
});

export const mapGalleryImage = (row: GalleryImageRow): GalleryImage => ({
  id: row.id,
  galleryId: row.gallery_id,
  caption: row.caption ?? "",
  fileName: row.image_path,
  date: row.created_at?.slice(0, 10) ?? "",
});

export function emptyAppData(): AppData {
  return {
    players: [],
    trainingSessions: [],
    attendanceRecords: [],
    workoutPlans: [],
    workoutTasks: [],
    workoutAssignments: [],
    workoutSubmissions: [],
    tournaments: [],
    tournamentPlayers: [],
    tournamentStats: [],
    teamLineups: [],
    fitnessRecords: [],
    injuryRecords: [],
    notifications: [],
    clubPages: [],
    achievements: [],
    galleries: [],
    galleryImages: [],
  };
}
