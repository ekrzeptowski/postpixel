import { Button } from "./Button";

import styles from "./DeleteConfirmation.module.scss";

interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

export const DeleteConfirmation = ({
  onConfirm,
  onCancel,
  message,
}: DeleteConfirmationProps) => (
  <>
    <div className={styles.deleteOverlay} />
    <div className={styles.deleteConfirm}>
      <p>{message}</p>
      <div>
        <Button onClick={onConfirm}>Delete</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  </>
);
