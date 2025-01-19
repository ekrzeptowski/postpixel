import { useState } from "react";
import { Link } from "react-router";

import { getPhotoUrl } from "../utils/photos";
import { TextLink } from "./TextLink";
import { DeleteConfirmation } from "./DeleteConfirmation";

import styles from "./PhotoCard.module.scss";
import type { Photo } from "../types/photo";

interface PhotoCardProps {
  photo: Photo;
  currentUserId?: string;
  onDelete?: (photoId: string, userId: string, path: string) => Promise<void>;
}

export const PhotoCard = ({
  photo,
  currentUserId,
  onDelete,
}: PhotoCardProps) => {
  const {
    id,
    user_id,
    path,
    description,
    created_at,
    profiles: { display_name },
    album_id,
  } = photo;
  const album_name = photo.albums?.name;
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className={styles.photo}>
      <a
        href={getPhotoUrl(user_id, path)}
        target="_blank"
        title="View full photo"
      >
        <img
          src={getPhotoUrl(user_id, path)}
          alt={description}
          className={styles.photoImage}
        />
      </a>
      <div className={styles.photoDetails}>
        <div className={styles.photoLinks}>
          <TextLink to={{ pathname: `/profile/${user_id}` }}>
            @{display_name}
          </TextLink>
          {album_id && (
            <TextLink to={{ pathname: `/`, search: `?album=${album_id}` }}>
              📁{album_name}
            </TextLink>
          )}
        </div>
        <p className={styles.photoDate}>
          📆{new Date(created_at).toLocaleDateString()} ⌚{" "}
          {new Date(created_at).toLocaleTimeString()}
        </p>
        <p className={styles.photoDescription}>{description}</p>
        <div className={styles.photoActions}>
          <Link className={styles.actionButton} to={`/comments/${id}`}>
            💬 Comments
          </Link>
          {user_id === currentUserId && (
            <button
              className={styles.actionButton}
              onClick={() => setDeletingId(id)}
              aria-label="Delete photo"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
      {deletingId && (
        <DeleteConfirmation
          onConfirm={() => onDelete?.(id, user_id, path)}
          onCancel={() => setDeletingId(null)}
          message="Are you sure you want to delete this photo?"
        />
      )}
    </div>
  );
};
