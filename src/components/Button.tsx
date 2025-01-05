import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

import styles from "./Button.module.scss";

export const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button {...props} className={clsx(styles.button, props.className)} />;
};
