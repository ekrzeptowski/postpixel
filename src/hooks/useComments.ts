import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import type { Comment } from "../types/comment";

export const useComments = (photoId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select(`*, profiles(display_name)`)
        .eq("photo_id", photoId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (text: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            text,
            photo_id: photoId,
            user_id: userId,
          },
        ])
        .select(`*, profiles(display_name)`)
        .single();

      if (error) throw error;
      setComments((prev) => [...prev, data]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoId]);

  return { comments, loading, error, addComment, deleteComment };
};
