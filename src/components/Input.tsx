import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

import styles from "./Input.module.scss";

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => {
  return <input {...props} className={clsx(styles.input, props.className)} />;
};
