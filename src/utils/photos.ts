import { supabase } from "./supabase";

export const getPhotoUrl = (userId: string, path: string) => {
  const { data } = supabase.storage
    .from("photos")
    .getPublicUrl(`${userId}/${path}`);
  return data.publicUrl;
};
