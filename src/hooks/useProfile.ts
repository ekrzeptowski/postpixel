import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  albums?: {
    id: string;
    name: string;
    photo_count: number;
    preview_photo?: {
      path: string;
    };
  }[];
};

export function useProfile(profileId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileResponse, albumsResponse] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", profileId).single(),
          supabase
            .from("albums")
            .select(
              `
              id,
              name,
              photo_count: photos(count),
              preview_photo:photos(path)
            `
            )
            .eq("user_id", profileId)
            .limit(1, { foreignTable: "photos" }),
        ]);

        if (profileResponse.error) throw profileResponse.error;
        if (albumsResponse.error) throw albumsResponse.error;

        setProfile({
          ...profileResponse.data,
          albums: albumsResponse.data.map((album) => ({
            ...album,
            photo_count: album.photo_count?.[0]?.count || 0,
            preview_photo: album.preview_photo?.[0],
          })),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profileId);

      if (error) throw error;
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to update profile",
      };
    }
  };

  return { profile, loading, error, updateProfile };
}
