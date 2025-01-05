import { Link, type LinkProps } from "react-router";
import clsx from "clsx";

import styles from "./TextLink.module.scss";

export const TextLink = (props: LinkProps) => {
  return <Link {...props} className={clsx(styles.textLink, props.className)} />;
};
