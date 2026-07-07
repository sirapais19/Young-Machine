import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createId, initialData } from "@/data/initialData";
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

const STORAGE_KEY = "ym-app-data-v1";

type UpdateInput<T extends { id: string }> = Partial<T> & { id: string };

export interface AppDataContextValue {
  data: AppData;
  resetData: () => void;
  addPlayer: (player: Omit<Player, "id" | "attendance" | "score" | "assist" | "blocks" | "turnovers" | "avatarHue">) => Player;
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

function loadData(): AppData {
  if (typeof window === "undefined") return initialData;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialData;
  try {
    return { ...initialData, ...JSON.parse(raw) };
  } catch {
    return initialData;
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const mutate = useCallback((updater: (current: AppData) => AppData) => {
    setData((current) => updater(current));
  }, []);

  const resetData = useCallback(() => {
    setData(initialData);
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "time" | "read">) => {
      const created: Notification = {
        ...notification,
        id: createId("note"),
        time: "Just now",
        read: false,
      };
      mutate((current) => ({ ...current, notifications: [created, ...current.notifications] }));
      return created;
    },
    [mutate],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      resetData,
      addPlayer: (player) => {
        const created: Player = {
          ...player,
          id: createId("p"),
          attendance: 0,
          score: 0,
          assist: 0,
          blocks: 0,
          turnovers: 0,
          avatarHue: 180 + Math.floor(Math.random() * 45),
        };
        mutate((current) => ({ ...current, players: [created, ...current.players] }));
        return created;
      },
      updatePlayer: (player) => {
        mutate((current) => ({
          ...current,
          players: current.players.map((item) => (item.id === player.id ? { ...item, ...player } : item)),
        }));
      },
      deletePlayer: (playerId) => {
        mutate((current) => ({
          ...current,
          players: current.players.filter((player) => player.id !== playerId),
          attendanceRecords: current.attendanceRecords.filter((record) => record.playerId !== playerId),
          workoutAssignments: current.workoutAssignments.filter((assignment) => assignment.playerId !== playerId),
          tournamentPlayers: current.tournamentPlayers.filter((item) => item.playerId !== playerId),
        }));
      },
      togglePlayerPublicProfile: (playerId) => {
        mutate((current) => ({
          ...current,
          players: current.players.map((player) => (player.id === playerId ? { ...player, isPublic: !player.isPublic } : player)),
        }));
      },
      addTraining: (training) => {
        const created: TrainingSession = { ...training, id: createId("t") };
        mutate((current) => ({
          ...current,
          trainingSessions: [created, ...current.trainingSessions],
          attendanceRecords: [
            ...current.players.map((player) => ({
              id: createId("att"),
              trainingId: created.id,
              playerId: player.id,
              response: "No response" as AttendanceStatus,
              updatedAt: new Date().toISOString(),
            })),
            ...current.attendanceRecords,
          ],
          notifications: [
            {
              id: createId("note"),
              title: "New training scheduled",
              body: `${created.title} | ${created.location}`,
              time: "Just now",
              type: "training",
              read: false,
              targetRole: "player",
              relatedPath: "/player/training",
            },
            ...current.notifications,
          ],
        }));
        return created;
      },
      updateTraining: (training) => {
        mutate((current) => ({
          ...current,
          trainingSessions: current.trainingSessions.map((item) => (item.id === training.id ? { ...item, ...training } : item)),
        }));
      },
      deleteTraining: (trainingId) => {
        mutate((current) => ({
          ...current,
          trainingSessions: current.trainingSessions.filter((training) => training.id !== trainingId),
          attendanceRecords: current.attendanceRecords.filter((record) => record.trainingId !== trainingId),
        }));
      },
      cancelTraining: (trainingId) => {
        mutate((current) => ({
          ...current,
          trainingSessions: current.trainingSessions.map((training) =>
            training.id === trainingId ? { ...training, status: "Cancelled" } : training,
          ),
        }));
      },
      submitAttendance: (trainingId, playerId, response) => {
        mutate((current) => ({
          ...current,
          attendanceRecords: upsertAttendance(current.attendanceRecords, trainingId, playerId, { response }),
        }));
      },
      updateAttendanceByCoach: (trainingId, playerId, coachStatus) => {
        mutate((current) => ({
          ...current,
          attendanceRecords: upsertAttendance(current.attendanceRecords, trainingId, playerId, { coachStatus }),
        }));
      },
      addWorkoutPlan: (plan, tasks = [], playerIds = []) => {
        const created: WorkoutPlan = { ...plan, id: createId("wp") };
        const createdTasks = tasks.map((task) => ({ ...task, id: createId("wt"), planId: created.id }));
        mutate((current) => ({
          ...current,
          workoutPlans: [created, ...current.workoutPlans],
          workoutTasks: [...createdTasks, ...current.workoutTasks],
          workoutAssignments: [
            ...playerIds.map((playerId) => ({ id: createId("wa"), planId: created.id, playerId })),
            ...current.workoutAssignments,
          ],
          notifications: [
            {
              id: createId("note"),
              title: "Workout assigned",
              body: `${created.title} is live.`,
              time: "Just now",
              type: "workout",
              read: false,
              targetRole: "player",
              relatedPath: "/player/workouts",
            },
            ...current.notifications,
          ],
        }));
        return created;
      },
      updateWorkoutPlan: (plan) => {
        mutate((current) => ({
          ...current,
          workoutPlans: current.workoutPlans.map((item) => (item.id === plan.id ? { ...item, ...plan } : item)),
        }));
      },
      deleteWorkoutPlan: (planId) => {
        mutate((current) => ({
          ...current,
          workoutPlans: current.workoutPlans.filter((plan) => plan.id !== planId),
          workoutTasks: current.workoutTasks.filter((task) => task.planId !== planId),
          workoutAssignments: current.workoutAssignments.filter((assignment) => assignment.planId !== planId),
          workoutSubmissions: current.workoutSubmissions.filter((submission) => submission.planId !== planId),
        }));
      },
      addWorkoutTask: (planId, task) => {
        const created: WorkoutTask = { ...task, id: createId("wt"), planId };
        mutate((current) => ({ ...current, workoutTasks: [created, ...current.workoutTasks] }));
        return created;
      },
      updateWorkoutTask: (task) => {
        mutate((current) => ({
          ...current,
          workoutTasks: current.workoutTasks.map((item) => (item.id === task.id ? { ...item, ...task } : item)),
        }));
      },
      deleteWorkoutTask: (taskId) => {
        mutate((current) => ({
          ...current,
          workoutTasks: current.workoutTasks.filter((task) => task.id !== taskId),
          workoutSubmissions: current.workoutSubmissions.filter((submission) => submission.taskId !== taskId),
        }));
      },
      assignWorkoutPlayers: (planId, playerIds) => {
        mutate((current) => ({
          ...current,
          workoutAssignments: [
            ...current.workoutAssignments.filter((assignment) => assignment.planId !== planId),
            ...playerIds.map((playerId) => ({ id: createId("wa"), planId, playerId })),
          ],
        }));
      },
      updateWorkoutAssignments: (planId, playerIds) => {
        mutate((current) => ({
          ...current,
          workoutAssignments: [
            ...current.workoutAssignments.filter((assignment) => assignment.planId !== planId),
            ...playerIds.map((playerId) => ({ id: createId("wa"), planId, playerId })),
          ],
        }));
      },
      submitWorkoutTask: (submission) => {
        const created: WorkoutSubmission = {
          ...submission,
          id: createId("sub"),
          reviewed: false,
          submittedAt: new Date().toISOString(),
        };
        mutate((current) => ({
          ...current,
          workoutSubmissions: [
            created,
            ...current.workoutSubmissions.filter((item) => !(item.taskId === submission.taskId && item.playerId === submission.playerId)),
          ],
        }));
        return created;
      },
      reviewWorkoutSubmission: (submissionId) => {
        mutate((current) => ({
          ...current,
          workoutSubmissions: current.workoutSubmissions.map((item) => (item.id === submissionId ? { ...item, reviewed: true } : item)),
        }));
      },
      deleteWorkoutSubmission: (submissionId) => {
        mutate((current) => ({
          ...current,
          workoutSubmissions: current.workoutSubmissions.filter((submission) => submission.id !== submissionId),
        }));
      },
      addTournament: (tournament, playerIds = []) => {
        const created: Tournament = { ...tournament, id: createId("tr") };
        mutate((current) => ({
          ...current,
          tournaments: [created, ...current.tournaments],
          tournamentPlayers: [
            ...playerIds.map((playerId) => ({ id: createId("tp"), tournamentId: created.id, playerId, role: "main player" as const })),
            ...current.tournamentPlayers,
          ],
          notifications: [
            {
              id: createId("note"),
              title: "Tournament roster posted",
              body: `${created.name} roster is ready.`,
              time: "Just now",
              type: "tournament",
              read: false,
              targetRole: "player",
              relatedPath: "/player/tournaments",
            },
            ...current.notifications,
          ],
        }));
        return created;
      },
      updateTournament: (tournament) => {
        mutate((current) => ({
          ...current,
          tournaments: current.tournaments.map((item) => (item.id === tournament.id ? { ...item, ...tournament } : item)),
        }));
      },
      deleteTournament: (tournamentId) => {
        mutate((current) => ({
          ...current,
          tournaments: current.tournaments.filter((tournament) => tournament.id !== tournamentId),
          tournamentPlayers: current.tournamentPlayers.filter((item) => item.tournamentId !== tournamentId),
          tournamentStats: current.tournamentStats.filter((item) => item.tournamentId !== tournamentId),
          teamLineups: current.teamLineups.filter((item) => item.tournamentId !== tournamentId),
        }));
      },
      selectTournamentPlayer: (tournamentId, playerId, role) => {
        mutate((current) => {
          const exists = current.tournamentPlayers.some((item) => item.tournamentId === tournamentId && item.playerId === playerId);
          return {
            ...current,
            tournamentPlayers: exists
              ? current.tournamentPlayers.map((item) => (item.tournamentId === tournamentId && item.playerId === playerId ? { ...item, role } : item))
              : [{ id: createId("tp"), tournamentId, playerId, role }, ...current.tournamentPlayers],
          };
        });
      },
      removeTournamentPlayer: (tournamentId, playerId) => {
        mutate((current) => ({
          ...current,
          tournamentPlayers: current.tournamentPlayers.filter((item) => !(item.tournamentId === tournamentId && item.playerId === playerId)),
          tournamentStats: current.tournamentStats.filter((item) => !(item.tournamentId === tournamentId && item.playerId === playerId)),
        }));
      },
      updateTournamentPlayerRole: (tournamentId, playerId, role) => {
        mutate((current) => ({
          ...current,
          tournamentPlayers: current.tournamentPlayers.map((item) =>
            item.tournamentId === tournamentId && item.playerId === playerId ? { ...item, role } : item,
          ),
        }));
      },
      updateTournamentStats: (stats) => {
        mutate((current) => {
          const id = stats.id ?? createId("ts");
          const next = { ...stats, id };
          const exists = current.tournamentStats.some((item) => item.id === id);
          return {
            ...current,
            tournamentStats: exists ? current.tournamentStats.map((item) => (item.id === id ? next : item)) : [next, ...current.tournamentStats],
          };
        });
      },
      deleteTournamentStats: (statsId) => {
        mutate((current) => ({
          ...current,
          tournamentStats: current.tournamentStats.filter((stats) => stats.id !== statsId),
        }));
      },
      createLineup: (lineup) => {
        const created: TeamLineup = { ...lineup, id: createId("lineup"), createdAt: new Date().toISOString() };
        mutate((current) => ({ ...current, teamLineups: [created, ...current.teamLineups] }));
        return created;
      },
      updateLineup: (lineup) => {
        mutate((current) => ({
          ...current,
          teamLineups: current.teamLineups.map((item) => (item.id === lineup.id ? { ...item, ...lineup } : item)),
        }));
      },
      deleteLineup: (lineupId) => {
        mutate((current) => ({
          ...current,
          teamLineups: current.teamLineups.filter((lineup) => lineup.id !== lineupId),
        }));
      },
      addFitnessRecord: (record) => {
        const created: FitnessRecord = { ...record, id: createId("fit") };
        mutate((current) => ({ ...current, fitnessRecords: [created, ...current.fitnessRecords] }));
        return created;
      },
      updateFitnessRecord: (record) => {
        mutate((current) => ({
          ...current,
          fitnessRecords: current.fitnessRecords.map((item) => (item.id === record.id ? { ...item, ...record } : item)),
        }));
      },
      deleteFitnessRecord: (recordId) => {
        mutate((current) => ({
          ...current,
          fitnessRecords: current.fitnessRecords.filter((record) => record.id !== recordId),
        }));
      },
      addInjuryRecord: (record) => {
        const created: InjuryRecord = { ...record, id: createId("inj") };
        mutate((current) => ({ ...current, injuryRecords: [created, ...current.injuryRecords] }));
        return created;
      },
      updateInjuryRecord: (record) => {
        mutate((current) => ({
          ...current,
          injuryRecords: current.injuryRecords.map((item) => (item.id === record.id ? { ...item, ...record } : item)),
        }));
      },
      deleteInjuryRecord: (recordId) => {
        mutate((current) => ({
          ...current,
          injuryRecords: current.injuryRecords.filter((record) => record.id !== recordId),
        }));
      },
      markNotificationRead: (notificationId, read = true) => {
        mutate((current) => ({
          ...current,
          notifications: current.notifications.map((item) => (item.id === notificationId ? { ...item, read } : item)),
        }));
      },
      addNotification,
      deleteNotification: (notificationId) => {
        mutate((current) => ({
          ...current,
          notifications: current.notifications.filter((notification) => notification.id !== notificationId),
        }));
      },
      addAchievement: (achievement) => {
        const created: Achievement = { ...achievement, id: createId("ach") };
        mutate((current) => ({ ...current, achievements: [created, ...current.achievements] }));
        return created;
      },
      updateAchievement: (achievement) => {
        mutate((current) => ({
          ...current,
          achievements: current.achievements.map((item) => (item.id === achievement.id ? { ...item, ...achievement } : item)),
        }));
      },
      deleteAchievement: (achievementId) => {
        mutate((current) => ({ ...current, achievements: current.achievements.filter((item) => item.id !== achievementId) }));
      },
      addGallery: (gallery) => {
        const created: Gallery = { ...gallery, id: createId("gal"), createdAt: new Date().toISOString() };
        mutate((current) => ({ ...current, galleries: [created, ...current.galleries] }));
        return created;
      },
      updateGallery: (gallery) => {
        mutate((current) => ({
          ...current,
          galleries: current.galleries.map((item) => (item.id === gallery.id ? { ...item, ...gallery } : item)),
        }));
      },
      deleteGallery: (galleryId) => {
        mutate((current) => ({
          ...current,
          galleries: current.galleries.filter((gallery) => gallery.id !== galleryId),
          galleryImages: current.galleryImages.filter((image) => image.galleryId !== galleryId),
        }));
      },
      addGalleryImage: (image) => {
        const created: GalleryImage = { ...image, id: createId("img") };
        mutate((current) => ({ ...current, galleryImages: [created, ...current.galleryImages] }));
        return created;
      },
      deleteGalleryImage: (imageId) => {
        mutate((current) => ({
          ...current,
          galleryImages: current.galleryImages.filter((image) => image.id !== imageId),
        }));
      },
      updateClubPage: (page) => {
        mutate((current) => ({
          ...current,
          clubPages: current.clubPages.map((item) => (item.id === page.id ? { ...item, ...page } : item)),
        }));
      },
    }),
    [addNotification, data, mutate, resetData],
  );

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
        id: createId("att"),
        trainingId,
        playerId,
        response: "No response" as AttendanceStatus,
        updatedAt: new Date().toISOString(),
        ...patch,
      },
      ...records,
    ];
  }

  return records.map((record) =>
    record.trainingId === trainingId && record.playerId === playerId
      ? { ...record, ...patch, updatedAt: new Date().toISOString() }
      : record,
  );
}
