import type { Role } from "@/types/app";

export type DbRole = Role;

export interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: DbRole;
  status: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PlayerRow {
  id: string;
  user_id: string | null;
  jersey_no: number | string | null;
  date_of_birth: string | null;
  gender: "Male" | "Female" | "Other" | string | null;
  height_cm: number | string | null;
  weight_kg: number | string | null;
  position: string | null;
  dominant_hand: "Left" | "Right" | string | null;
  experience_level: string | null;
  profile_photo: string | null;
  bio: string | null;
  is_public_profile: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TrainingSessionRow {
  id: string;
  title: string;
  training_date: string;
  start_time: string;
  end_time: string;
  location: string;
  note: string | null;
  created_by: string | null;
  status: "scheduled" | "completed" | "cancelled" | string;
  season_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TrainingAttendanceRow {
  id: string;
  training_session_id: string;
  player_id: string;
  attendance_status: "will_attend" | "not_attend" | "maybe" | "attended" | "absent" | string;
  reason: string | null;
  checked_in_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface NotificationRow {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: "training" | "workout" | "tournament" | "general" | string;
  related_id: string | null;
  is_read: boolean | null;
  created_at: string | null;
}

export interface WorkoutPlanRow {
  id: string;
  title: string;
  description: string | null;
  assigned_by: string | null;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "cancelled" | string;
  season_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkoutTaskRow {
  id: string;
  workout_plan_id: string;
  task_date: string;
  day_name: string;
  task_title: string;
  task_description: string | null;
  task_type: "strength" | "running" | "conditioning" | "skill" | "recovery" | "other" | string;
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkoutAssignmentRow {
  id: string;
  workout_plan_id: string;
  player_id: string;
  created_at: string | null;
}

export interface WorkoutSubmissionRow {
  id: string;
  workout_task_id: string;
  player_id: string;
  status: "done" | "not_done" | string;
  proof_image: string | null;
  note: string | null;
  submitted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TournamentRow {
  id: string;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string | null;
  result: string | null;
  status: "draft" | "upcoming" | "completed" | "cancelled" | string;
  season_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TournamentPlayerRow {
  id: string;
  tournament_id: string;
  player_id: string;
  role: "main_player" | "reserve" | "captain" | string;
  created_at: string | null;
}

export interface TournamentPlayerStatsRow {
  id: string;
  tournament_id: string;
  player_id: string;
  total_score: number | null;
  total_assist: number | null;
  total_blocks: number | null;
  total_turnovers: number | null;
  total_games_played: number | null;
  note: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TeamLineupRow {
  id: string;
  tournament_id: string;
  lineup_name: string;
  note: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at?: string | null;
}

export interface TeamLineupPlayerRow {
  id: string;
  team_lineup_id: string;
  player_id: string;
  position: string;
  line_order: number;
  created_at?: string | null;
}

export interface FitnessRecordRow {
  id: string;
  player_id: string;
  record_date: string;
  weight_kg: number | null;
  sprint_time_seconds: number | null;
  endurance_result: string | null;
  fitness_test_score: number | null;
  note: string | null;
  recorded_by: string | null;
  season_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InjuryRecordRow {
  id: string;
  player_id: string;
  injury_type: string;
  injury_date: string;
  recovery_status: "active" | "recovering" | "recovered" | string;
  expected_return_date: string | null;
  note: string | null;
  recorded_by: string | null;
  season_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ClubPageRow {
  id: string;
  page_key: "about" | "mission" | "values" | "contact" | string;
  title: string;
  content: string | null;
  image: string | null;
  status: "draft" | "published" | string;
  created_at: string | null;
  updated_at: string | null;
}

export interface AchievementRow {
  id: string;
  title: string;
  description: string | null;
  achievement_date: string;
  image: string | null;
  status: "draft" | "published" | string;
  created_at: string | null;
  updated_at: string | null;
}

export interface GalleryRow {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  status: "draft" | "published" | string;
  created_at: string | null;
  updated_at: string | null;
}

export interface GalleryImageRow {
  id: string;
  gallery_id: string;
  image_path: string;
  caption: string | null;
  created_at: string | null;
}

export interface PlayerWithProfileRow extends PlayerRow {
  profile?: ProfileRow | null;
  profiles?: ProfileRow | null;
}
