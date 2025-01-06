import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../utils/supabase";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import { AlbumSelect } from "../components/AlbumSelect/AlbumSelect";
import { ImageUpload } from "../components/ImageUpload/ImageUpload";
import { useAuth } from "../hooks/auth";
import { generateRandomFileName } from "../utils/random";

import styles from "./Create.module.scss";

export const CreatePage = () => {
  const auth = useAuth();
  const userId = auth.user?.id;
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<number | null>(null);

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${generateRandomFileName()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage
      .from("photos")
      .upload(`${userId}/${fileName}`, file);

    if (uploadError) throw uploadError;
    return data.path ? fileName : null;
  };

  const createNewAlbum = async (name: string): Promise<void> => {
    if (!name.trim() || !userId) return;

    const { data, error } = await supabase
      .from("albums")
      .insert([{ name: name.trim(), user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setSelectedAlbum(data.id);
    }
  };

  const handleAlbumSelect = async (
    albumId: number | null,
    albumName?: string
  ) => {
    if (albumId === null && albumName) {
      await createNewAlbum(albumName);
    } else {
      setSelectedAlbum(albumId);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let filePath = null;
      if (file) {
        filePath = await uploadFile(file);
      }

      const { error: insertError } = await supabase.from("photos").insert([
        {
          description: description.trim(),
          path: filePath,
          album_id: selectedAlbum,
        },
      ]);

      if (insertError) throw insertError;
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <div className={styles.formContainer}>
      <h2>Create New Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Description:</label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label>Image:</label>
          <ImageUpload disabled={isLoading} onFileChange={setFile} />
        </div>
        <div>
          <label>Album:</label>
          <AlbumSelect
            userId={userId}
            disabled={isLoading}
            onAlbumSelect={handleAlbumSelect}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            type="submit"
            className={styles.actionButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner /> Uploading...
              </>
            ) : (
              "Create Post"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
