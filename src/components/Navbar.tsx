import { useState } from "react";
import { Link } from "react-router";
import clsx from "clsx";

import { supabase } from "../utils/supabase";
import { Button } from "./Button";

import styles from "./Navbar.module.scss";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={clsx(styles.navbarContent, "container")}>
        <button
          className={clsx(styles.hamburger, isMenuOpen && styles.active)}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>

        <nav
          className={clsx(styles.navLinks, isMenuOpen && styles.isOpen)}
          aria-label="Main navigation"
        >
          <Link to="/" className={styles.navLink}>
            Feed
          </Link>
          <Link to="/search" className={styles.navLink}>
            Search
          </Link>
          <Link to="/create" className={styles.navLink}>
            Create Post
          </Link>
          <Link to="/profile" className={styles.navLink}>
            My profile
          </Link>
          <Button onClick={handleSignOut} className={styles.authButton}>
            Sign Out
          </Button>
        </nav>
      </div>
    </header>
  );
};
