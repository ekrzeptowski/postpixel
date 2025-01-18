import clsx from "clsx";
import styles from "./Spinner.module.scss";

export const Spinner = ({className}: {className?: string}) => {
  return (
    <div
      className={clsx(styles.spinner, className)}
      role="progressbar"
      aria-busy="true"
      aria-label="Loading"
    />
  );
};
