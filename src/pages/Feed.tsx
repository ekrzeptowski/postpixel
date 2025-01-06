import { parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";

import { usePhotos } from "../hooks/usePhotos";
import { useAuth } from "../hooks/auth";
import { supabase } from "../utils/supabase";

import { Input } from "../components/Input";
import { TextLink } from "../components/TextLink";
import { Button } from "../components/Button";

import styles from "./Feed.module.scss";

export const FeedPage = () => {
  const [filters, setFilters] = useQueryStates(
    {
      userId: parseAsString.withDefault(""),
      albumId: parseAsString.withDefault(""),
    },
    {
      clearOnDefault: true,
      throttleMs: 500,
      urlKeys: {
        userId: "profile",
        albumId: "album",
      },
    }
  );
  const { user } = useAuth();
  const { photos, loading, error, hasMore, loadMore, deletePhoto } =
    usePhotos(filters);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (
    photoId: string,
    userId: string,
    path: string
  ) => {
    const { success, error } = await deletePhoto(photoId, userId, path);
    if (!success && error) {
      alert("Failed to delete photo");
    }
    setDeletingId(null);
  };

  const getPhotoUrl = (userId: string, path: string) => {
    const { data } = supabase.storage
      .from("photos")
      .getPublicUrl(`${userId}/${path}`);
    return data.publicUrl;
  };

  return (
    <div>
      <h1>Photo Feed</h1>

      <div className={styles.filtersContainer}>
        <Input
          type="text"
          placeholder="Filter by user ID..."
          value={filters.userId || ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              userId: e.target.value || "",
            }))
          }
        />
        <Input
          type="text"
          placeholder="Filter by album ID..."
          value={filters.albumId || ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              albumId: e.target.value || "",
            }))
          }
        />
      </div>

      {error && <div className={styles.error}>Error: {error}</div>}

      <div className={styles.photosContainer}>
        {photos.map((photo) => (
          <div key={photo.id} className={styles.photo}>
            <a
              href={getPhotoUrl(photo.user_id, photo.path)}
              target="_blank"
              title="View full photo"
              aria-label="View full photo"
            >
              <img
                src={getPhotoUrl(photo.user_id, photo.path)}
                alt={photo.description}
                className={styles.photoImage}
              />
            </a>
            <div className={styles.photoDetails}>
              <div className={styles.photoLinks}>
                <TextLink
                  to={{
                    pathname: `/`,
                    search: `?profile=${photo.user_id}`,
                  }}
                >
                  @{photo.profiles.display_name}
                </TextLink>
                {photo.album_id && (
                  <TextLink
                    to={{
                      pathname: `/`,
                      search: `?album=${photo.album_id}`,
                    }}
                  >
                    📁{photo.albums?.name}
                  </TextLink>
                )}
              </div>
              <p className={styles.photoDate}>
                📆{new Date(photo.created_at).toLocaleDateString()} ⌚{" "}
                {new Date(photo.created_at).toLocaleTimeString()}
              </p>
              <p className={styles.photoDescription}>{photo.description}</p>
              <div className={styles.photoActions}>
                {photo.user_id === user?.id && (
                  <button
                    className={styles.deleteButton}
                    onClick={() => setDeletingId(photo.id)}
                    aria-label="Delete photo"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
            {deletingId === photo.id && (
              <>
                <div className={styles.deleteOverlay} />
                <div className={styles.deleteConfirm}>
                  <p>Are you sure you want to delete this photo?</p>
                  <div>
                    <Button
                      onClick={() =>
                        handleDelete(photo.id, photo.user_id, photo.path)
                      }
                    >
                      Delete
                    </Button>
                    <Button onClick={() => setDeletingId(null)}>Cancel</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {loading && <div className={styles.loading}>Loading...</div>}
      {!loading && hasMore && (
        <Button
          onClick={loadMore}
          disabled={loading}
          title="Load more photos"
          aria-label="Load more photos"
          aria-busy={loading}
        >
          Load More
        </Button>
      )}
    </div>
  );
};
