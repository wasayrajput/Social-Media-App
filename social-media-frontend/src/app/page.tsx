'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreatePost from '@/components/CreatePost/createPost';
import PostCard from '@/components/PostCard/postCard';
import Sidebar from '@/components/Sidebar/sidebar';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { initializeAuth } from '@/redux/slices/authSlice';
import { setPosts } from '@/redux/slices/postsSlice';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const posts = useAppSelector((state) => state.posts?.posts || []);
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
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:3001/posts');
        if (res.ok) {
          const data = await res.json();
          dispatch(setPosts(data));
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      }
    };

    if (isMounted && isInitialized && isAuthenticated) {
      fetchPosts();
    }
  }, [isMounted, isInitialized, isAuthenticated, dispatch]);

  if (!isMounted || !isInitialized || !isAuthenticated) {
    return (
      <div className={styles.loaderContainer}>
        <p className={styles.loaderText}>Verifying session...</p>
      </div>
    );
  }

  return (
    <div className={styles.mainLayout}>
      <aside className={styles.leftSidebar}>
        <Sidebar />
      </aside>

      <main className={styles.centerFeed}>
        <CreatePost />

        {posts.length > 0 ? (
          posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className={`${styles.sidebarCard} ${styles.emptyStateCard}`}>
            <p className={styles.emptyStateText}>
              No posts available yet. Be the first to create a post!
            </p>
          </div>
        )}
      </main>

      <aside className={styles.rightSidebar}>
        <div className={styles.sidebarCard}>
          <h3>Trending Topics</h3>
          <p className={styles.trendingHashtags}>
            #NextJS #NestJS #WebDev
          </p>
        </div>
      </aside>
    </div>
  );
}