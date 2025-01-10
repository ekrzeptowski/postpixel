import { useState, FormEvent, useEffect } from "react";
import { useParams } from "react-router";
import { useComments } from "../hooks/useComments";
import { useAuth } from "../hooks/auth";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { CommentItem } from "../components/CommentItem";
import { DeleteConfirmation } from "../components/DeleteConfirmation";
import { supabase } from "../utils/supabase";
import type { Photo } from "../types/photo";

import styles from "./Comment.module.scss";

export const CommentPage = () => {
  const { photoId } = useParams<{ photoId: string }>();
  const { user } = useAuth();
  const {
    comments,
    loading: commentsLoading,
    error,
    addComment,
    deleteComment,
  } = useComments(photoId || "");
  const [newComment, setNewComment] = useState("");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [photoLoading, setPhotoLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!photoId) return;
      setPhotoLoading(true);
      const { data } = await supabase
        .from("photos")
        .select(`*, profiles(display_name)`)
        .eq("id", photoId)
        .single();
      setPhoto(data);
      setPhotoLoading(false);
    };
    fetchPhoto();
  }, [photoId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    const { success } = await addComment(newComment.trim(), user.id);
    if (success) {
      setNewComment("");
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const { success } = await deleteComment(commentId);
    if (!success) {
      // Optionally handle error
      alert('Failed to delete comment');
    }
    setDeletingId(null);
  };

  if (commentsLoading || photoLoading) {
    return (
      <div className="container">
        <div className={styles.photoSection}>
          <div className={`${styles.photo} ${styles.skeleton} ${styles.photoSkeleton}`} />
          <div className={styles.photoInfo}>
            <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: "30%" }} />
            <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: "70%" }} />
          </div>
        </div>
        <div className={styles.commentsSection}>
          <h3>Comments</h3>
          <div className={styles.commentsList}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.commentSkeleton}>
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: "20%" }} />
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: "90%" }} />
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: "40%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!photoId || !photo || error) {
    return <div>{error || 'Photo not found'}</div>;
  }

  return (
    <div className="container">
      <div className={styles.photoSection}>
        <img
          src={supabase.storage.from("photos").getPublicUrl(`${photo.user_id}/${photo.path}`).data.publicUrl}
          alt={photo.description}
          className={styles.photo}
        />
        <div className={styles.photoInfo}>
          <h2>Posted by @{photo.profiles.display_name}</h2>
          <time className={styles.timestamp}>
            {new Date(photo.created_at).toLocaleString()}
          </time>
          <p>{photo.description}</p>
        </div>
      </div>

      <div className={styles.commentsSection}>
        <h3>Comments</h3>
        <div className={styles.commentsList}>
          {comments.length === 0 && (
            <p>No comments yet. Be the first person to comment on this post.</p>
          )}
          {comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              onDeleteClick={setDeletingId}
            />
          ))}
        </div>

        {user && (
          <form onSubmit={handleSubmit} className={styles.commentForm}>
            <Input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={submitting}
            />
            <Button type="submit" disabled={submitting || !newComment.trim()}>
              Post
            </Button>
          </form>
        )}
      </div>

      {deletingId && (
        <DeleteConfirmation
          onConfirm={() => handleDeleteComment(deletingId)}
          onCancel={() => setDeletingId(null)}
          message="Are you sure you want to delete this comment?"
        />
      )}
    </div>
  );
};
