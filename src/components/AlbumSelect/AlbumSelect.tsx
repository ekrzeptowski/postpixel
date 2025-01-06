import { useEffect, useRef, useState } from "react";
import { Input } from "../Input";
import { supabase } from "../../utils/supabase";
import styles from "./AlbumSelect.module.scss";
import clsx from "clsx";

type Album = {
  id: number;
  name: string;
  user_id: string;
};

type AlbumSelectProps = {
  userId: string;
  disabled?: boolean;
  onAlbumSelect: (albumId: number | null, albumName?: string) => void;
};

export const AlbumSelect = ({ disabled, onAlbumSelect }: AlbumSelectProps) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumInput, setAlbumInput] = useState("");
  const [showAlbumOptions, setShowAlbumOptions] = useState(false);
  const albumSelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      const { data, error } = await supabase.from("albums").select("*");
      if (!error && data) {
        setAlbums(data);
      }
    };

    fetchAlbums();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        albumSelectRef.current &&
        !albumSelectRef.current.contains(event.target as Node)
      ) {
        setShowAlbumOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAlbumSelect = (albumId: number | null, albumName?: string) => {
    onAlbumSelect(albumId, albumName);
    setAlbumInput(albums.find((a) => a.id === albumId)?.name || "");
    setShowAlbumOptions(false);
  };

  return (
    <div className={styles.albumSelect} ref={albumSelectRef}>
      <Input
        type="text"
        value={albumInput}
        onChange={(e) => setAlbumInput(e.target.value)}
        onFocus={() => setShowAlbumOptions(true)}
        placeholder="Select an album or a new one"
        disabled={disabled}
      />
      {showAlbumOptions && (
        <div className={styles.albumOptions}>
          {albumInput ? (
            !albums.find((a) => a.name === albumInput) && (
              <div className={styles.optionItem} onClick={() => handleAlbumSelect(null, albumInput)}>
                Create "{albumInput}"
              </div>
            )
          ) : (
            <div className={clsx(styles.optionItem, styles.info)}>ℹ️Enter the album name to create a new one</div>
          )}
          <div className={styles.optionItem} onClick={() => handleAlbumSelect(null)}>All photos</div>

          {albums.map((album) => (
            <div key={album.id} className={styles.optionItem} onClick={() => handleAlbumSelect(album.id)}>
              {album.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
