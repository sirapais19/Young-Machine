import type { AppData } from "@/types/app";
import { achievements, notifications, players, tournaments, trainings, workoutPlan } from "@/data/mockData";

const now = () => new Date().toISOString();

export const initialData: AppData = {
  players: players.map((player) => ({
    ...player,
    position: player.position,
    injury: player.injury ?? null,
    dateOfBirth: player.id === "p1" ? "2001-02-19" : player.id === "p2" ? "1999-08-13" : "2000-04-17",
    gender: "Male",
    profileImage: `${player.name.toLowerCase()}-profile.jpg`,
  })),
  trainingSessions: trainings.map(({ attendance, ...training }) => training),
  attendanceRecords: trainings.flatMap((training) =>
    players.map((player, index) => ({
      id: `att-${training.id}-${player.id}`,
      trainingId: training.id,
      playerId: player.id,
      response: training.attendance && index % 5 === 0 ? "Maybe" : training.attendance && index % 7 === 0 ? "Out" : "Going",
      coachStatus: training.status === "Completed" ? (index % 6 === 0 ? "Absent" : "Attended") : undefined,
      updatedAt: now(),
    })),
  ),
  workoutPlans: [
    {
      id: workoutPlan.id,
      title: workoutPlan.title.replace("Â·", "|"),
      description: workoutPlan.description,
      start: workoutPlan.start,
      end: workoutPlan.end,
      status: workoutPlan.status,
    },
  ],
  workoutTasks: workoutPlan.tasks.map((task) => ({
    id: task.id,
    planId: workoutPlan.id,
    date: task.date,
    day: task.day,
    title: task.title,
    description: task.description.replace("â€”", "-"),
    type: task.type,
  })),
  workoutAssignments: players.map((player) => ({
    id: `wa-${workoutPlan.id}-${player.id}`,
    planId: workoutPlan.id,
    playerId: player.id,
  })),
  workoutSubmissions: workoutPlan.tasks
    .filter((task) => task.done)
    .map((task) => ({
      id: `sub-${task.id}-p1`,
      taskId: task.id,
      planId: workoutPlan.id,
      playerId: "p1",
      status: "done",
      proofName: "lower-body-session.jpg",
      note: "Completed full set with RPE 7.",
      reviewed: true,
      submittedAt: now(),
    })),
  tournaments: tournaments.map((tournament) => ({
    ...tournament,
    result: tournament.result?.replace("Â·", "|"),
  })),
  tournamentPlayers: tournaments.flatMap((tournament) =>
    players.slice(0, tournament.status === "Completed" ? 8 : 6).map((player, index) => ({
      id: `tp-${tournament.id}-${player.id}`,
      tournamentId: tournament.id,
      playerId: player.id,
      role: index === 0 ? "captain" : index > 4 ? "reserve" : "main player",
    })),
  ),
  tournamentStats: tournaments.flatMap((tournament) =>
    players.slice(0, 6).map((player) => ({
      id: `ts-${tournament.id}-${player.id}`,
      tournamentId: tournament.id,
      playerId: player.id,
      score: Math.max(0, Math.round(player.score / 5)),
      assist: Math.max(0, Math.round(player.assist / 6)),
      blocks: Math.max(0, Math.round(player.blocks / 3)),
      turnovers: Math.max(0, Math.round(player.turnovers / 4)),
      gamesPlayed: tournament.status === "Completed" ? 6 : 0,
      note: tournament.status === "Completed" ? "Logged from bracket matches." : "Pending tournament.",
    })),
  ),
  teamLineups: [
    {
      id: "lineup-tr1-a",
      tournamentId: "tr1",
      name: "KL Open starting seven",
      createdAt: now(),
      players: players.slice(0, 7).map((player, index) => ({
        id: `lineup-tr1-a-${player.id}`,
        playerId: player.id,
        position: player.position,
        lineOrder: index + 1,
      })),
    },
  ],
  fitnessRecords: players.flatMap((player, index) => [
    {
      id: `fit-${player.id}-1`,
      playerId: player.id,
      date: "2026-05-01",
      weightKg: Number(player.weight?.replace("kg", "")) || 70 + index,
      sprintSeconds: 12.9 - index * 0.08,
      endurance: "Yo-Yo level 18",
      fitnessScore: 72 + index,
      note: "Baseline pre-season test.",
    },
    {
      id: `fit-${player.id}-2`,
      playerId: player.id,
      date: "2026-06-01",
      weightKg: (Number(player.weight?.replace("kg", "")) || 70 + index) + 1,
      sprintSeconds: 12.4 - index * 0.08,
      endurance: "Yo-Yo level 19",
      fitnessScore: 78 + index,
      note: "Improved acceleration block.",
    },
  ]),
  injuryRecords: players
    .filter((player) => player.injury)
    .map((player) => ({
      id: `inj-${player.id}-1`,
      playerId: player.id,
      type: player.injury === "Active" ? "Hamstring strain" : "Ankle recovery",
      date: "2026-06-20",
      status: player.injury ?? "Recovering",
      expectedReturn: "2026-07-20",
      note: "Monitor training load before full return.",
    })),
  notifications: notifications.map((notification) => ({
    ...notification,
    body: notification.body.replace("Â·", "|"),
    targetRole: "all",
    relatedPath:
      notification.type === "training"
        ? "/player/training"
        : notification.type === "workout"
          ? "/player/workouts"
          : notification.type === "tournament"
            ? "/player/tournaments"
            : "/player/notifications",
  })),
  clubPages: [
    {
      id: "page-about",
      slug: "about",
      title: "About Young Machine",
      body: "Young Machine is a competitive Ultimate Frisbee club built around disciplined training, tactical clarity, and strong team culture.",
      status: "Published",
    },
    {
      id: "page-mission",
      slug: "mission",
      title: "Mission",
      body: "Develop players who are fit, smart, resilient, and ready to compete with spirit.",
      status: "Published",
    },
    {
      id: "page-values",
      slug: "values",
      title: "Values",
      body: "Work rate, trust, honest feedback, and respect for Spirit of the Game.",
      status: "Published",
    },
    {
      id: "page-contact",
      slug: "contact",
      title: "Contact",
      body: "Training inquiries, tournament invites, and media requests can be sent to youngmachineclub@gmail.com.",
      status: "Published",
    },
  ],
  achievements: achievements.map((achievement) => ({
    ...achievement,
    title: achievement.title.replace("â€”", "-"),
    status: "Published",
  })),
  galleries: [
    {
      id: "gal-2026-season",
      title: "2026 season",
      description: "Training nights, bracket runs, and sideline energy.",
      status: "Published",
      createdAt: now(),
    },
  ],
  galleryImages: [
    { id: "img-1", galleryId: "gal-2026-season", caption: "Finals night", fileName: "finals-night.jpg", date: "2026-05-11" },
    { id: "img-2", galleryId: "gal-2026-season", caption: "Warm-up huddle", fileName: "warmup-huddle.jpg", date: "2026-05-11" },
  ],
};

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
