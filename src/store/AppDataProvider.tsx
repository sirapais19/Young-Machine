import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { createId, initialData } from "@/data/initialData";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  achievementPayload,
  emptyAppData,
  fitnessPayload,
  fromAttendanceStatus,
  fromTournamentRole,
  galleryPayload,
  injuryPayload,
  mapAchievement,
  mapAttendance,
  mapClubPage,
  mapFitnessRecord,
  mapGallery,
  mapGalleryImage,
  mapInjuryRecord,
  mapLineups,
  mapNotification,
  mapPlayers,
  mapTournament,
  mapTournamentPlayer,
  mapTournamentStats,
  mapTrainingSession,
  mapWorkoutAssignment,
  mapWorkoutPlan,
  mapWorkoutSubmission,
  mapWorkoutTask,
  tournamentPayload,
  tournamentStatsPayload,
  trainingPayload,
  workoutPlanPayload,
  workoutTaskPayload,
} from "@/services/mappers";
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
  TeamLineup,
  Tournament,
  TournamentStats,
  TrainingSession,
  WorkoutPlan,
  WorkoutSubmission,
  WorkoutTask,
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
  ProfileRow,
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

type UpdateInput<T extends { id: string }> = Partial<T> & { id: string };
const DEFAULT_PLAYER_PASSWORD = "Player1234";

export interface AppDataContextValue {
  data: AppData;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  resetData: () => void;
  addPlayer: (player: Omit<Player, "id" | "attendance" | "score" | "assist" | "blocks" | "turnovers" | "avatarHue">) => Promise<Player>;
  updatePlayer: (player: UpdateInput<Player>) => void;
  deletePlayer: (playerId: string) => void;
  togglePlayerPublicProfile: (playerId: string) => void;
  addTraining: (training: Omit<TrainingSession, "id">) => TrainingSession;
  updateTraining: (training: UpdateInput<TrainingSession>) => void;
  deleteTraining: (trainingId: string) => void;
  cancelTraining: (trainingId: string) => void;
  submitAttendance: (trainingId: string, playerId: string, response: AttendanceStatus) => void;
  updateAttendanceByCoach: (trainingId: string, playerId: string, coachStatus: AttendanceStatus) => void;
  addWorkoutPlan: (plan: Omit<WorkoutPlan, "id">, tasks?: Omit<WorkoutTask, "id" | "planId">[], playerIds?: string[]) => WorkoutPlan;
  updateWorkoutPlan: (plan: UpdateInput<WorkoutPlan>) => void;
  deleteWorkoutPlan: (planId: string) => void;
  addWorkoutTask: (planId: string, task: Omit<WorkoutTask, "id" | "planId">) => WorkoutTask;
  updateWorkoutTask: (task: UpdateInput<WorkoutTask>) => void;
  deleteWorkoutTask: (taskId: string) => void;
  assignWorkoutPlayers: (planId: string, playerIds: string[]) => void;
  updateWorkoutAssignments: (planId: string, playerIds: string[]) => void;
  submitWorkoutTask: (submission: Omit<WorkoutSubmission, "id" | "submittedAt" | "reviewed">) => WorkoutSubmission;
  reviewWorkoutSubmission: (submissionId: string) => void;
  deleteWorkoutSubmission: (submissionId: string) => void;
  addTournament: (tournament: Omit<Tournament, "id">, playerIds?: string[]) => Tournament;
  updateTournament: (tournament: UpdateInput<Tournament>) => void;
  deleteTournament: (tournamentId: string) => void;
  selectTournamentPlayer: (tournamentId: string, playerId: string, role: "main player" | "reserve" | "captain") => void;
  removeTournamentPlayer: (tournamentId: string, playerId: string) => void;
  updateTournamentPlayerRole: (tournamentId: string, playerId: string, role: "main player" | "reserve" | "captain") => void;
  updateTournamentStats: (stats: Omit<TournamentStats, "id"> & { id?: string }) => void;
  deleteTournamentStats: (statsId: string) => void;
  createLineup: (lineup: Omit<TeamLineup, "id" | "createdAt">) => TeamLineup;
  updateLineup: (lineup: UpdateInput<TeamLineup>) => void;
  deleteLineup: (lineupId: string) => void;
  addFitnessRecord: (record: Omit<FitnessRecord, "id">) => FitnessRecord;
  updateFitnessRecord: (record: UpdateInput<FitnessRecord>) => void;
  deleteFitnessRecord: (recordId: string) => void;
  addInjuryRecord: (record: Omit<InjuryRecord, "id">) => InjuryRecord;
  updateInjuryRecord: (record: UpdateInput<InjuryRecord>) => void;
  deleteInjuryRecord: (recordId: string) => void;
  markNotificationRead: (notificationId: string, read?: boolean) => void;
  addNotification: (notification: Omit<Notification, "id" | "time" | "read">) => Notification;
  deleteNotification: (notificationId: string) => void;
  addAchievement: (achievement: Omit<Achievement, "id">) => Achievement;
  updateAchievement: (achievement: UpdateInput<Achievement>) => void;
  deleteAchievement: (achievementId: string) => void;
  addGallery: (gallery: Omit<Gallery, "id" | "createdAt">) => Gallery;
  updateGallery: (gallery: UpdateInput<Gallery>) => void;
  deleteGallery: (galleryId: string) => void;
  addGalleryImage: (image: Omit<GalleryImage, "id">) => GalleryImage;
  deleteGalleryImage: (imageId: string) => void;
  updateClubPage: (page: UpdateInput<ClubPage>) => void;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);

const makeId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return createId(prefix);
};

async function selectTable<T>(table: string, query = "*"): Promise<T[]> {
  const { data, error } = await supabase.from(table).select(query);
  if (error) {
    console.error(`Supabase read failed: ${table}`, error);
    toast.error(`Unable to load ${table.replaceAll("_", " ")}.`);
    return [];
  }
  return (data ?? []) as T[];
}

function getPlayerAccountErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("email") && lowerMessage.includes("invalid")) {
    return "Supabase Auth rejected this email address. Use a real deliverable email for the player login; the app is not checking the inbox, but Supabase validates the address before creating the account.";
  }

  if (lowerMessage.includes("already") && (lowerMessage.includes("registered") || lowerMessage.includes("exists"))) {
    return "A Supabase account already exists for this email. Use another email or connect this player to the existing account.";
  }

  return message || "Unable to create player account.";
}

async function createSupabasePlayerProfile(player: Pick<Player, "name" | "email">): Promise<ProfileRow> {
  const email = player.email.trim().toLowerCase();
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, status, avatar_url, created_at, updated_at")
    .eq("email", email)
    .eq("role", "player")
    .maybeSingle<ProfileRow>();

  if (existingError) throw existingError;
  if (existing) {
    await supabase.from("profiles").update({ full_name: player.name, email }).eq("id", existing.id).throwOnError();
    return { ...existing, full_name: player.name, email };
  }

  const { data: currentSession } = await supabase.auth.getSession();
  const previousSession = currentSession.session;

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: DEFAULT_PLAYER_PASSWORD,
    options: {
      data: {
        full_name: player.name,
        role: "player",
      },
    },
  });

  if (previousSession) {
    await supabase.auth.setSession({
      access_token: previousSession.access_token,
      refresh_token: previousSession.refresh_token,
    });
  } else if (authData.session) {
    await supabase.auth.signOut();
  }

  if (signUpError) throw new Error(getPlayerAccountErrorMessage(signUpError));
  if (!authData.user) throw new Error("Supabase did not return a user for the new player account.");

  const profile: ProfileRow = {
    id: authData.user.id,
    full_name: player.name,
    email,
    role: "player",
    status: "active",
    avatar_url: null,
    created_at: null,
    updated_at: null,
  };

  await supabase
    .from("profiles")
    .upsert({
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      role: profile.role,
      status: profile.status,
      avatar_url: profile.avatar_url,
    })
    .throwOnError();

  return profile;
}

async function hydratePlayerProfiles(rows: PlayerWithProfileRow[]) {
  const missingProfileIds = Array.from(
    new Set(
      rows
        .filter((row) => !(row.profile ?? row.profiles)?.full_name && row.user_id)
        .map((row) => row.user_id as string),
    ),
  );

  if (!missingProfileIds.length) return rows;

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, status, avatar_url, created_at, updated_at")
    .in("id", missingProfileIds);

  if (error) {
    console.warn("Unable to hydrate player profile names.", error);
    return rows;
  }

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile as ProfileRow]));
  return rows.map((row) => ({
    ...row,
    profile: row.profile ?? row.profiles ?? (row.user_id ? profileById.get(row.user_id) ?? null : null),
  }));
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { currentUser, isLoadingAuth } = useAuth();
  const [data, setData] = useState<AppData>(hasSupabaseEnv ? emptyAppData() : initialData);
  const [isLoadingData, setIsLoadingData] = useState(hasSupabaseEnv);

  const refreshData = useCallback(async () => {
    if (!hasSupabaseEnv) {
      setData(initialData);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    try {
      const publicOnly = !currentUser;
      const playerQuery = "*, profile:profiles(id, full_name, email, role, status, avatar_url, created_at, updated_at)";
      const playersRequest = publicOnly
        ? supabase.from("players").select(playerQuery).eq("is_public_profile", true)
        : supabase.from("players").select(playerQuery);

      const [
        playersResult,
        trainingRows,
        attendanceRows,
        notificationRows,
        workoutPlanRows,
        workoutTaskRows,
        workoutAssignmentRows,
        workoutSubmissionRows,
        tournamentRowsRaw,
        tournamentPlayerRows,
        tournamentStatsRows,
        lineupRows,
        lineupPlayerRows,
        fitnessRows,
        injuryRows,
        clubPageRowsRaw,
        achievementRowsRaw,
        galleryRowsRaw,
        galleryImageRows,
      ] = await Promise.all([
        playersRequest,
        publicOnly ? Promise.resolve([] as TrainingSessionRow[]) : selectTable<TrainingSessionRow>("training_sessions"),
        publicOnly ? Promise.resolve([] as TrainingAttendanceRow[]) : selectTable<TrainingAttendanceRow>("training_attendance"),
        publicOnly ? Promise.resolve([] as NotificationRow[]) : selectTable<NotificationRow>("notifications"),
        publicOnly ? Promise.resolve([] as WorkoutPlanRow[]) : selectTable<WorkoutPlanRow>("workout_plans"),
        publicOnly ? Promise.resolve([] as WorkoutTaskRow[]) : selectTable<WorkoutTaskRow>("workout_tasks"),
        publicOnly ? Promise.resolve([] as WorkoutAssignmentRow[]) : selectTable<WorkoutAssignmentRow>("workout_assignments"),
        publicOnly ? Promise.resolve([] as WorkoutSubmissionRow[]) : selectTable<WorkoutSubmissionRow>("workout_task_submissions"),
        selectTable<TournamentRow>("tournaments"),
        publicOnly ? Promise.resolve([] as TournamentPlayerRow[]) : selectTable<TournamentPlayerRow>("tournament_players"),
        publicOnly ? Promise.resolve([] as TournamentPlayerStatsRow[]) : selectTable<TournamentPlayerStatsRow>("tournament_player_stats"),
        publicOnly ? Promise.resolve([] as TeamLineupRow[]) : selectTable<TeamLineupRow>("team_lineups"),
        publicOnly ? Promise.resolve([] as TeamLineupPlayerRow[]) : selectTable<TeamLineupPlayerRow>("team_lineup_players"),
        publicOnly ? Promise.resolve([] as FitnessRecordRow[]) : selectTable<FitnessRecordRow>("fitness_records"),
        publicOnly ? Promise.resolve([] as InjuryRecordRow[]) : selectTable<InjuryRecordRow>("injury_records"),
        selectTable<ClubPageRow>("club_pages"),
        selectTable<AchievementRow>("achievements"),
        selectTable<GalleryRow>("galleries"),
        selectTable<GalleryImageRow>("gallery_images"),
      ]);

      if (playersResult.error) throw playersResult.error;

      const tournamentRows = publicOnly ? tournamentRowsRaw.filter((row) => row.status === "upcoming" || row.status === "completed") : tournamentRowsRaw;
      const clubPageRows = publicOnly ? clubPageRowsRaw.filter((row) => row.status === "published") : clubPageRowsRaw;
      const achievementRows = publicOnly ? achievementRowsRaw.filter((row) => row.status === "published") : achievementRowsRaw;
      const galleryRows = publicOnly ? galleryRowsRaw.filter((row) => row.status === "published") : galleryRowsRaw;
      const galleryIds = new Set(galleryRows.map((row) => row.id));
      const completedTrainingCount = trainingRows.filter((row) => row.status === "completed").length;
      const taskToPlan = new Map(workoutTaskRows.map((row) => [row.id, row.workout_plan_id]));
      const playerRows = await hydratePlayerProfiles((playersResult.data ?? []) as PlayerWithProfileRow[]);

      setData({
        players: mapPlayers(playerRows, tournamentStatsRows, attendanceRows, completedTrainingCount),
        trainingSessions: trainingRows.map(mapTrainingSession),
        attendanceRecords: attendanceRows.map(mapAttendance),
        notifications: notificationRows.map(mapNotification),
        workoutPlans: workoutPlanRows.map(mapWorkoutPlan),
        workoutTasks: workoutTaskRows.map(mapWorkoutTask),
        workoutAssignments: workoutAssignmentRows.map(mapWorkoutAssignment),
        workoutSubmissions: workoutSubmissionRows.map((row) => mapWorkoutSubmission(row, taskToPlan)),
        tournaments: tournamentRows.map(mapTournament),
        tournamentPlayers: tournamentPlayerRows.map(mapTournamentPlayer),
        tournamentStats: tournamentStatsRows.map(mapTournamentStats),
        teamLineups: mapLineups(lineupRows, lineupPlayerRows),
        fitnessRecords: fitnessRows.map(mapFitnessRecord),
        injuryRecords: injuryRows.map(mapInjuryRecord),
        clubPages: clubPageRows.map(mapClubPage),
        achievements: achievementRows.map(mapAchievement),
        galleries: galleryRows.map(mapGallery),
        galleryImages: galleryImageRows.filter((row) => !publicOnly || galleryIds.has(row.gallery_id)).map(mapGalleryImage),
      });
    } catch (error) {
      console.error("Unable to refresh Supabase data", error);
      toast.error(error instanceof Error ? error.message : "Unable to refresh Supabase data.");
      setData((current) => (current.players.length ? current : initialData));
    } finally {
      setIsLoadingData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isLoadingAuth) void refreshData();
  }, [isLoadingAuth, refreshData]);

  const runWrite = useCallback(
    async (label: string, writer: () => Promise<void>) => {
      if (!hasSupabaseEnv) return;
      try {
        await writer();
        await refreshData();
      } catch (error) {
        console.error(label, error);
        toast.error(error instanceof Error ? error.message : label);
        await refreshData();
      }
    },
    [refreshData],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      isLoadingData,
      refreshData,
      resetData: () => void refreshData(),
      addPlayer: async (player) => {
        const created: Player = { ...player, id: makeId("p"), attendance: 0, score: 0, assist: 0, blocks: 0, turnovers: 0, avatarHue: 200 };

        if (!hasSupabaseEnv) {
          setData((current) => ({ ...current, players: [created, ...current.players] }));
          return created;
        }

        try {
          const profile = await createSupabasePlayerProfile(player);
          await supabase
            .from("players")
            .insert({
              id: created.id,
              user_id: profile.id,
              jersey_no: player.jersey,
              date_of_birth: player.dateOfBirth || null,
              gender: player.gender ?? null,
              height_cm: player.height ? Number(player.height) : null,
              weight_kg: player.weight ? Number(player.weight) : null,
              position: player.position,
              dominant_hand: player.hand ?? null,
              experience_level: player.experience ?? null,
              profile_photo: player.profileImage ?? null,
              bio: player.bio ?? null,
              is_public_profile: player.isPublic,
            })
            .throwOnError();

          setData((current) => ({ ...current, players: [created, ...current.players] }));
          await refreshData();
          return created;
        } catch (error) {
          console.error("Unable to add player.", error);
          await refreshData();
          throw error;
        }
      },
      updatePlayer: (player) => {
        setData((current) => ({ ...current, players: current.players.map((item) => (item.id === player.id ? { ...item, ...player } : item)) }));
        void runWrite("Unable to update player.", async () => {
          const existing = data.players.find((item) => item.id === player.id);
          await supabase
            .from("players")
            .update({
              jersey_no: player.jersey,
              date_of_birth: player.dateOfBirth,
              gender: player.gender,
              height_cm: player.height ? Number(player.height) : null,
              weight_kg: player.weight ? Number(player.weight) : null,
              position: player.position,
              dominant_hand: player.hand,
              experience_level: player.experience,
              profile_photo: player.profileImage,
              bio: player.bio,
              is_public_profile: player.isPublic,
            })
            .eq("id", player.id)
            .throwOnError();
          if ((player.name && player.name !== existing?.name) || (player.email && player.email !== existing?.email)) {
            const { data: row } = await supabase.from("players").select("user_id").eq("id", player.id).maybeSingle<{ user_id: string }>();
            if (row?.user_id) await supabase.from("profiles").update({ full_name: player.name, email: player.email }).eq("id", row.user_id).throwOnError();
          }
        });
      },
      deletePlayer: (playerId) => {
        setData((current) => ({ ...current, players: current.players.filter((player) => player.id !== playerId) }));
        void runWrite("Unable to delete player.", async () => {
          await supabase.from("players").delete().eq("id", playerId).throwOnError();
        });
      },
      togglePlayerPublicProfile: (playerId) => {
        const player = data.players.find((item) => item.id === playerId);
        setData((current) => ({ ...current, players: current.players.map((item) => (item.id === playerId ? { ...item, isPublic: !item.isPublic } : item)) }));
        void runWrite("Unable to update public profile.", async () => {
          await supabase.from("players").update({ is_public_profile: !player?.isPublic }).eq("id", playerId).throwOnError();
        });
      },
      addTraining: (training) => {
        const created: TrainingSession = { ...training, id: makeId("training") };
        const attendance = data.players.map((player) => ({ id: makeId("att"), trainingId: created.id, playerId: player.id, response: "No response" as AttendanceStatus, updatedAt: new Date().toISOString() }));
        setData((current) => ({ ...current, trainingSessions: [created, ...current.trainingSessions], attendanceRecords: [...attendance, ...current.attendanceRecords] }));
        void runWrite("Unable to add training.", async () => {
          await supabase.from("training_sessions").insert({ id: created.id, ...trainingPayload(created), created_by: currentUser?.id ?? null }).throwOnError();
          if (data.players.length) {
            await supabase
              .from("training_attendance")
              .insert(data.players.map((player) => ({ id: makeId("att"), training_session_id: created.id, player_id: player.id, attendance_status: "maybe" })))
              .throwOnError();
          }
        });
        return created;
      },
      updateTraining: (training) => {
        setData((current) => ({ ...current, trainingSessions: current.trainingSessions.map((item) => (item.id === training.id ? { ...item, ...training } : item)) }));
        void runWrite("Unable to update training.", async () => {
          await supabase.from("training_sessions").update(trainingPayload(training)).eq("id", training.id).throwOnError();
        });
      },
      deleteTraining: (trainingId) => {
        setData((current) => ({ ...current, trainingSessions: current.trainingSessions.filter((training) => training.id !== trainingId), attendanceRecords: current.attendanceRecords.filter((record) => record.trainingId !== trainingId) }));
        void runWrite("Unable to delete training.", async () => {
          await supabase.from("training_sessions").delete().eq("id", trainingId).throwOnError();
        });
      },
      cancelTraining: (trainingId) => {
        setData((current) => ({ ...current, trainingSessions: current.trainingSessions.map((training) => (training.id === trainingId ? { ...training, status: "Cancelled" } : training)) }));
        void runWrite("Unable to cancel training.", async () => {
          await supabase.from("training_sessions").update({ status: "cancelled" }).eq("id", trainingId).throwOnError();
        });
      },
      submitAttendance: (trainingId, playerId, response) => {
        const updatedAt = new Date().toISOString();
        setData((current) => ({ ...current, attendanceRecords: upsertAttendance(current.attendanceRecords, trainingId, playerId, { response, updatedAt }) }));
        void runWrite("Unable to submit attendance.", async () => {
          await supabase
            .from("training_attendance")
            .upsert({ training_session_id: trainingId, player_id: playerId, attendance_status: fromAttendanceStatus(response), updated_at: updatedAt }, { onConflict: "training_session_id,player_id" })
            .throwOnError();
        });
      },
      updateAttendanceByCoach: (trainingId, playerId, coachStatus) => {
        const updatedAt = new Date().toISOString();
        setData((current) => ({ ...current, attendanceRecords: upsertAttendance(current.attendanceRecords, trainingId, playerId, { coachStatus, response: coachStatus, updatedAt }) }));
        void runWrite("Unable to update attendance.", async () => {
          await supabase
            .from("training_attendance")
            .upsert({ training_session_id: trainingId, player_id: playerId, attendance_status: fromAttendanceStatus(coachStatus), updated_at: updatedAt }, { onConflict: "training_session_id,player_id" })
            .throwOnError();
        });
      },
      addWorkoutPlan: (plan, tasks = [], playerIds = []) => {
        const created: WorkoutPlan = { ...plan, id: makeId("wp") };
        const createdTasks = tasks.map((task) => ({ ...task, id: makeId("wt"), planId: created.id }));
        const assignments = playerIds.map((playerId) => ({ id: makeId("wa"), planId: created.id, playerId }));
        setData((current) => ({ ...current, workoutPlans: [created, ...current.workoutPlans], workoutTasks: [...createdTasks, ...current.workoutTasks], workoutAssignments: [...assignments, ...current.workoutAssignments] }));
        void runWrite("Unable to add workout.", async () => {
          await supabase.from("workout_plans").insert({ id: created.id, ...workoutPlanPayload(created), assigned_by: currentUser?.id ?? null }).throwOnError();
          if (createdTasks.length) await supabase.from("workout_tasks").insert(createdTasks.map((task) => ({ id: task.id, ...workoutTaskPayload(task) }))).throwOnError();
          if (assignments.length) await supabase.from("workout_assignments").insert(assignments.map((assignment) => ({ id: assignment.id, workout_plan_id: assignment.planId, player_id: assignment.playerId }))).throwOnError();
        });
        return created;
      },
      updateWorkoutPlan: (plan) => {
        setData((current) => ({ ...current, workoutPlans: current.workoutPlans.map((item) => (item.id === plan.id ? { ...item, ...plan } : item)) }));
        void runWrite("Unable to update workout.", async () => {
          await supabase.from("workout_plans").update(workoutPlanPayload(plan)).eq("id", plan.id).throwOnError();
        });
      },
      deleteWorkoutPlan: (planId) => {
        setData((current) => ({ ...current, workoutPlans: current.workoutPlans.filter((plan) => plan.id !== planId) }));
        void runWrite("Unable to delete workout.", async () => {
          await supabase.from("workout_plans").delete().eq("id", planId).throwOnError();
        });
      },
      addWorkoutTask: (planId, task) => {
        const created: WorkoutTask = { ...task, id: makeId("wt"), planId };
        setData((current) => ({ ...current, workoutTasks: [created, ...current.workoutTasks] }));
        void runWrite("Unable to add workout task.", async () => {
          await supabase.from("workout_tasks").insert({ id: created.id, ...workoutTaskPayload(created, planId) }).throwOnError();
        });
        return created;
      },
      updateWorkoutTask: (task) => {
        setData((current) => ({ ...current, workoutTasks: current.workoutTasks.map((item) => (item.id === task.id ? { ...item, ...task } : item)) }));
        void runWrite("Unable to update workout task.", async () => {
          await supabase.from("workout_tasks").update(workoutTaskPayload(task)).eq("id", task.id).throwOnError();
        });
      },
      deleteWorkoutTask: (taskId) => {
        setData((current) => ({ ...current, workoutTasks: current.workoutTasks.filter((task) => task.id !== taskId) }));
        void runWrite("Unable to delete workout task.", async () => {
          await supabase.from("workout_tasks").delete().eq("id", taskId).throwOnError();
        });
      },
      assignWorkoutPlayers: (planId, playerIds) => replaceWorkoutAssignments(planId, playerIds),
      updateWorkoutAssignments: (planId, playerIds) => replaceWorkoutAssignments(planId, playerIds),
      submitWorkoutTask: (submission) => {
        const created: WorkoutSubmission = { ...submission, id: makeId("sub"), reviewed: false, submittedAt: new Date().toISOString() };
        setData((current) => ({ ...current, workoutSubmissions: [created, ...current.workoutSubmissions.filter((item) => !(item.taskId === submission.taskId && item.playerId === submission.playerId))] }));
        void runWrite("Unable to submit workout task.", async () => {
          await supabase
            .from("workout_task_submissions")
            .upsert({ id: created.id, workout_task_id: submission.taskId, player_id: submission.playerId, status: submission.status === "not done" ? "not_done" : "done", proof_image: submission.proofName ?? null, note: submission.note ?? null, submitted_at: created.submittedAt }, { onConflict: "workout_task_id,player_id" })
            .throwOnError();
        });
        return created;
      },
      reviewWorkoutSubmission: (submissionId) => {
        setData((current) => ({ ...current, workoutSubmissions: current.workoutSubmissions.map((item) => (item.id === submissionId ? { ...item, reviewed: true } : item)) }));
      },
      deleteWorkoutSubmission: (submissionId) => {
        setData((current) => ({ ...current, workoutSubmissions: current.workoutSubmissions.filter((submission) => submission.id !== submissionId) }));
        void runWrite("Unable to delete submission.", async () => {
          await supabase.from("workout_task_submissions").delete().eq("id", submissionId).throwOnError();
        });
      },
      addTournament: (tournament, playerIds = []) => {
        const created: Tournament = { ...tournament, id: makeId("tr") };
        const selected = playerIds.map((playerId) => ({ id: makeId("tp"), tournamentId: created.id, playerId, role: "main player" as const }));
        setData((current) => ({ ...current, tournaments: [created, ...current.tournaments], tournamentPlayers: [...selected, ...current.tournamentPlayers] }));
        void runWrite("Unable to add tournament.", async () => {
          await supabase.from("tournaments").insert({ id: created.id, ...tournamentPayload(created) }).throwOnError();
          if (selected.length) await supabase.from("tournament_players").insert(selected.map((row) => ({ id: row.id, tournament_id: row.tournamentId, player_id: row.playerId, role: fromTournamentRole(row.role) }))).throwOnError();
        });
        return created;
      },
      updateTournament: (tournament) => {
        setData((current) => ({ ...current, tournaments: current.tournaments.map((item) => (item.id === tournament.id ? { ...item, ...tournament } : item)) }));
        void runWrite("Unable to update tournament.", async () => {
          await supabase.from("tournaments").update(tournamentPayload(tournament)).eq("id", tournament.id).throwOnError();
        });
      },
      deleteTournament: (tournamentId) => {
        setData((current) => ({ ...current, tournaments: current.tournaments.filter((tournament) => tournament.id !== tournamentId) }));
        void runWrite("Unable to delete tournament.", async () => {
          await supabase.from("tournaments").delete().eq("id", tournamentId).throwOnError();
        });
      },
      selectTournamentPlayer: (tournamentId, playerId, role) => {
        const id = makeId("tp");
        setData((current) => {
          const exists = current.tournamentPlayers.some((item) => item.tournamentId === tournamentId && item.playerId === playerId);
          return { ...current, tournamentPlayers: exists ? current.tournamentPlayers.map((item) => (item.tournamentId === tournamentId && item.playerId === playerId ? { ...item, role } : item)) : [{ id, tournamentId, playerId, role }, ...current.tournamentPlayers] };
        });
        void runWrite("Unable to select tournament player.", async () => {
          await supabase.from("tournament_players").upsert({ id, tournament_id: tournamentId, player_id: playerId, role: fromTournamentRole(role) }, { onConflict: "tournament_id,player_id" }).throwOnError();
        });
      },
      removeTournamentPlayer: (tournamentId, playerId) => {
        setData((current) => ({ ...current, tournamentPlayers: current.tournamentPlayers.filter((item) => !(item.tournamentId === tournamentId && item.playerId === playerId)) }));
        void runWrite("Unable to remove tournament player.", async () => {
          await supabase.from("tournament_players").delete().eq("tournament_id", tournamentId).eq("player_id", playerId).throwOnError();
        });
      },
      updateTournamentPlayerRole: (tournamentId, playerId, role) => {
        setData((current) => ({ ...current, tournamentPlayers: current.tournamentPlayers.map((item) => (item.tournamentId === tournamentId && item.playerId === playerId ? { ...item, role } : item)) }));
        void runWrite("Unable to update tournament role.", async () => {
          await supabase.from("tournament_players").update({ role: fromTournamentRole(role) }).eq("tournament_id", tournamentId).eq("player_id", playerId).throwOnError();
        });
      },
      updateTournamentStats: (stats) => {
        const id = stats.id ?? makeId("ts");
        const next: TournamentStats = { id, tournamentId: stats.tournamentId, playerId: stats.playerId, score: stats.score, assist: stats.assist, blocks: stats.blocks, turnovers: stats.turnovers, gamesPlayed: stats.gamesPlayed, note: stats.note };
        setData((current) => ({ ...current, tournamentStats: current.tournamentStats.some((item) => item.id === id) ? current.tournamentStats.map((item) => (item.id === id ? next : item)) : [next, ...current.tournamentStats] }));
        void runWrite("Unable to update stats.", async () => {
          await supabase.from("tournament_player_stats").upsert({ id, ...tournamentStatsPayload(next) }, { onConflict: "tournament_id,player_id" }).throwOnError();
        });
      },
      deleteTournamentStats: (statsId) => {
        setData((current) => ({ ...current, tournamentStats: current.tournamentStats.filter((stats) => stats.id !== statsId) }));
        void runWrite("Unable to delete stats.", async () => {
          await supabase.from("tournament_player_stats").delete().eq("id", statsId).throwOnError();
        });
      },
      createLineup: (lineup) => {
        const created: TeamLineup = { ...lineup, id: makeId("lineup"), createdAt: new Date().toISOString() };
        setData((current) => ({ ...current, teamLineups: [created, ...current.teamLineups] }));
        void runWrite("Unable to create lineup.", async () => {
          await supabase.from("team_lineups").insert({ id: created.id, tournament_id: created.tournamentId, lineup_name: created.name, note: created.notes ?? "", created_by: currentUser?.id ?? null }).throwOnError();
          if (created.players.length) await supabase.from("team_lineup_players").insert(created.players.map((row) => ({ id: row.id || makeId("lp"), team_lineup_id: created.id, player_id: row.playerId, position: row.position, line_order: row.lineOrder }))).throwOnError();
        });
        return created;
      },
      updateLineup: (lineup) => {
        setData((current) => ({ ...current, teamLineups: current.teamLineups.map((item) => (item.id === lineup.id ? { ...item, ...lineup } : item)) }));
        void runWrite("Unable to update lineup.", async () => {
          await supabase.from("team_lineups").update({ lineup_name: lineup.name, note: lineup.notes ?? "" }).eq("id", lineup.id).throwOnError();
          if (lineup.players) {
            await supabase.from("team_lineup_players").delete().eq("team_lineup_id", lineup.id).throwOnError();
            await supabase.from("team_lineup_players").insert(lineup.players.map((row) => ({ id: row.id || makeId("lp"), team_lineup_id: lineup.id, player_id: row.playerId, position: row.position, line_order: row.lineOrder }))).throwOnError();
          }
        });
      },
      deleteLineup: (lineupId) => {
        setData((current) => ({ ...current, teamLineups: current.teamLineups.filter((lineup) => lineup.id !== lineupId) }));
        void runWrite("Unable to delete lineup.", async () => {
          await supabase.from("team_lineups").delete().eq("id", lineupId).throwOnError();
        });
      },
      addFitnessRecord: (record) => {
        const created: FitnessRecord = { ...record, id: makeId("fit") };
        setData((current) => ({ ...current, fitnessRecords: [created, ...current.fitnessRecords] }));
        void runWrite("Unable to add fitness record.", async () => {
          await supabase.from("fitness_records").insert({ id: created.id, ...fitnessPayload(created), recorded_by: currentUser?.id ?? null }).throwOnError();
        });
        return created;
      },
      updateFitnessRecord: (record) => {
        setData((current) => ({ ...current, fitnessRecords: current.fitnessRecords.map((item) => (item.id === record.id ? { ...item, ...record } : item)) }));
        void runWrite("Unable to update fitness record.", async () => {
          await supabase.from("fitness_records").update(fitnessPayload(record)).eq("id", record.id).throwOnError();
        });
      },
      deleteFitnessRecord: (recordId) => {
        setData((current) => ({ ...current, fitnessRecords: current.fitnessRecords.filter((record) => record.id !== recordId) }));
        void runWrite("Unable to delete fitness record.", async () => {
          await supabase.from("fitness_records").delete().eq("id", recordId).throwOnError();
        });
      },
      addInjuryRecord: (record) => {
        const created: InjuryRecord = { ...record, id: makeId("inj") };
        setData((current) => ({ ...current, injuryRecords: [created, ...current.injuryRecords] }));
        void runWrite("Unable to add injury record.", async () => {
          await supabase.from("injury_records").insert({ id: created.id, ...injuryPayload(created), recorded_by: currentUser?.id ?? null }).throwOnError();
        });
        return created;
      },
      updateInjuryRecord: (record) => {
        setData((current) => ({ ...current, injuryRecords: current.injuryRecords.map((item) => (item.id === record.id ? { ...item, ...record } : item)) }));
        void runWrite("Unable to update injury record.", async () => {
          await supabase.from("injury_records").update(injuryPayload(record)).eq("id", record.id).throwOnError();
        });
      },
      deleteInjuryRecord: (recordId) => {
        setData((current) => ({ ...current, injuryRecords: current.injuryRecords.filter((record) => record.id !== recordId) }));
        void runWrite("Unable to delete injury record.", async () => {
          await supabase.from("injury_records").delete().eq("id", recordId).throwOnError();
        });
      },
      markNotificationRead: (notificationId, read = true) => {
        setData((current) => ({ ...current, notifications: current.notifications.map((item) => (item.id === notificationId ? { ...item, read } : item)) }));
        void runWrite("Unable to update notification.", async () => {
          await supabase.from("notifications").update({ is_read: read }).eq("id", notificationId).throwOnError();
        });
      },
      addNotification: (notification) => {
        const created: Notification = { ...notification, id: makeId("note"), time: "Just now", read: false };
        setData((current) => ({ ...current, notifications: [created, ...current.notifications] }));
        void runWrite("Unable to add notification.", async () => {
          await supabase.from("notifications").insert({ id: created.id, user_id: null, title: created.title, message: created.body, type: created.type, related_id: null, is_read: false }).throwOnError();
        });
        return created;
      },
      deleteNotification: (notificationId) => {
        setData((current) => ({ ...current, notifications: current.notifications.filter((notification) => notification.id !== notificationId) }));
        void runWrite("Unable to delete notification.", async () => {
          await supabase.from("notifications").delete().eq("id", notificationId).throwOnError();
        });
      },
      addAchievement: (achievement) => {
        const created: Achievement = { ...achievement, id: makeId("ach") };
        setData((current) => ({ ...current, achievements: [created, ...current.achievements] }));
        void runWrite("Unable to add achievement.", async () => {
          await supabase.from("achievements").insert({ id: created.id, ...achievementPayload(created) }).throwOnError();
        });
        return created;
      },
      updateAchievement: (achievement) => {
        setData((current) => ({ ...current, achievements: current.achievements.map((item) => (item.id === achievement.id ? { ...item, ...achievement } : item)) }));
        void runWrite("Unable to update achievement.", async () => {
          await supabase.from("achievements").update(achievementPayload(achievement)).eq("id", achievement.id).throwOnError();
        });
      },
      deleteAchievement: (achievementId) => {
        setData((current) => ({ ...current, achievements: current.achievements.filter((item) => item.id !== achievementId) }));
        void runWrite("Unable to delete achievement.", async () => {
          await supabase.from("achievements").delete().eq("id", achievementId).throwOnError();
        });
      },
      addGallery: (gallery) => {
        const created: Gallery = { ...gallery, id: makeId("gal"), createdAt: new Date().toISOString() };
        setData((current) => ({ ...current, galleries: [created, ...current.galleries] }));
        void runWrite("Unable to add gallery.", async () => {
          await supabase.from("galleries").insert({ id: created.id, ...galleryPayload(created) }).throwOnError();
        });
        return created;
      },
      updateGallery: (gallery) => {
        setData((current) => ({ ...current, galleries: current.galleries.map((item) => (item.id === gallery.id ? { ...item, ...gallery } : item)) }));
        void runWrite("Unable to update gallery.", async () => {
          await supabase.from("galleries").update(galleryPayload(gallery)).eq("id", gallery.id).throwOnError();
        });
      },
      deleteGallery: (galleryId) => {
        setData((current) => ({ ...current, galleries: current.galleries.filter((gallery) => gallery.id !== galleryId) }));
        void runWrite("Unable to delete gallery.", async () => {
          await supabase.from("galleries").delete().eq("id", galleryId).throwOnError();
        });
      },
      addGalleryImage: (image) => {
        const created: GalleryImage = { ...image, id: makeId("img") };
        setData((current) => ({ ...current, galleryImages: [created, ...current.galleryImages] }));
        void runWrite("Unable to add gallery image.", async () => {
          await supabase.from("gallery_images").insert({ id: created.id, gallery_id: created.galleryId, image_path: created.fileName, caption: created.caption }).throwOnError();
        });
        return created;
      },
      deleteGalleryImage: (imageId) => {
        setData((current) => ({ ...current, galleryImages: current.galleryImages.filter((image) => image.id !== imageId) }));
        void runWrite("Unable to delete gallery image.", async () => {
          await supabase.from("gallery_images").delete().eq("id", imageId).throwOnError();
        });
      },
      updateClubPage: (page) => {
        setData((current) => ({ ...current, clubPages: current.clubPages.map((item) => (item.id === page.id ? { ...item, ...page } : item)) }));
        void runWrite("Unable to update page.", async () => {
          await supabase.from("club_pages").update({ title: page.title, content: page.body, status: page.status ? page.status.toLowerCase() : undefined }).eq("id", page.id).throwOnError();
        });
      },
    }),
    [currentUser?.id, data, isLoadingData, refreshData, runWrite],
  );

  function replaceWorkoutAssignments(planId: string, playerIds: string[]) {
    const assignments = playerIds.map((playerId) => ({ id: makeId("wa"), planId, playerId }));
    setData((current) => ({ ...current, workoutAssignments: [...current.workoutAssignments.filter((assignment) => assignment.planId !== planId), ...assignments] }));
    void runWrite("Unable to assign workout players.", async () => {
      await supabase.from("workout_assignments").delete().eq("workout_plan_id", planId).throwOnError();
      if (assignments.length) await supabase.from("workout_assignments").insert(assignments.map((assignment) => ({ id: assignment.id, workout_plan_id: planId, player_id: assignment.playerId }))).throwOnError();
    });
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

function upsertAttendance(
  records: AttendanceRecord[],
  trainingId: string,
  playerId: string,
  patch: Partial<AttendanceRecord>,
): AttendanceRecord[] {
  const exists = records.some((record) => record.trainingId === trainingId && record.playerId === playerId);
  if (!exists) {
    return [
      {
        id: makeId("att"),
        trainingId,
        playerId,
        response: "No response",
        updatedAt: new Date().toISOString(),
        ...patch,
      },
      ...records,
    ];
  }

  return records.map((record) => (record.trainingId === trainingId && record.playerId === playerId ? { ...record, ...patch } : record));
}
