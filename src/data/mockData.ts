export type Role = "coach" | "manager" | "player";

export interface Player {
  id: string;
  name: string;
  jersey: number;
  position: "Handler" | "Cutter" | "Hybrid";
  email: string;
  height?: string;
  weight?: string;
  hand?: "Left" | "Right";
  experience?: string;
  bio?: string;
  attendance: number; // %
  score: number;
  assist: number;
  blocks: number;
  turnovers: number;
  injury?: "Active" | "Recovering" | "Recovered" | null;
  isPublic: boolean;
  avatarHue: number;
}

export const currentUser = {
  name: "Aidit",
  role: "player" as Role,
  jersey: 19,
  position: "Cutter",
  email: "aidit@gmail.com",
};

export const staff = [
  { id: "c1", name: "Capang", role: "Head Coach", email: "capang@gmail.com", bio: "Leads training, tactics, and player development." },
  { id: "m1", name: "Aina", role: "Team Manager", email: "aina@gmail.com", bio: "Handles logistics, tournaments and communications." },
];

export const players: Player[] = [
  { id: "p1", name: "Aidit", jersey: 19, position: "Cutter", email: "aidit@gmail.com", height: "178cm", weight: "72kg", hand: "Right", experience: "5 yrs", bio: "Explosive cutter with sharp field vision.", attendance: 92, score: 48, assist: 22, blocks: 9, turnovers: 6, injury: null, isPublic: true, avatarHue: 200 },
  { id: "p2", name: "Abu",   jersey: 13, position: "Handler", email: "abu@gmail.com",   height: "172cm", weight: "68kg", hand: "Left",  experience: "6 yrs", bio: "Calm handler, elite hucks under pressure.", attendance: 88, score: 21, assist: 55, blocks: 4, turnovers: 12, injury: "Recovering", isPublic: true, avatarHue: 190 },
  { id: "p3", name: "Ali",   jersey: 17, position: "Hybrid",  email: "ali@gmail.com",   height: "180cm", weight: "76kg", hand: "Right", experience: "4 yrs", bio: "Two-way threat, closes tight windows.", attendance: 95, score: 33, assist: 30, blocks: 12, turnovers: 8, injury: null, isPublic: true, avatarHue: 210 },
  { id: "p4", name: "Rafi",  jersey: 22, position: "Cutter",  email: "rafi@gmail.com",  attendance: 78, score: 40, assist: 14, blocks: 6, turnovers: 9, injury: "Active", isPublic: true, avatarHue: 220 },
  { id: "p5", name: "Zul",   jersey: 8,  position: "Handler", email: "zul@gmail.com",   attendance: 84, score: 12, assist: 41, blocks: 3, turnovers: 15, injury: null, isPublic: true, avatarHue: 180 },
  { id: "p6", name: "Fikri", jersey: 24, position: "Hybrid",  email: "fikri@gmail.com", attendance: 90, score: 27, assist: 26, blocks: 10, turnovers: 7, injury: null, isPublic: true, avatarHue: 195 },
  { id: "p7", name: "Danish", jersey: 4, position: "Cutter",  email: "danish@gmail.com", attendance: 71, score: 36, assist: 12, blocks: 5, turnovers: 11, injury: null, isPublic: false, avatarHue: 205 },
  { id: "p8", name: "Haziq", jersey: 11, position: "Handler", email: "haziq@gmail.com", attendance: 86, score: 18, assist: 38, blocks: 4, turnovers: 10, injury: null, isPublic: true, avatarHue: 215 },
];

export interface Training {
  id: string;
  title: string;
  date: string;   // ISO
  start: string;
  end: string;
  location: string;
  note?: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  attendance?: { going: number; maybe: number; out: number };
}

export const trainings: Training[] = [
  { id: "t1", title: "Training Night 7/7/2026", date: "2026-07-07", start: "21:00", end: "23:00", location: "USJ Field",  note: "Bring cleats and sport shoes.", status: "Upcoming", attendance: { going: 14, maybe: 3, out: 2 } },
  { id: "t2", title: "Conditioning + Drills",   date: "2026-07-10", start: "20:30", end: "22:30", location: "Padang UM",  note: "Focus on cuts + endurance.",      status: "Upcoming", attendance: { going: 11, maybe: 5, out: 2 } },
  { id: "t3", title: "Scrimmage Night",         date: "2026-07-03", start: "21:00", end: "23:00", location: "USJ Field",  note: "5-on-5 scrimmage.",               status: "Completed", attendance: { going: 15, maybe: 0, out: 3 } },
];

export interface WorkoutTask {
  id: string;
  date: string;
  day: string;
  title: string;
  description: string;
  type: "Strength" | "Running" | "Conditioning" | "Skill" | "Recovery" | "Other";
  done?: boolean;
}

export const workoutPlan = {
  id: "wp1",
  title: "Pre-Season Block · Week 3",
  description: "Build power + aerobic base leading into KL Open.",
  start: "2026-07-01",
  end: "2026-07-07",
  status: "Active" as const,
  tasks: [
    { id: "wt1", date: "2026-07-06", day: "Mon", title: "Lower body strength", description: "5x5 squat @ RPE 7, hip thrusts, calf raises.", type: "Strength", done: true },
    { id: "wt2", date: "2026-07-07", day: "Tue", title: "Interval sprints",   description: "10x100m @ 80%, 60s rest. Focus first-step.",     type: "Running", done: false },
    { id: "wt3", date: "2026-07-08", day: "Wed", title: "Throwing session",   description: "150 throws — flick, backhand, break-side hucks.",  type: "Skill",   done: false },
    { id: "wt4", date: "2026-07-09", day: "Thu", title: "Recovery mobility",  description: "30 min mobility + foam roll.",                     type: "Recovery",done: false },
    { id: "wt5", date: "2026-07-10", day: "Fri", title: "Conditioning circuit", description: "5 rounds: burpees, kettlebell swings, sled push.", type: "Conditioning", done: false },
  ] satisfies WorkoutTask[],
};

export interface Tournament {
  id: string;
  name: string;
  location: string;
  eventType?: "Tournament" | "Friendly";
  start: string;
  end: string;
  description: string;
  status: "Draft" | "Upcoming" | "Completed" | "Cancelled";
  totalGames?: number;
  result?: string;
}

export const tournaments: Tournament[] = [
  { id: "tr1", name: "KL Open 2026",       location: "Kuala Lumpur",  start: "2026-08-15", end: "2026-08-17", description: "National mixed division championship.", status: "Upcoming" },
  { id: "tr2", name: "Penang Beach Hat",   location: "Batu Ferringhi", start: "2026-09-05", end: "2026-09-06", description: "Beach tournament, hat format.", status: "Upcoming" },
  { id: "tr3", name: "Selangor Series #2", location: "Shah Alam",     start: "2026-05-10", end: "2026-05-11", description: "Regional league stage.", status: "Completed", result: "2nd place · 5W-1L" },
  { id: "tr4", name: "Southern Slam",      location: "Johor Bahru",   start: "2026-03-20", end: "2026-03-22", description: "Weekend club invitational.", status: "Completed", result: "Champion · 6W-0L" },
];

export interface Achievement { id: string; title: string; date: string; description: string; }
export const achievements: Achievement[] = [
  { id: "a1", title: "Champion — Southern Slam 2026", date: "2026-03-22", description: "Undefeated run in Johor Bahru, defeated defending champs in final." },
  { id: "a2", title: "2nd Place — Selangor Series #2", date: "2026-05-11", description: "Narrowly lost final on universe point after strong bracket run." },
  { id: "a3", title: "Spirit of the Game Award",       date: "2025-11-04", description: "Awarded highest spirit score at Nationals 2025." },
];

export interface Notification { id: string; title: string; body: string; time: string; type: "training" | "workout" | "tournament" | "general"; read: boolean; }
export const notifications: Notification[] = [
  { id: "n1", title: "New training scheduled",  body: "Training Night 7/7/2026 · USJ Field", time: "2h ago", type: "training", read: false },
  { id: "n2", title: "Workout assigned",        body: "Week 3 pre-season plan is live.",     time: "Yesterday", type: "workout", read: false },
  { id: "n3", title: "Tournament roster",       body: "KL Open 2026 roster shortlist posted.", time: "2d ago", type: "tournament", read: true },
  { id: "n4", title: "Coach Capang · Reminder", body: "Submit fitness test results by Sunday.", time: "3d ago", type: "general", read: true },
];

export const attendanceTrend = [
  { week: "W1", pct: 78 }, { week: "W2", pct: 82 }, { week: "W3", pct: 85 },
  { week: "W4", pct: 80 }, { week: "W5", pct: 88 }, { week: "W6", pct: 91 }, { week: "W7", pct: 87 },
];

export const fitnessTrend = [
  { m: "Jan", sprint: 12.9, score: 72 }, { m: "Feb", sprint: 12.7, score: 74 },
  { m: "Mar", sprint: 12.4, score: 78 }, { m: "Apr", sprint: 12.3, score: 80 },
  { m: "May", sprint: 12.1, score: 83 }, { m: "Jun", sprint: 11.9, score: 86 },
];

export const galleryPhotos = Array.from({ length: 8 }).map((_, i) => ({
  id: `g${i}`,
  caption: ["Finals night", "Warm-up huddle", "Layout block", "Coach talk", "Trophy lift", "Beach hat", "Sideline energy", "Team photo"][i],
  date: "2026-05-11",
  hue: 180 + i * 8,
}));
