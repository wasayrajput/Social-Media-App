'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './navbar.module.css';
import { useAppSelector } from '@/redux/hooks';

export default function Navbar() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);

  // Client-side hydration sync
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <nav className={styles.navbar}>
      <Link href={isMounted && isAuthenticated ? '/' : '/signup'} className={styles.logo}>
        ConnectPulse
      </Link>

      <div className={styles.navLinks}>
        {/* React Hydration Complete Hone Ke Baad Display Karenge */}
        {isMounted && isAuthenticated && user ? (
          <>
            <Link href="/" className={styles.navLink}>
              Feed
            </Link>
            <div className={styles.profileBadge}>
              <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span>{user.name}</span>
              </Link>
            </div>
          </>
        ) : isMounted ? (
          <>
            <Link href="/login" className={styles.navLink}>
              Login
            </Link>
            <Link href="/signup" className={styles.navLink}>
              Sign Up
            </Link>
          </>
        ) : null}
      </div>
    </nav>
  );
}