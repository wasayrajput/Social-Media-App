'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '@/components/PostCard/postCard';
import Sidebar from '@/components/Sidebar/sidebar';
import { Post } from '@/types';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { initializeAuth } from '@/redux/slices/authSlice';
import styles from '../page.module.css';

export default function SavedPostsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    dispatch(initializeAuth());
    setIsMounted(true);
  }, [dispatch]);

  useEffect(() => {
    if (isMounted && isInitialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isMounted, isInitialized, isAuthenticated, router]);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3001/posts/saved', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setSavedPosts(data);
        }
      } catch (err) {
        console.error('Failed to fetch saved posts:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isMounted && isInitialized && isAuthenticated) {
      fetchSavedPosts();
    }
  }, [isMounted, isInitialized, isAuthenticated]);

  if (!isMounted || !isInitialized || !isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <p style={{ color: '#0d47a1', fontWeight: 'bold' }}>Loading session...</p>
      </div>
    );
  }

  return (
    <div className={styles.mainLayout}>
      <aside className={styles.leftSidebar}>
        <Sidebar />
      </aside>

      <main className={styles.centerFeed}>
        <h2 style={{ color: 'var(--brand-green)', marginBottom: '1.5rem' }}>Saved Posts</h2>

        {loading ? (
          <p style={{ color: '#666' }}>Loading saved posts...</p>
        ) : savedPosts.length === 0 ? (
          <div className={styles.sidebarCard} style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p style={{ color: '#666', margin: 0 }}>You haven't saved any posts yet.</p>
          </div>
        ) : (
          savedPosts.map((post) => <PostCard key={post.id} post={post} initialIsSaved={true} />)
        )}
      </main>

      <aside className={styles.rightSidebar}>
        <div className={styles.sidebarCard}>
          <h3>Saved Bookmarks</h3>
          <p style={{ marginTop: '0.8rem', color: '#666', fontSize: '0.9rem' }}>
            Posts you save will stay here so you can read them anytime.
          </p>
        </div>
      </aside>
    </div>
  );
}