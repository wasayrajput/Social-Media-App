'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User, Bookmark, LogOut } from 'lucide-react';
import styles from './sidebar.module.css';
import { useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { setPosts } from '@/redux/slices/postsSlice';

const navItems = [
  { name: 'Feed', href: '/', icon: Home },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Saved Posts', href: '/saved', icon: Bookmark },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(setPosts([]));
    router.replace('/login');
  };

  return (
    <aside className={styles.card}>
      <div className={styles.title}>Navigation</div>
      <nav className={styles.navMenu}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className={`${styles.navLink} ${styles.logoutBtn}`}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}