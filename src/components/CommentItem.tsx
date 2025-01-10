import type { Comment } from "../types/comment";

import styles from "./CommentItem.module.scss";

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onDeleteClick: (id: string) => void;
}

export const CommentItem = ({
  comment: {
    id,
    text,
    created_at,
    user_id,
    profiles: { display_name },
  },
  currentUserId,
  onDeleteClick,
}: CommentItemProps) => (
  <div className={styles.comment}>
    <strong>@{display_name}</strong>
    <p>{text}</p>
    <div className={styles.commentFooter}>
      <span className={styles.timestamp}>
        📆{new Date(created_at).toLocaleString()}
      </span>
      {currentUserId === user_id && (
        <button
          onClick={() => onDeleteClick(id)}
          className={styles.deleteButton}
          aria-label="Delete comment"
        >
          🗑️ Delete
        </button>
      )}
    </div>
  </div>
);
