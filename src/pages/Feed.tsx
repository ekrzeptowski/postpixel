import { parseAsString, useQueryStates } from "nuqs";
import { usePhotos } from "../hooks/usePhotos";
import { useAuth } from "../hooks/auth";
import { Button } from "../components/Button";
import { PhotoCard } from "../components/PhotoCard";
import { Spinner } from "../components/Spinner";
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

  return (
    <div>
      <h1>Photo Feed</h1>

      {filters.albumId && (
        <div className={styles.filtersContainer}>
          Currently showing photos for
          {` album ID ${filters.albumId}`}
          <Button onClick={() => setFilters({ albumId: "" })}>Clear</Button>
        </div>
      )}

      {error && <div className={styles.error}>Error: {error}</div>}

      <div className={styles.photosContainer}>
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            currentUserId={user?.id}
            onDelete={async (photoId, userId, path) => {
              await deletePhoto(photoId, userId, path);
            }}
          />
        ))}
      </div>

      {loading && <Spinner className={styles.loading} />}
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
