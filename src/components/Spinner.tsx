import styles from "./Spinner.module.scss";

export const Spinner = () => {
  return (
    <div
      className={styles.spinner}
      role="progressbar"
      aria-busy="true"
      aria-label="Loading"
    />
  );
};
