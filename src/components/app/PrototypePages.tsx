import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ClipboardCheck,
  ClipboardList,
  Dumbbell,
  Eye,
  HeartPulse,
  Image,
  Pencil,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  Trophy,
  Upload,
  Users2,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, BarChart, Bar, YAxis } from "recharts";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import type { AttendanceStatus, Player, Position, RecoveryStatus, TrainingStatus, WorkoutTaskType } from "@/types/app";

const positions: Position[] = ["Handler", "Cutter", "Hybrid", "Defender"];
const injuryStatuses: (RecoveryStatus | "None")[] = ["None", "Active", "Recovering", "Recovered"];
const attendanceStatuses: AttendanceStatus[] = ["Going", "Maybe", "Out", "Attended", "Absent", "No response"];
const workoutTypes: WorkoutTaskType[] = ["Strength", "Running", "Conditioning", "Skill", "Recovery", "Other"];
const genders = ["Male", "Female", "Other"];
const experienceLevels = ["Beginner", "Intermediate", "Advanced"];

export function CoachPlayersPage() {
  const { data, deletePlayer, togglePlayerPublicProfile } = useAppData();
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("All");
  const [injury, setInjury] = useState("All");
  const [publicOnly, setPublicOnly] = useState(false);
  const filtered = data.players.filter((player) => {
    const matchesQuery = player.name.toLowerCase().includes(query.toLowerCase()) || player.email.toLowerCase().includes(query.toLowerCase());
    const matchesPosition = position === "All" || player.position === position;
    const matchesInjury = injury === "All" || (injury === "Healthy" ? !player.injury : player.injury === injury);
    const matchesPublic = !publicOnly || player.isPublic;
    return matchesQuery && matchesPosition && matchesInjury && matchesPublic;
  });

  return (
    <DashboardLayout title="Players">
      <PageHeader
        eyebrow="Squad management"
        title="Roster, availability, and public profiles."
        description="Search players, update public visibility, and open every profile or edit flow."
        action={<PrimaryLink to="/dashboard/players/create" label="Add player" icon={Plus} />}
      />
      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_12rem_12rem_10rem]">
        <SearchInput value={query} onChange={setQuery} placeholder="Search players" />
        <Select value={position} onChange={setPosition} options={["All", ...positions]} />
        <Select value={injury} onChange={setInjury} options={["All", "Healthy", "Active", "Recovering", "Recovered"]} />
        <button
          onClick={() => setPublicOnly((value) => !value)}
          className={`rounded-2xl border px-4 py-3 text-sm font-bold ${publicOnly ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/[0.045] text-silver"}`}
        >
          Public only
        </button>
      </div>
      <div className="hidden overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.025] md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.035] text-[11px] font-semibold text-silver-muted">
              <th className="p-4 text-left">Player</th>
              <th className="p-4 text-left">Kit</th>
              <th className="p-4 text-left">Position</th>
              <th className="p-4 text-left">Attendance</th>
              <th className="p-4 text-left">Stats</th>
              <th className="p-4 text-left">Injury</th>
              <th className="p-4 text-left">Public</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((player) => (
              <tr key={player.id} className="border-b border-white/10 last:border-0 hover:bg-white/[0.035]">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={player.name} hue={player.avatarHue} size={38} />
                    <div>
                      <div className="font-bold">{player.name}</div>
                      <div className="text-xs text-silver-muted">{player.email}</div>
                    </div>
                  </div>
                </td>
                <td className="metric-nums p-4 font-bold text-cyan">#{player.jersey}</td>
                <td className="p-4">{player.position}</td>
                <td className="metric-nums p-4">{player.attendance}%</td>
                <td className="metric-nums p-4">{player.score} S | {player.assist} A</td>
                <td className="p-4">{player.injury ? <StatusBadge tone={player.injury === "Active" ? "red" : "amber"}>{player.injury}</StatusBadge> : <StatusBadge tone="green">Healthy</StatusBadge>}</td>
                <td className="p-4">
                  <button
                    onClick={() => {
                      togglePlayerPublicProfile(player.id);
                      toast.success(`${player.name} profile is now ${player.isPublic ? "hidden" : "public"}.`);
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-bold"
                  >
                    {player.isPublic ? "Published" : "Hidden"}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <IconLink to="/dashboard/players/$playerId" params={{ playerId: player.id }} label="View" icon={Eye} />
                    <IconLink to="/dashboard/players/$playerId/edit" params={{ playerId: player.id }} label="Edit" icon={Pencil} />
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${player.name}? This removes their local demo records too.`)) {
                          deletePlayer(player.id);
                          toast.success(`${player.name} deleted.`);
                        }
                      }}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-destructive/25 bg-destructive/10 text-destructive"
                      aria-label={`Delete ${player.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {filtered.map((player) => (
          <PlayerCard key={player.id} player={player} onDelete={deletePlayer} onTogglePublic={togglePlayerPublicProfile} />
        ))}
      </div>
    </DashboardLayout>
  );
}

export function PlayerCreatePage() {
  return <PlayerFormPage mode="create" />;
}

export function PlayerEditPage({ playerId }: { playerId: string }) {
  return <PlayerFormPage mode="edit" playerId={playerId} />;
}

function PlayerFormPage({ mode, playerId }: { mode: "create" | "edit"; playerId?: string }) {
  const { data, addPlayer, updatePlayer } = useAppData();
  const navigate = useNavigate();
  const existing = data.players.find((player) => player.id === playerId);
  const [form, setForm] = useState({
    name: existing?.name ?? "",
    email: existing?.email ?? "",
    jersey: String(existing?.jersey ?? ""),
    position: existing?.position ?? "Cutter",
    dateOfBirth: existing?.dateOfBirth ?? "",
    gender: existing?.gender ?? "Male",
    height: existing?.height ?? "",
    weight: existing?.weight ?? "",
    hand: existing?.hand ?? "Right",
    experience: existing?.experience ?? "Intermediate",
    bio: existing?.bio ?? "",
    isPublic: existing?.isPublic ?? true,
    injury: existing?.injury ?? "None",
    profileImage: existing?.profileImage ?? "",
  });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      email: form.email,
      jersey: Number(form.jersey),
      position: form.position as Position,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender as "Male" | "Female" | "Other",
      height: form.height,
      weight: form.weight,
      hand: form.hand as "Left" | "Right",
      experience: form.experience,
      bio: form.bio,
      isPublic: form.isPublic,
      injury: form.injury === "None" ? null : (form.injury as RecoveryStatus),
      profileImage: form.profileImage,
    };
    if (mode === "create") {
      addPlayer(payload);
      toast.success(`${form.name} added to the roster.`);
      navigate({ to: "/dashboard/players" });
    } else if (playerId) {
      updatePlayer({ ...payload, id: playerId });
      toast.success(`${form.name} updated.`);
      navigate({ to: "/dashboard/players/$playerId", params: { playerId } });
    }
  };

  return (
    <DashboardLayout title={mode === "create" ? "Add player" : "Edit player"}>
      <FormShell
        title={mode === "create" ? "Create player profile" : `Edit ${existing?.name ?? "player"}`}
        onSubmit={save}
        cancelTo={mode === "create" ? "/dashboard/players" : "/dashboard/players/$playerId"}
        cancelParams={mode === "edit" && playerId ? { playerId } : undefined}
      >
        <TextField label="Full name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
        <TextField label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required type="email" />
        <TextField label="Jersey number" value={form.jersey} onChange={(value) => setForm({ ...form, jersey: value })} required type="number" />
        <Field label="Position">
          <Select value={form.position} onChange={(value) => setForm({ ...form, position: value as Position })} options={positions} />
        </Field>
        <TextField label="Date of birth" value={form.dateOfBirth} onChange={(value) => setForm({ ...form, dateOfBirth: value })} type="date" />
        <Field label="Gender">
          <Select value={form.gender} onChange={(value) => setForm({ ...form, gender: value as "Male" | "Female" | "Other" })} options={genders} />
        </Field>
        <TextField label="Height cm" value={form.height} onChange={(value) => setForm({ ...form, height: value })} type="number" />
        <TextField label="Weight kg" value={form.weight} onChange={(value) => setForm({ ...form, weight: value })} type="number" />
        <Field label="Dominant hand">
          <Select value={form.hand} onChange={(value) => setForm({ ...form, hand: value as "Left" | "Right" })} options={["Left", "Right"]} />
        </Field>
        <Field label="Experience level">
          <Select value={form.experience} onChange={(value) => setForm({ ...form, experience: value })} options={experienceLevels} />
        </Field>
        <Field label="Injury status">
          <Select value={form.injury ?? "None"} onChange={(value) => setForm({ ...form, injury: value as RecoveryStatus | "None" })} options={injuryStatuses} />
        </Field>
        <Field label="Profile image mock upload">
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-cyan/10 file:px-3 file:py-2 file:text-cyan"
            type="file"
            accept="image/*"
            onChange={(event) => setForm({ ...form, profileImage: event.target.files?.[0]?.name ?? "" })}
          />
          {form.profileImage && <span className="text-xs text-cyan">{form.profileImage}</span>}
        </Field>
        <Field label="Bio">
          <textarea className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 text-sm outline-none" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </Field>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-bold">
          <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
          Public player profile
        </label>
      </FormShell>
    </DashboardLayout>
  );
}

export function PlayerDetailPage({ playerId }: { playerId: string }) {
  const { data } = useAppData();
  const player = data.players.find((item) => item.id === playerId);
  const [tab, setTab] = useState("Overview");
  if (!player) return <MissingDashboard title="Player not found" />;
  const fitness = data.fitnessRecords.filter((record) => record.playerId === player.id);
  const injuries = data.injuryRecords.filter((record) => record.playerId === player.id);
  const tournamentRows = data.tournamentPlayers.filter((row) => row.playerId === player.id);
  const attendance = data.attendanceRecords.filter((record) => record.playerId === player.id);

  return (
    <DashboardLayout title={player.name}>
      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <div className="panel p-5">
          <PlayerAvatar name={player.name} hue={player.avatarHue} size={80} />
          <h2 className="mt-4 text-3xl font-black">{player.name}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge tone="cyan">#{player.jersey}</StatusBadge>
            <StatusBadge tone="silver">{player.position}</StatusBadge>
            {player.injury ? <StatusBadge tone={player.injury === "Active" ? "red" : "amber"}>{player.injury}</StatusBadge> : <StatusBadge tone="green">Healthy</StatusBadge>}
          </div>
          <p className="mt-4 text-sm leading-6 text-silver-muted">{player.bio || "No bio added yet."}</p>
          <Link to="/dashboard/players/$playerId/edit" params={{ playerId: player.id }} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground glow-cyan">
            <Pencil className="h-4 w-4" />
            Edit player
          </Link>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto">
            {["Overview", "Stats", "Training", "Fitness", "Injury", "Tournaments"].map((item) => (
              <button key={item} onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === item ? "bg-cyan text-primary-foreground" : "border border-white/10 bg-white/[0.045] text-silver"}`}>
                {item}
              </button>
            ))}
          </div>
          {tab === "Overview" && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Email" value={player.email} />
              <Metric label="Date of birth" value={player.dateOfBirth ?? "-"} />
              <Metric label="Gender" value={player.gender ?? "-"} />
              <Metric label="Public" value={player.isPublic ? "Published" : "Hidden"} />
              <Metric label="Height" value={player.height ?? "-"} />
              <Metric label="Weight" value={player.weight ?? "-"} />
              <Metric label="Hand" value={player.hand ?? "-"} />
              <Metric label="Experience" value={player.experience ?? "-"} />
            </div>
          )}
          {tab === "Stats" && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <Metric label="Score" value={player.score} />
              <Metric label="Assist" value={player.assist} />
              <Metric label="Blocks" value={player.blocks} />
              <Metric label="Turnovers" value={player.turnovers} />
              <Metric label="Attendance" value={`${player.attendance}%`} />
            </div>
          )}
          {tab === "Training" && <SimpleList rows={attendance.map((record) => ({ title: data.trainingSessions.find((item) => item.id === record.trainingId)?.title ?? "Training", meta: `${record.response} | ${record.coachStatus ?? "Pending coach mark"}` }))} />}
          {tab === "Fitness" && <FitnessChart records={fitness} />}
          {tab === "Injury" && <SimpleList rows={injuries.map((record) => ({ title: record.type, meta: `${record.status} | return ${record.expectedReturn ?? "TBC"}` }))} empty="No injury records." />}
          {tab === "Tournaments" && <SimpleList rows={tournamentRows.map((row) => ({ title: data.tournaments.find((item) => item.id === row.tournamentId)?.name ?? "Tournament", meta: row.role }))} />}
        </div>
      </div>
    </DashboardLayout>
  );
}

export function TrainingListPage() {
  const { data } = useAppData();
  return (
    <DashboardLayout title="Training">
      <PageHeader eyebrow="Field schedule" title="Training sessions" description="Create sessions, review responses, and mark post-session attendance." action={<PrimaryLink to="/dashboard/training/create" label="Create" icon={Plus} />} />
      <div className="grid gap-4 md:grid-cols-2">
        {data.trainingSessions.map((training) => {
          const records = data.attendanceRecords.filter((record) => record.trainingId === training.id);
          return (
            <Link key={training.id} to="/dashboard/training/$trainingId" params={{ trainingId: training.id }} className="panel panel-hover block p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-black">{training.title}</div>
                  <div className="mt-2 text-xs text-silver-muted">{training.date} | {training.start} to {training.end} | {training.location}</div>
                </div>
                <StatusBadge tone={training.status === "Upcoming" ? "cyan" : training.status === "Completed" ? "green" : "red"}>{training.status}</StatusBadge>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                {["Going", "Maybe", "Out", "Attended", "Absent"].map((status) => (
                  <MiniCount key={status} label={status} value={records.filter((record) => record.response === status || record.coachStatus === status).length} />
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export function TrainingCreatePage() {
  const { addTraining } = useAppData();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", date: "", start: "", end: "", location: "", note: "", status: "Upcoming" as TrainingStatus });
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addTraining(form);
    navigate({ to: "/dashboard/training/$trainingId", params: { trainingId: created.id } });
  };
  return (
    <DashboardLayout title="Create training">
      <FormShell title="Create training session" onSubmit={save}>
        <TextField label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
        <TextField label="Date" type="date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} required />
        <TextField label="Start time" type="time" value={form.start} onChange={(value) => setForm({ ...form, start: value })} required />
        <TextField label="End time" type="time" value={form.end} onChange={(value) => setForm({ ...form, end: value })} required />
        <TextField label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} required />
        <Field label="Status">
          <Select value={form.status} onChange={(value) => setForm({ ...form, status: value as TrainingStatus })} options={["Upcoming", "Completed", "Cancelled"]} />
        </Field>
        <TextField label="Coach note" value={form.note} onChange={(value) => setForm({ ...form, note: value })} />
      </FormShell>
    </DashboardLayout>
  );
}

export function TrainingDetailPage({ trainingId }: { trainingId: string }) {
  const { data, updateTraining, updateAttendanceByCoach } = useAppData();
  const training = data.trainingSessions.find((item) => item.id === trainingId);
  if (!training) return <MissingDashboard title="Training not found" />;
  const records = data.players.map((player) => ({
    player,
    record: data.attendanceRecords.find((item) => item.trainingId === training.id && item.playerId === player.id),
  }));
  return (
    <DashboardLayout title={training.title}>
      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="panel p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black">{training.title}</h2>
              <p className="mt-2 text-sm text-silver-muted">{training.date} | {training.start} to {training.end} | {training.location}</p>
              <p className="mt-4 text-sm leading-6 text-silver">{training.note}</p>
            </div>
            <StatusBadge tone={training.status === "Upcoming" ? "cyan" : training.status === "Completed" ? "green" : "red"}>{training.status}</StatusBadge>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/dashboard/training/$trainingId/edit" params={{ trainingId }} className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-bold">Edit</Link>
            <button onClick={() => updateTraining({ id: training.id, status: "Cancelled" })} className="rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive">Cancel session</button>
          </div>
        </div>
        <div className="panel p-5">
          <div className="text-sm font-black">Summary</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {attendanceStatuses.slice(0, 5).map((status) => (
              <MiniCount key={status} label={status} value={records.filter(({ record }) => record?.response === status || record?.coachStatus === status).length} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 panel p-5">
        <div className="mb-4 text-xl font-black">Attendance</div>
        <div className="grid gap-3 md:grid-cols-2">
          {records.map(({ player, record }) => (
            <div key={player.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-center gap-3">
                <PlayerAvatar name={player.name} hue={player.avatarHue} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{player.name}</div>
                  <div className="text-xs text-silver-muted">Response: {record?.response ?? "No response"}</div>
                </div>
                <Select value={record?.coachStatus ?? "No response"} onChange={(value) => updateAttendanceByCoach(training.id, player.id, value as AttendanceStatus)} options={attendanceStatuses} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export function TrainingEditPage({ trainingId }: { trainingId: string }) {
  const { data, updateTraining } = useAppData();
  const navigate = useNavigate();
  const training = data.trainingSessions.find((item) => item.id === trainingId);
  const [form, setForm] = useState(training ?? { id: trainingId, title: "", date: "", start: "", end: "", location: "", note: "", status: "Upcoming" as TrainingStatus });
  if (!training) return <MissingDashboard title="Training not found" />;
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateTraining(form);
    navigate({ to: "/dashboard/training/$trainingId", params: { trainingId } });
  };
  return (
    <DashboardLayout title="Edit training">
      <FormShell title={`Edit ${training.title}`} onSubmit={save}>
        <TextField label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
        <TextField label="Date" type="date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} required />
        <TextField label="Start time" type="time" value={form.start} onChange={(value) => setForm({ ...form, start: value })} required />
        <TextField label="End time" type="time" value={form.end} onChange={(value) => setForm({ ...form, end: value })} required />
        <TextField label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} required />
        <Field label="Status">
          <Select value={form.status} onChange={(value) => setForm({ ...form, status: value as TrainingStatus })} options={["Upcoming", "Completed", "Cancelled"]} />
        </Field>
        <TextField label="Coach note" value={form.note ?? ""} onChange={(value) => setForm({ ...form, note: value })} />
      </FormShell>
    </DashboardLayout>
  );
}

export function AttendanceManagerPage() {
  const { data, updateAttendanceByCoach } = useAppData();
  const [trainingId, setTrainingId] = useState(data.trainingSessions[0]?.id ?? "");
  const [status, setStatus] = useState("All");
  const records = data.attendanceRecords.filter((record) => record.trainingId === trainingId && (status === "All" || record.response === status || record.coachStatus === status));
  return (
    <DashboardLayout title="Attendance">
      <PageHeader eyebrow="Attendance manager" title="Session attendance control" description="Select a training session, filter responses, and mark attended or absent." />
      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <Select value={trainingId} onChange={setTrainingId} options={data.trainingSessions.map((item) => item.id)} labels={Object.fromEntries(data.trainingSessions.map((item) => [item.id, item.title]))} />
        <Select value={status} onChange={setStatus} options={["All", ...attendanceStatuses]} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {records.map((record) => {
          const player = data.players.find((item) => item.id === record.playerId);
          if (!player) return null;
          return (
            <div key={record.id} className="panel p-4">
              <div className="flex items-center gap-3">
                <PlayerAvatar name={player.name} hue={player.avatarHue} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{player.name}</div>
                  <div className="text-xs text-silver-muted">Player response: {record.response}</div>
                </div>
                <Select value={record.coachStatus ?? "No response"} onChange={(value) => updateAttendanceByCoach(record.trainingId, record.playerId, value as AttendanceStatus)} options={attendanceStatuses} />
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export function WorkoutsListPage() {
  const { data } = useAppData();
  return (
    <DashboardLayout title="Workout Plans">
      <PageHeader eyebrow="Workout programming" title="Plans, tasks, and player submissions." description="Open any plan to review tasks and assignment completion." action={<PrimaryLink to="/dashboard/workouts/create" label="New plan" icon={Plus} />} />
      <div className="grid gap-4 md:grid-cols-2">
        {data.workoutPlans.map((plan) => {
          const tasks = data.workoutTasks.filter((task) => task.planId === plan.id);
          const submissions = data.workoutSubmissions.filter((submission) => submission.planId === plan.id);
          const pct = tasks.length ? Math.round((submissions.length / (tasks.length * Math.max(1, data.workoutAssignments.filter((item) => item.planId === plan.id).length))) * 100) : 0;
          return (
            <Link key={plan.id} to="/dashboard/workouts/$workoutId" params={{ workoutId: plan.id }} className="panel panel-hover block p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-black">{plan.title}</div>
                  <div className="mt-1 text-xs text-silver-muted">{plan.start} to {plan.end}</div>
                </div>
                <StatusBadge tone={plan.status === "Active" ? "cyan" : plan.status === "Completed" ? "green" : "silver"}>{plan.status}</StatusBadge>
              </div>
              <p className="mt-3 text-sm leading-6 text-silver-muted">{plan.description}</p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <div className="mt-2 text-xs text-silver-muted">{pct}% submitted</div>
            </Link>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export function WorkoutCreatePage() {
  const { data, addWorkoutPlan } = useAppData();
  const navigate = useNavigate();
  const [plan, setPlan] = useState({ title: "", description: "", start: "", end: "", status: "Active" as const });
  const [task, setTask] = useState({ date: "", day: "", title: "", description: "", type: "Strength" as WorkoutTaskType });
  const [tasks, setTasks] = useState<typeof task[]>([]);
  const [selected, setSelected] = useState<string[]>(data.players.map((player) => player.id));
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addWorkoutPlan(plan, tasks.length ? tasks : [task], selected);
    navigate({ to: "/dashboard/workouts/$workoutId", params: { workoutId: created.id } });
  };
  return (
    <DashboardLayout title="Create workout">
      <FormShell title="Create workout plan" onSubmit={save}>
        <TextField label="Title" value={plan.title} onChange={(value) => setPlan({ ...plan, title: value })} required />
        <TextField label="Description" value={plan.description} onChange={(value) => setPlan({ ...plan, description: value })} required />
        <TextField label="Start date" type="date" value={plan.start} onChange={(value) => setPlan({ ...plan, start: value })} required />
        <TextField label="End date" type="date" value={plan.end} onChange={(value) => setPlan({ ...plan, end: value })} required />
        <Field label="Task date"><input className={inputClass} type="date" value={task.date} onChange={(e) => setTask({ ...task, date: e.target.value })} /></Field>
        <TextField label="Day name" value={task.day} onChange={(value) => setTask({ ...task, day: value })} />
        <TextField label="Task title" value={task.title} onChange={(value) => setTask({ ...task, title: value })} />
        <TextField label="Task description" value={task.description} onChange={(value) => setTask({ ...task, description: value })} />
        <Field label="Task type"><Select value={task.type} onChange={(value) => setTask({ ...task, type: value as WorkoutTaskType })} options={workoutTypes} /></Field>
        <button type="button" onClick={() => setTasks([...tasks, task])} className="rounded-full border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm font-bold text-cyan">Add task to plan</button>
        <CheckboxGrid label="Assign to players" items={data.players.map((player) => ({ id: player.id, label: player.name }))} selected={selected} onChange={setSelected} />
      </FormShell>
    </DashboardLayout>
  );
}

export function WorkoutDetailPage({ workoutId }: { workoutId: string }) {
  const { data } = useAppData();
  const plan = data.workoutPlans.find((item) => item.id === workoutId);
  if (!plan) return <MissingDashboard title="Workout not found" />;
  const tasks = data.workoutTasks.filter((task) => task.planId === plan.id);
  const assigned = data.workoutAssignments.filter((assignment) => assignment.planId === plan.id);
  const submissions = data.workoutSubmissions.filter((submission) => submission.planId === plan.id);
  return (
    <DashboardLayout title={plan.title}>
      <PageHeader eyebrow="Workout detail" title={plan.title} description={plan.description} action={<PrimaryLink to="/dashboard/workouts/$workoutId/edit" params={{ workoutId }} label="Edit plan" icon={Pencil} />} />
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-3">
          {tasks.map((task) => (
            <div key={task.id} className="panel p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-cyan">{task.day} | {task.type}</div>
                  <div className="mt-1 text-xl font-black">{task.title}</div>
                  <p className="mt-2 text-sm text-silver-muted">{task.description}</p>
                </div>
                <StatusBadge tone="silver">{submissions.filter((submission) => submission.taskId === task.id).length} done</StatusBadge>
              </div>
            </div>
          ))}
        </div>
        <div className="panel p-5">
          <div className="text-xl font-black">Assigned players</div>
          <div className="mt-3 space-y-2">
            {assigned.map((assignment) => {
              const player = data.players.find((item) => item.id === assignment.playerId);
              return player ? <div key={assignment.id} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm">{player.name}</div> : null;
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function WorkoutEditPage({ workoutId }: { workoutId: string }) {
  const { data, updateWorkoutPlan } = useAppData();
  const navigate = useNavigate();
  const existing = data.workoutPlans.find((item) => item.id === workoutId);
  const [form, setForm] = useState(existing ?? { id: workoutId, title: "", description: "", start: "", end: "", status: "Active" as const });
  if (!existing) return <MissingDashboard title="Workout not found" />;
  return (
    <DashboardLayout title="Edit workout">
      <FormShell
        title={`Edit ${existing.title}`}
        onSubmit={(e) => {
          e.preventDefault();
          updateWorkoutPlan(form);
          navigate({ to: "/dashboard/workouts/$workoutId", params: { workoutId } });
        }}
      >
        <TextField label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
        <TextField label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} required />
        <TextField label="Start date" type="date" value={form.start} onChange={(value) => setForm({ ...form, start: value })} required />
        <TextField label="End date" type="date" value={form.end} onChange={(value) => setForm({ ...form, end: value })} required />
      </FormShell>
    </DashboardLayout>
  );
}

export function SubmissionsPage() {
  const { data, reviewWorkoutSubmission } = useAppData();
  return (
    <DashboardLayout title="Workout Submissions">
      <PageHeader eyebrow="Review queue" title="Player workout submissions" description="Filter mentally by player, proof, note, and reviewed state." />
      <div className="grid gap-3">
        {data.workoutSubmissions.map((submission) => {
          const player = data.players.find((item) => item.id === submission.playerId);
          const task = data.workoutTasks.find((item) => item.id === submission.taskId);
          return (
            <div key={submission.id} className="panel p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-black">{player?.name} | {task?.title}</div>
                  <div className="text-sm text-silver-muted">{submission.status} | {submission.proofName ?? "No proof"} | {submission.note ?? "No note"}</div>
                </div>
                <button onClick={() => reviewWorkoutSubmission(submission.id)} className="rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm font-bold text-cyan">
                  {submission.reviewed ? "Reviewed" : "Mark reviewed"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export function TournamentsListPage() {
  const { data } = useAppData();
  return (
    <DashboardLayout title="Tournaments">
      <PageHeader eyebrow="Competition calendar" title="Tournament operations" description="Create events, select players, and track tournament stats." action={<PrimaryLink to="/dashboard/tournaments/create" label="Add tournament" icon={Plus} />} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.tournaments.map((tournament) => (
          <Link key={tournament.id} to="/dashboard/tournaments/$tournamentId" params={{ tournamentId: tournament.id }} className="panel panel-hover block p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-black">{tournament.name}</div>
                <div className="mt-2 text-xs text-silver-muted">{tournament.location} | {tournament.start} to {tournament.end}</div>
              </div>
              <StatusBadge tone={tournament.status === "Upcoming" ? "cyan" : tournament.status === "Completed" ? "green" : "silver"}>{tournament.status}</StatusBadge>
            </div>
            <p className="mt-3 text-sm leading-6 text-silver-muted">{tournament.description}</p>
            {tournament.result && <div className="mt-3 text-sm font-bold text-cyan">{tournament.result}</div>}
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}

export function TournamentCreatePage() {
  const { data, addTournament } = useAppData();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", location: "", start: "", end: "", description: "", result: "", status: "Upcoming" as const });
  const [selected, setSelected] = useState<string[]>(data.players.slice(0, 7).map((player) => player.id));
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addTournament(form, selected);
    navigate({ to: "/dashboard/tournaments/$tournamentId", params: { tournamentId: created.id } });
  };
  return (
    <DashboardLayout title="Create tournament">
      <FormShell title="Create tournament" onSubmit={save}>
        <TextField label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
        <TextField label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} required />
        <TextField label="Start date" type="date" value={form.start} onChange={(value) => setForm({ ...form, start: value })} required />
        <TextField label="End date" type="date" value={form.end} onChange={(value) => setForm({ ...form, end: value })} required />
        <TextField label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} required />
        <TextField label="Result" value={form.result} onChange={(value) => setForm({ ...form, result: value })} />
        <Field label="Status"><Select value={form.status} onChange={(value) => setForm({ ...form, status: value as typeof form.status })} options={["Draft", "Upcoming", "Completed", "Cancelled"]} /></Field>
        <CheckboxGrid label="Selected players" items={data.players.map((player) => ({ id: player.id, label: player.name }))} selected={selected} onChange={setSelected} />
      </FormShell>
    </DashboardLayout>
  );
}

export function TournamentDetailPage({ tournamentId }: { tournamentId: string }) {
  const { data, selectTournamentPlayer, updateTournamentStats } = useAppData();
  const tournament = data.tournaments.find((item) => item.id === tournamentId);
  if (!tournament) return <MissingDashboard title="Tournament not found" />;
  const selected = data.tournamentPlayers.filter((item) => item.tournamentId === tournament.id);
  return (
    <DashboardLayout title={tournament.name}>
      <PageHeader eyebrow="Tournament detail" title={tournament.name} description={`${tournament.location} | ${tournament.start} to ${tournament.end}`} action={<PrimaryLink to="/dashboard/tournaments/$tournamentId/edit" params={{ tournamentId }} label="Edit tournament" icon={Pencil} />} />
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="panel p-5">
          <div className="mb-4 text-xl font-black">Selected players</div>
          <div className="grid gap-3 md:grid-cols-2">
            {data.players.map((player) => {
              const row = selected.find((item) => item.playerId === player.id);
              return (
                <div key={player.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={player.name} hue={player.avatarHue} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold">{player.name}</div>
                      <div className="text-xs text-silver-muted">{row?.role ?? "not selected"}</div>
                    </div>
                    <Select value={row?.role ?? "reserve"} onChange={(value) => selectTournamentPlayer(tournament.id, player.id, value as "main player" | "reserve" | "captain")} options={["main player", "reserve", "captain"]} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel p-5">
          <div className="mb-4 text-xl font-black">Stats table</div>
          <div className="space-y-3">
            {selected.map((row) => {
              const player = data.players.find((item) => item.id === row.playerId);
              const stats = data.tournamentStats.find((item) => item.tournamentId === tournament.id && item.playerId === row.playerId);
              return (
                <button
                  key={row.id}
                  onClick={() =>
                    updateTournamentStats({
                      id: stats?.id,
                      tournamentId: tournament.id,
                      playerId: row.playerId,
                      score: (stats?.score ?? 0) + 1,
                      assist: stats?.assist ?? 0,
                      blocks: stats?.blocks ?? 0,
                      turnovers: stats?.turnovers ?? 0,
                      gamesPlayed: Math.max(1, stats?.gamesPlayed ?? 1),
                      note: "Updated from detail page.",
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-left"
                >
                  <div className="font-bold">{player?.name}</div>
                  <div className="text-xs text-silver-muted">{stats?.score ?? 0} score | {stats?.assist ?? 0} assist | {stats?.blocks ?? 0} blocks</div>
                </button>
              );
            })}
          </div>
          <Link to="/dashboard/team-lineup/create" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground glow-cyan">
            <Users2 className="h-4 w-4" />
            Create lineup
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function TournamentEditPage({ tournamentId }: { tournamentId: string }) {
  const { data, updateTournament } = useAppData();
  const navigate = useNavigate();
  const tournament = data.tournaments.find((item) => item.id === tournamentId);
  const [form, setForm] = useState(tournament ?? { id: tournamentId, name: "", location: "", start: "", end: "", description: "", result: "", status: "Upcoming" as const });
  if (!tournament) return <MissingDashboard title="Tournament not found" />;
  return (
    <DashboardLayout title="Edit tournament">
      <FormShell title={`Edit ${tournament.name}`} onSubmit={(e) => { e.preventDefault(); updateTournament(form); navigate({ to: "/dashboard/tournaments/$tournamentId", params: { tournamentId } }); }}>
        <TextField label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
        <TextField label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} required />
        <TextField label="Start date" type="date" value={form.start} onChange={(value) => setForm({ ...form, start: value })} required />
        <TextField label="End date" type="date" value={form.end} onChange={(value) => setForm({ ...form, end: value })} required />
        <TextField label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
        <TextField label="Result" value={form.result ?? ""} onChange={(value) => setForm({ ...form, result: value })} />
      </FormShell>
    </DashboardLayout>
  );
}

export function TeamLineupPage() {
  const { data } = useAppData();
  return (
    <DashboardLayout title="Team Lineup">
      <PageHeader eyebrow="Line builder" title="Tournament lineups" description="Visualize line order and player positions." action={<PrimaryLink to="/dashboard/team-lineup/create" label="Create lineup" icon={Plus} />} />
      <div className="grid gap-4">
        {data.teamLineups.map((lineup) => (
          <div key={lineup.id} className="panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xl font-black">{lineup.name}</div>
                <div className="text-xs text-silver-muted">{data.tournaments.find((item) => item.id === lineup.tournamentId)?.name}</div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {lineup.players.sort((a, b) => a.lineOrder - b.lineOrder).map((entry) => {
                const player = data.players.find((item) => item.id === entry.playerId);
                return player ? <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><div className="metric-nums text-cyan">#{entry.lineOrder}</div><div className="font-bold">{player.name}</div><div className="text-xs text-silver-muted">{entry.position}</div></div> : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export function TeamLineupCreatePage() {
  const { data, createLineup } = useAppData();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [tournamentId, setTournamentId] = useState(data.tournaments[0]?.id ?? "");
  const [selected, setSelected] = useState<string[]>(data.players.slice(0, 7).map((player) => player.id));
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    createLineup({
      name,
      tournamentId,
      players: selected.map((playerId, index) => ({ id: `${playerId}-${index}`, playerId, position: data.players.find((player) => player.id === playerId)?.position ?? "Hybrid", lineOrder: index + 1 })),
    });
    navigate({ to: "/dashboard/team-lineup" });
  };
  return (
    <DashboardLayout title="Create lineup">
      <FormShell title="Create tournament lineup" onSubmit={save}>
        <TextField label="Lineup name" value={name} onChange={setName} required />
        <Field label="Tournament"><Select value={tournamentId} onChange={setTournamentId} options={data.tournaments.map((item) => item.id)} labels={Object.fromEntries(data.tournaments.map((item) => [item.id, item.name]))} /></Field>
        <CheckboxGrid label="Players" items={data.players.map((player) => ({ id: player.id, label: player.name }))} selected={selected} onChange={setSelected} />
      </FormShell>
    </DashboardLayout>
  );
}

export function FitnessManagerPage() {
  const { data, addFitnessRecord } = useAppData();
  const [playerId, setPlayerId] = useState(data.players[0]?.id ?? "");
  const records = data.fitnessRecords.filter((record) => record.playerId === playerId);
  return (
    <DashboardLayout title="Fitness Records">
      <PageHeader eyebrow="Fitness testing" title="Player fitness progression" description="Add records and review weight, sprint, and score trends." />
      <FitnessRecordForm playerId={playerId} setPlayerId={setPlayerId} onSave={addFitnessRecord} />
      <FitnessChart records={records} />
      <SimpleList rows={records.map((record) => ({ title: `${record.date} | Score ${record.fitnessScore}`, meta: `${record.weightKg}kg | ${record.sprintSeconds}s | ${record.endurance}` }))} />
    </DashboardLayout>
  );
}

export function InjuriesManagerPage() {
  const { data, addInjuryRecord, updateInjuryRecord } = useAppData();
  const [playerId, setPlayerId] = useState(data.players[0]?.id ?? "");
  const [type, setType] = useState("");
  const [status, setStatus] = useState<RecoveryStatus>("Active");
  return (
    <DashboardLayout title="Injury Records">
      <PageHeader eyebrow="Medical availability" title="Injury tracker" description="Track active injuries, recovery status, and expected return." />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addInjuryRecord({ playerId, type, date: new Date().toISOString().slice(0, 10), status, expectedReturn: "", note: "" });
          setType("");
        }}
        className="panel mb-5 grid gap-3 p-5 md:grid-cols-4"
      >
        <Select value={playerId} onChange={setPlayerId} options={data.players.map((player) => player.id)} labels={Object.fromEntries(data.players.map((player) => [player.id, player.name]))} />
        <input className={inputClass} value={type} onChange={(e) => setType(e.target.value)} placeholder="Injury type" required />
        <Select value={status} onChange={(value) => setStatus(value as RecoveryStatus)} options={["Active", "Recovering", "Recovered"]} />
        <button className="rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Add injury</button>
      </form>
      <div className="grid gap-3 md:grid-cols-2">
        {data.injuryRecords.map((record) => {
          const player = data.players.find((item) => item.id === record.playerId);
          return (
            <div key={record.id} className="panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-black">{player?.name} | {record.type}</div>
                  <div className="text-sm text-silver-muted">{record.date} | return {record.expectedReturn || "TBC"}</div>
                </div>
                <Select value={record.status} onChange={(value) => updateInjuryRecord({ id: record.id, status: value as RecoveryStatus })} options={["Active", "Recovering", "Recovered"]} />
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export function StatsManagerPage() {
  const { data } = useAppData();
  const topScorers = [...data.players].sort((a, b) => b.score - a.score).slice(0, 6);
  return (
    <DashboardLayout title="Player Statistics">
      <PageHeader eyebrow="Performance board" title="Scoring, assists, blocks, and turnovers." description="Compare players and jump into tournament detail to add match stats." />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanel title="Top scorers" data={topScorers.map((player) => ({ name: player.name, value: player.score }))} />
        <ChartPanel title="Top assists" data={[...data.players].sort((a, b) => b.assist - a.assist).slice(0, 6).map((player) => ({ name: player.name, value: player.assist }))} />
      </div>
      <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-white/10">
        <table className="w-full text-sm">
          <tbody>{data.players.map((player) => <tr key={player.id} className="border-b border-white/10"><td className="p-3 font-bold">{player.name}</td><td className="p-3">Score {player.score}</td><td className="p-3">Assist {player.assist}</td><td className="p-3">Blocks {player.blocks}</td><td className="p-3">Turnovers {player.turnovers}</td></tr>)}</tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export function NotificationsPage({ playerMode = false }: { playerMode?: boolean }) {
  const { data, markNotificationRead, addNotification } = useAppData();
  const navigate = useNavigate();
  const [body, setBody] = useState("");
  const Layout = playerMode ? PlayerLayout : DashboardLayout;
  return (
    <Layout title="Notifications">
      {!playerMode && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addNotification({ title: "Team announcement", body, type: "general", targetRole: "all", relatedPath: "/dashboard/notifications" });
            setBody("");
          }}
          className="panel mb-5 flex flex-col gap-3 p-4 sm:flex-row"
        >
          <input className={inputClass} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Create general announcement" required />
          <button className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Create</button>
        </form>
      )}
      <div className="grid gap-3">
        {data.notifications.map((note) => (
          <button key={note.id} onClick={() => { markNotificationRead(note.id); if (note.relatedPath) navigate({ to: note.relatedPath }); }} className={`panel p-4 text-left ${note.read ? "opacity-70" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-black">{note.title}</div>
                <div className="mt-1 text-sm text-silver-muted">{note.body} | {note.time}</div>
              </div>
              <StatusBadge tone={note.read ? "silver" : "cyan"}>{note.type}</StatusBadge>
            </div>
          </button>
        ))}
      </div>
    </Layout>
  );
}

export function ContentManagerPage() {
  const { data, updateClubPage } = useAppData();
  return (
    <DashboardLayout title="Public Website Content">
      <PageHeader eyebrow="Website CMS" title="Club page content" description="Edit public about, mission, values, and contact copy." />
      <div className="grid gap-4">
        {data.clubPages.map((page) => (
          <div key={page.id} className="panel p-5">
            <TextField label={page.title} value={page.body} onChange={(value) => updateClubPage({ id: page.id, body: value })} />
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export function AchievementsManagerPage() {
  const { data, addAchievement, updateAchievement, deleteAchievement } = useAppData();
  const [title, setTitle] = useState("");
  return (
    <DashboardLayout title="Achievements">
      <PageHeader eyebrow="Honours" title="Achievements manager" description="Publish trophies and club milestones to the public website." />
      <form onSubmit={(e) => { e.preventDefault(); addAchievement({ title, date: new Date().toISOString().slice(0, 10), description: "Added from dashboard.", status: "Published" }); setTitle(""); }} className="panel mb-5 flex gap-3 p-4">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Achievement title" required />
        <button className="rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground">Add</button>
      </form>
      <div className="grid gap-3">{data.achievements.map((item) => <div key={item.id} className="panel flex items-center justify-between gap-3 p-4"><div><div className="font-black">{item.title}</div><div className="text-sm text-silver-muted">{item.date} | {item.status}</div></div><div className="flex gap-2"><button onClick={() => updateAchievement({ id: item.id, status: item.status === "Published" ? "Draft" : "Published" })} className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold">Toggle</button><button onClick={() => deleteAchievement(item.id)} className="rounded-full border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive">Delete</button></div></div>)}</div>
    </DashboardLayout>
  );
}

export function GalleryManagerPage() {
  const { data, addGallery, addGalleryImage } = useAppData();
  const [title, setTitle] = useState("");
  return (
    <DashboardLayout title="Gallery Manager">
      <PageHeader eyebrow="Media" title="Gallery manager" description="Create albums and add mock-uploaded images with captions." />
      <form onSubmit={(e) => { e.preventDefault(); addGallery({ title, description: "Club album", status: "Published" }); setTitle(""); }} className="panel mb-5 flex gap-3 p-4">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Album title" required />
        <button className="rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground">Add album</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {data.galleries.map((gallery) => (
          <div key={gallery.id} className="panel p-5">
            <div className="text-xl font-black">{gallery.title}</div>
            <div className="mt-1 text-sm text-silver-muted">{gallery.description} | {gallery.status}</div>
            <input className="mt-4 block w-full text-sm" type="file" onChange={(e) => e.target.files?.[0] && addGalleryImage({ galleryId: gallery.id, caption: e.target.files[0].name, fileName: e.target.files[0].name, date: new Date().toISOString().slice(0, 10) })} />
            <SimpleList rows={data.galleryImages.filter((image) => image.galleryId === gallery.id).map((image) => ({ title: image.caption, meta: image.fileName }))} />
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export function SettingsPage() {
  const { resetData } = useAppData();
  return (
    <DashboardLayout title="Settings">
      <PageHeader eyebrow="Club settings" title="Young Machine settings" description="Club profile, season controls, theme preview, and data reset." />
      <div className="grid gap-4 md:grid-cols-2">
        <Metric label="Club" value="Young Machine" />
        <Metric label="Season" value="2026" />
        <Metric label="Theme" value="Black | Silver | Cyan" />
        <button onClick={() => window.confirm("Reset all local data?") && resetData()} className="panel p-5 text-left text-destructive"><div className="font-black">Reset local data</div><div className="text-sm text-silver-muted">Restore the prototype seed data.</div></button>
      </div>
    </DashboardLayout>
  );
}

export function PlayerTrainingPage() {
  const { data, submitAttendance } = useAppData();
  const { currentUser } = useAuth();
  const playerId = currentUser?.playerId ?? "p1";
  return (
    <PlayerLayout title="Training">
      <div className="space-y-3">
        {data.trainingSessions.map((training) => {
          const record = data.attendanceRecords.find((item) => item.trainingId === training.id && item.playerId === playerId);
          return (
            <div key={training.id} className="panel p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-black">{training.title}</div>
                  <div className="mt-1 text-xs text-silver-muted">{training.date} | {training.start} to {training.end} | {training.location}</div>
                </div>
                <StatusBadge tone="cyan">{record?.response ?? "No response"}</StatusBadge>
              </div>
              <div className="sticky bottom-20 mt-4 grid grid-cols-3 gap-2">
                {(["Going", "Maybe", "Out"] as AttendanceStatus[]).map((status) => (
                  <button key={status} onClick={() => submitAttendance(training.id, playerId, status)} className="rounded-2xl border border-cyan/25 bg-cyan/10 py-3 text-sm font-bold text-cyan">{status}</button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PlayerLayout>
  );
}

export function PlayerAttendancePage() {
  const { data } = useAppData();
  const { currentUser } = useAuth();
  const playerId = currentUser?.playerId ?? "p1";
  const records = data.attendanceRecords.filter((record) => record.playerId === playerId);
  const attended = records.filter((record) => record.coachStatus === "Attended").length;
  const pct = records.length ? Math.round((attended / records.length) * 100) : 0;
  return (
    <PlayerLayout title="My Attendance">
      <Metric label="Attendance percentage" value={`${pct}%`} />
      <SimpleList rows={records.map((record) => ({ title: data.trainingSessions.find((item) => item.id === record.trainingId)?.title ?? "Training", meta: `${record.response} | ${record.coachStatus ?? "Pending"}` }))} />
    </PlayerLayout>
  );
}

export function PlayerWorkoutsPage() {
  const { data, submitWorkoutTask } = useAppData();
  const { currentUser } = useAuth();
  const playerId = currentUser?.playerId ?? "p1";
  const assignedPlanIds = data.workoutAssignments.filter((item) => item.playerId === playerId).map((item) => item.planId);
  const tasks = data.workoutTasks.filter((task) => assignedPlanIds.includes(task.planId));
  return (
    <PlayerLayout title="Workouts">
      <div className="space-y-3">
        {tasks.map((task) => {
          const submission = data.workoutSubmissions.find((item) => item.taskId === task.id && item.playerId === playerId);
          return (
            <div key={task.id} className="panel p-4">
              <div className="text-xs font-semibold text-cyan">{task.day} | {task.type}</div>
              <div className="mt-1 text-xl font-black">{task.title}</div>
              <p className="mt-2 text-sm text-silver-muted">{task.description}</p>
              {submission && <StatusBadge tone={submission.status === "done" ? "green" : "red"}>{submission.status}</StatusBadge>}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => submitWorkoutTask({ taskId: task.id, planId: task.planId, playerId, status: "done", note: "Completed from player app." })} className="rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">Done</button>
                <label className="rounded-full border border-white/10 bg-white/[0.045] py-3 text-center text-sm font-bold">
                  Proof
                  <input className="hidden" type="file" onChange={(e) => submitWorkoutTask({ taskId: task.id, planId: task.planId, playerId, status: "done", proofName: e.target.files?.[0]?.name, note: "Proof uploaded." })} />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </PlayerLayout>
  );
}

export function PlayerSubmissionsPage() {
  const { data } = useAppData();
  const { currentUser } = useAuth();
  const playerId = currentUser?.playerId ?? "p1";
  return (
    <PlayerLayout title="My Submissions">
      <SimpleList rows={data.workoutSubmissions.filter((item) => item.playerId === playerId).map((submission) => ({ title: data.workoutTasks.find((task) => task.id === submission.taskId)?.title ?? "Task", meta: `${submission.status} | ${submission.proofName ?? "No proof"} | ${submission.note ?? "No note"}` }))} empty="No submissions yet." />
    </PlayerLayout>
  );
}

export function PlayerFitnessPage() {
  const { data } = useAppData();
  const { currentUser } = useAuth();
  const records = data.fitnessRecords.filter((record) => record.playerId === (currentUser?.playerId ?? "p1"));
  return (
    <PlayerLayout title="Fitness">
      <FitnessChart records={records} />
      <SimpleList rows={records.map((record) => ({ title: `${record.date} | Score ${record.fitnessScore}`, meta: `${record.weightKg}kg | ${record.sprintSeconds}s | ${record.endurance}` }))} />
    </PlayerLayout>
  );
}

export function PlayerInjuryPage() {
  const { data } = useAppData();
  const { currentUser } = useAuth();
  const records = data.injuryRecords.filter((record) => record.playerId === (currentUser?.playerId ?? "p1"));
  return (
    <PlayerLayout title="Injury Status">
      {!records.some((record) => record.status !== "Recovered") && <div className="panel p-5"><div className="text-2xl font-black text-success">Healthy</div><p className="mt-2 text-sm text-silver-muted">No active injury record. Keep training smart.</p></div>}
      <SimpleList rows={records.map((record) => ({ title: record.type, meta: `${record.status} | return ${record.expectedReturn ?? "TBC"}` }))} empty="No injury history." />
    </PlayerLayout>
  );
}

export function PlayerSettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <PlayerLayout title="Settings">
      <div className="panel p-5">
        <div className="text-xl font-black">Account settings</div>
        <p className="mt-2 text-sm text-silver-muted">Mock account controls for the frontend prototype.</p>
        <button onClick={() => { logout(); navigate({ to: "/login" }); }} className="mt-5 w-full rounded-full border border-destructive/30 bg-destructive/10 py-3 text-sm font-bold text-destructive">Sign out</button>
      </div>
    </PlayerLayout>
  );
}

export function PlayerTournamentsPage() {
  const { data } = useAppData();
  const { currentUser } = useAuth();
  const playerId = currentUser?.playerId ?? "p1";
  const rows = data.tournamentPlayers.filter((item) => item.playerId === playerId);
  return <PlayerLayout title="My Tournaments"><SimpleList rows={rows.map((row) => ({ title: data.tournaments.find((item) => item.id === row.tournamentId)?.name ?? "Tournament", meta: row.role }))} /></PlayerLayout>;
}

export function PlayerStatsPage() {
  const { data } = useAppData();
  const { currentUser } = useAuth();
  const player = data.players.find((item) => item.id === (currentUser?.playerId ?? "p1")) ?? data.players[0];
  const stats = data.tournamentStats.filter((item) => item.playerId === player.id);
  return (
    <PlayerLayout title="My Stats">
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Score" value={player.score} />
        <Metric label="Assist" value={player.assist} />
        <Metric label="Blocks" value={player.blocks} />
        <Metric label="Turnovers" value={player.turnovers} />
      </div>
      <ChartPanel title="Tournament score trend" data={stats.map((item, index) => ({ name: `T${index + 1}`, value: item.score }))} />
    </PlayerLayout>
  );
}

function FitnessRecordForm({ playerId, setPlayerId, onSave }: { playerId: string; setPlayerId: (id: string) => void; onSave: (record: { playerId: string; date: string; weightKg: number; sprintSeconds: number; endurance: string; fitnessScore: number; note: string }) => void }) {
  const { data } = useAppData();
  const [score, setScore] = useState("80");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ playerId, date: new Date().toISOString().slice(0, 10), weightKg: 72, sprintSeconds: 12.2, endurance: "Yo-Yo level 19", fitnessScore: Number(score), note: "Added from dashboard." }); }} className="panel mb-5 grid gap-3 p-5 md:grid-cols-3">
      <Select value={playerId} onChange={setPlayerId} options={data.players.map((player) => player.id)} labels={Object.fromEntries(data.players.map((player) => [player.id, player.name]))} />
      <input className={inputClass} type="number" value={score} onChange={(e) => setScore(e.target.value)} />
      <button className="rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Add fitness record</button>
    </form>
  );
}

function FitnessChart({ records }: { records: { date: string; weightKg: number; sprintSeconds: number; fitnessScore: number }[] }) {
  return (
    <div className="panel my-4 p-5">
      <div className="text-xl font-black">Fitness trends</div>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={records}>
            <XAxis dataKey="date" stroke="var(--silver-muted)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--foreground)" }} />
            <Line type="monotone" dataKey="weightKg" stroke="var(--silver)" strokeWidth={2} />
            <Line type="monotone" dataKey="sprintSeconds" stroke="var(--warning)" strokeWidth={2} />
            <Line type="monotone" dataKey="fitnessScore" stroke="var(--cyan)" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChartPanel({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <div className="panel my-4 p-5">
      <div className="text-xl font-black">{title}</div>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="var(--silver-muted)" tickLine={false} axisLine={false} fontSize={11} width={72} />
            <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--foreground)" }} />
            <Bar dataKey="value" fill="var(--cyan)" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <section className="panel mb-5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-1 text-[11px] font-semibold text-cyan">{eyebrow}</div>
          <h2 className="text-3xl font-black sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-[62ch] text-sm leading-6 text-silver-muted">{description}</p>
        </div>
        {action}
      </div>
    </section>
  );
}

function FormShell({
  title,
  onSubmit,
  children,
  cancelTo = "/dashboard",
  cancelParams,
}: {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  cancelTo?: string;
  cancelParams?: Record<string, string>;
}) {
  return (
    <form onSubmit={onSubmit} className="panel mx-auto grid max-w-4xl gap-4 p-5 sm:grid-cols-2 sm:p-6">
      <div className="sm:col-span-2">
        <h2 className="text-3xl font-black">{title}</h2>
      </div>
      {children}
      <div className="flex gap-3 sm:col-span-2">
        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground glow-cyan">
          <Save className="h-4 w-4" />
          Save
        </button>
        <Link to={cancelTo} params={cancelParams} className="rounded-full border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-bold">Cancel</Link>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-silver-muted">
      {label}
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-foreground outline-none placeholder:text-silver-muted";

function TextField({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <Field label={label}>
      <input className={inputClass} type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </Field>
  );
}

function Select({ value, onChange, options, labels }: { value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) {
  return (
    <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option} value={option} className="bg-surface-2 text-foreground">
          {labels?.[option] ?? option}
        </option>
      ))}
    </select>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3">
      <Search className="h-4 w-4 text-silver-muted" />
      <input className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-silver-muted" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function PrimaryLink({ to, params, label, icon: Icon }: { to: string; params?: Record<string, string>; label: string; icon: typeof Plus }) {
  return (
    <Link to={to} params={params} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground glow-cyan">
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function IconLink({ to, params, label, icon: Icon }: { to: string; params?: Record<string, string>; label: string; icon: typeof Eye }) {
  return (
    <Link to={to} params={params} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] hover:border-cyan/40" aria-label={label}>
      <Icon className="h-4 w-4" />
    </Link>
  );
}

function CheckboxGrid({ label, items, selected, onChange }: { label: string; items: { id: string; label: string }[]; selected: string[]; onChange: (ids: string[]) => void }) {
  return (
    <div className="grid gap-2 sm:col-span-2">
      <div className="text-sm font-semibold text-silver-muted">{label}</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={(e) => onChange(e.target.checked ? [...selected, item.id] : selected.filter((id) => id !== item.id))}
            />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function PlayerCard({
  player,
  onDelete,
  onTogglePublic,
}: {
  player: Player;
  onDelete: (playerId: string) => void;
  onTogglePublic: (playerId: string) => void;
}) {
  return (
    <article className="panel p-4">
      <div className="flex items-center gap-3">
        <PlayerAvatar name={player.name} hue={player.avatarHue} size={50} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="truncate font-bold">{player.name}</div>
            <div className="metric-nums font-black text-cyan">#{player.jersey}</div>
          </div>
          <div className="truncate text-xs text-silver-muted">{player.position} | {player.email}</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <MetricPill label="Attendance" value={`${player.attendance}%`} />
        <MetricPill label="Stats" value={`${player.score} S | ${player.assist} A`} />
      </div>
      <button
        onClick={() => {
          onTogglePublic(player.id);
          toast.success(`${player.name} profile is now ${player.isPublic ? "hidden" : "public"}.`);
        }}
        className="mt-3 w-full rounded-2xl border border-cyan/20 bg-cyan/10 px-3 py-2 text-xs font-bold text-cyan"
      >
        {player.isPublic ? "Published profile" : "Hidden profile"}
      </button>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Link to="/dashboard/players/$playerId" params={{ playerId: player.id }} className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 text-center text-xs font-bold">
          View
        </Link>
        <Link to="/dashboard/players/$playerId/edit" params={{ playerId: player.id }} className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 text-center text-xs font-bold">
          Edit
        </Link>
        <button
          onClick={() => {
            if (window.confirm(`Delete ${player.name}? This removes their local demo records too.`)) {
              onDelete(player.id);
              toast.success(`${player.name} deleted.`);
            }
          }}
          className="rounded-2xl border border-destructive/25 bg-destructive/10 px-3 py-3 text-xs font-bold text-destructive"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function MetricPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <div className="text-[10px] font-semibold text-silver-muted">{label}</div>
      <div className="metric-nums mt-1 text-sm font-black">{value}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel p-5">
      <div className="text-[11px] font-semibold text-silver-muted">{label}</div>
      <div className="metric-nums mt-2 text-3xl font-black text-foreground">{value}</div>
    </div>
  );
}

function MiniCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-2">
      <div className="metric-nums text-lg font-black">{value}</div>
      <div className="text-[10px] text-silver-muted">{label}</div>
    </div>
  );
}

function SimpleList({ rows, empty = "No records yet." }: { rows: { title: string; meta: string }[]; empty?: string }) {
  if (!rows.length) return <div className="panel p-5 text-sm text-silver-muted">{empty}</div>;
  return (
    <div className="mt-4 grid gap-3">
      {rows.map((row, index) => (
        <div key={`${row.title}-${index}`} className="panel p-4">
          <div className="font-black">{row.title}</div>
          <div className="mt-1 text-sm text-silver-muted">{row.meta}</div>
        </div>
      ))}
    </div>
  );
}

function MissingDashboard({ title }: { title: string }) {
  return (
    <DashboardLayout title={title}>
      <div className="panel p-5 text-silver-muted">{title}</div>
    </DashboardLayout>
  );
}
