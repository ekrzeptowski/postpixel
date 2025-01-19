import { useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../hooks/auth";
import { usePhotos } from "../hooks/usePhotos";
import { useProfile } from "../hooks/useProfile";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { PhotoCard } from "../components/PhotoCard";
import { Spinner } from "../components/Spinner";
import { getPhotoUrl } from "../utils/photos";

import styles from "./Profile.module.scss";

export const ProfilePage = () => {
  const { profileId } = useParams<{ profileId?: string }>();
  const { user } = useAuth();
  const userId = profileId || user?.id;
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const {
    profile,
    loading: profileLoading,
    error: profileError,
    updateProfile,
  } = useProfile(userId!);

  const {
    photos,
    loading: photosLoading,
    deletePhoto,
  } = usePhotos({
    userId: userId!,
    albumId: null,
  });

  if (!userId) return <div className={styles.error}>User not found</div>;
  if (profileLoading || photosLoading)
    return <Spinner className={styles.spinner} />;
  if (profileError) return <div className={styles.error}>{profileError}</div>;
  if (!profile) return <div className={styles.error}>Profile not found</div>;

  const handleUpdateProfile = async () => {
    const { error } = await updateProfile({ display_name: displayName.trim() });
    if (!error) setEditing(false);
  };

  const handleDeletePhoto = async (
    photoId: string,
    userId: string,
    path: string
  ) => {
    try {
      await deletePhoto(photoId, userId, path);
    } catch (error) {
      console.error("Failed to delete photo", error);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {profile.avatar_url ? (
              <img
                src={getPhotoUrl(userId, profile.avatar_url)}
                alt="Profile avatar"
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.defaultAvatar}>
                {profile.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          {(!profileId || profileId === user?.id) &&
            (editing ? (
              <div className={styles.editName}>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display name"
                />
                <div className={styles.editButtons}>
                  <Button onClick={handleUpdateProfile}>Save</Button>
                  <Button onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className={styles.displayName}>
                <h2>{profile.display_name}</h2>
                <Button
                  onClick={() => {
                    setDisplayName(profile.display_name);
                    setEditing(true);
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            ))}
        </div>

        <div className={styles.stats}>
          <div>
            <strong>{photos.length}</strong> photos
          </div>
          <div>
            <strong>{profile.albums?.length || 0}</strong> albums
          </div>
        </div>
      </div>

      {profile.albums && profile.albums.length > 0 && (
        <div className={styles.albumsSection}>
          <h3>Albums</h3>
          <div className={styles.albumsGrid}>
            {profile.albums.map((album) => (
              <Link
                key={album.id}
                to={`/?album=${album.id}`}
                className={styles.albumCard}
              >
                <div className={styles.albumPreview}>
                  {album.preview_photo ? (
                    <img
                      src={getPhotoUrl(userId, album.preview_photo.path)}
                      alt={album.name}
                    />
                  ) : (
                    <div className={styles.noPreview}>📁</div>
                  )}
                </div>
                <div className={styles.albumInfo}>
                  <h4>{album.name}</h4>
                  <span>{album.photo_count} photos</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className={styles.photosGrid}>
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            currentUserId={user?.id}
            onDelete={handleDeletePhoto}
          />
        ))}
      </div>
    </div>
  );
};
