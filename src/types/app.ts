export type Role = "coach" | "manager" | "player";
export type Position = "Handler" | "Cutter" | "Hybrid" | "Defender";
export type AttendanceStatus = "Going" | "Maybe" | "Out" | "Attended" | "Absent" | "No response";
export type TrainingStatus = "Upcoming" | "Completed" | "Cancelled";
export type WorkoutStatus = "Active" | "Completed" | "Draft";
export type WorkoutTaskType = "Strength" | "Running" | "Conditioning" | "Skill" | "Recovery" | "Other";
export type TournamentStatus = "Draft" | "Upcoming" | "Completed" | "Cancelled";
export type TournamentRole = "main player" | "reserve" | "captain";
export type RecoveryStatus = "Active" | "Recovering" | "Recovered";
export type PublishStatus = "Published" | "Draft";
export type NotificationType = "training" | "workout" | "tournament" | "general";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  playerId?: string;
}

export interface Player {
  id: string;
  name: string;
  jersey: number;
  position: Position;
  email: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  height?: string;
  weight?: string;
  hand?: "Left" | "Right";
  experience?: string;
  bio?: string;
  profileImage?: string;
  attendance: number;
  score: number;
  assist: number;
  blocks: number;
  turnovers: number;
  injury?: RecoveryStatus | null;
  isPublic: boolean;
  avatarHue: number;
}

export interface TrainingSession {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  location: string;
  note?: string;
  status: TrainingStatus;
}

export interface AttendanceRecord {
  id: string;
  trainingId: string;
  playerId: string;
  response: AttendanceStatus;
  coachStatus?: AttendanceStatus;
  updatedAt: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  status: WorkoutStatus;
}

export interface WorkoutTask {
  id: string;
  planId: string;
  date: string;
  day: string;
  title: string;
  description: string;
  type: WorkoutTaskType;
}

export interface WorkoutAssignment {
  id: string;
  planId: string;
  playerId: string;
}

export interface WorkoutSubmission {
  id: string;
  taskId: string;
  planId: string;
  playerId: string;
  status: "done" | "not done";
  proofName?: string;
  note?: string;
  reviewed: boolean;
  submittedAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  start: string;
  end: string;
  description: string;
  status: TournamentStatus;
  result?: string;
}

export interface TournamentPlayer {
  id: string;
  tournamentId: string;
  playerId: string;
  role: TournamentRole;
}

export interface TournamentStats {
  id: string;
  tournamentId: string;
  playerId: string;
  score: number;
  assist: number;
  blocks: number;
  turnovers: number;
  gamesPlayed: number;
  note?: string;
}

export interface TeamLineupPlayer {
  id: string;
  playerId: string;
  position: string;
  lineOrder: number;
}

export interface TeamLineup {
  id: string;
  tournamentId: string;
  name: string;
  players: TeamLineupPlayer[];
  createdAt: string;
}

export interface FitnessRecord {
  id: string;
  playerId: string;
  date: string;
  weightKg: number;
  sprintSeconds: number;
  endurance: string;
  fitnessScore: number;
  note?: string;
}

export interface InjuryRecord {
  id: string;
  playerId: string;
  type: string;
  date: string;
  status: RecoveryStatus;
  expectedReturn?: string;
  note?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: NotificationType;
  read: boolean;
  targetRole: "all" | Role;
  relatedPath?: string;
}

export interface ClubPage {
  id: string;
  slug: "about" | "mission" | "values" | "contact";
  title: string;
  body: string;
  status: PublishStatus;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
  status: PublishStatus;
}

export interface Gallery {
  id: string;
  title: string;
  description: string;
  status: PublishStatus;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  galleryId: string;
  caption: string;
  fileName: string;
  date: string;
}

export interface AppData {
  players: Player[];
  trainingSessions: TrainingSession[];
  attendanceRecords: AttendanceRecord[];
  workoutPlans: WorkoutPlan[];
  workoutTasks: WorkoutTask[];
  workoutAssignments: WorkoutAssignment[];
  workoutSubmissions: WorkoutSubmission[];
  tournaments: Tournament[];
  tournamentPlayers: TournamentPlayer[];
  tournamentStats: TournamentStats[];
  teamLineups: TeamLineup[];
  fitnessRecords: FitnessRecord[];
  injuryRecords: InjuryRecord[];
  notifications: Notification[];
  clubPages: ClubPage[];
  achievements: Achievement[];
  galleries: Gallery[];
  galleryImages: GalleryImage[];
}
