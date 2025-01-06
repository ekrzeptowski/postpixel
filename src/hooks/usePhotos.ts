import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabase";
import type { Photo, PhotoFilters } from "../types/photo";

const ITEMS_PER_PAGE = 6;

export const usePhotos = (filters: PhotoFilters) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchPhotos = useCallback(
    async (isLoadMore = false) => {
      try {
        setLoading(true);
        setError(null);

        const from = page * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let query = supabase
          .from("photos")
          .select(
            `
            *,
            profiles(display_name),
            albums(name)
            `,
            { count: "exact" }
          )
          .order("created_at", { ascending: false })
          .range(from, to);

        if (filters.userId) {
          query = query.eq("user_id", filters.userId);
        }

        if (filters.albumId) {
          query = query.eq("album_id", filters.albumId);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        if (!data) throw new Error("No data received");

        setPhotos((prev) => (isLoadMore ? [...prev, ...data] : data));
        setHasMore(count ? from + data.length < count : false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setPhotos((prev) => (isLoadMore ? prev : []));
      } finally {
        setLoading(false);
      }
    },
    [filters.userId, filters.albumId, page]
  );

  const deletePhoto = async (photoId: string, userId: string, path: string) => {
    try {
      await supabase.storage.from("photos").remove([`${userId}/${path}`]);

      const { error } = await supabase
        .from("photos")
        .delete()
        .eq("id", photoId);

      if (error) throw error;

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting photo:", error);
      return { success: false, error };
    }
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    setPage(0);
    setPhotos([]);
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.userId, filters.albumId]);

  useEffect(() => {
    if (page > 0) {
      fetchPhotos(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return { photos, loading, error, hasMore, loadMore, deletePhoto };
};
