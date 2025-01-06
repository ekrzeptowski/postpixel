import { useEffect, useState } from "react";
import { Input } from "../Input";
import styles from "./ImageUpload.module.scss";

type ImageUploadProps = {
  disabled?: boolean;
  onFileChange: (file: File | null) => void;
};

export const ImageUpload = ({ disabled, onFileChange }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    onFileChange(newFile);
  };

  return (
    <div>
      <Input
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />
      {preview && (
        <div className={styles.preview}>
          <img src={preview} alt="Preview" />
        </div>
      )}
    </div>
  );
};
