import { supabase } from "@/lib/supabase";

export type StorageBucket = "player-profile" | "workout-proof" | "gallery" | "achievement" | "club-assets";

export async function uploadPublicImage(bucket: StorageBucket, file: File, folder: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  return { path, publicUrl: getPublicUrl(bucket, path) };
}

export function getPublicUrl(bucket: StorageBucket, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
