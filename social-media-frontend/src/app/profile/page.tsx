'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '@/components/PostCard/postCard';
import styles from './profile.module.css';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { initializeAuth, setCredentials } from '@/redux/slices/authSlice';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: reduxUser, token, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const posts = useAppSelector((state) => state.posts?.posts || []); 

  const [isMounted, setIsMounted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBio, setNewBio] = useState('');
  const [loading, setLoading] = useState(false);

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
    const fetchProfile = async () => {
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!authToken) return;

      try {
        const res = await fetch('http://localhost:3001/user/profile', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setName(data.name || reduxUser?.name || '');
          setEmail(data.email || reduxUser?.email || '');
          setBio(data.bio || '');

          setNewName(data.name || reduxUser?.name || '');
          setNewEmail(data.email || reduxUser?.email || '');
          setNewBio(data.bio || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    if (isMounted && isInitialized && isAuthenticated) {
      fetchProfile();
    }
  }, [isMounted, isInitialized, isAuthenticated, reduxUser]);

  if (!isMounted || !isInitialized || !isAuthenticated) {
    return (
      <div className={styles.loaderContainer}>
        <p className={styles.loaderText}>Loading profile...</p>
      </div>
    );
  }

  const handleOpenEditModal = () => {
    setNewName(name || reduxUser?.name || '');
    setNewEmail(email || reduxUser?.email || '');
    setNewBio(bio || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!authToken) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: newName, email: newEmail, bio: newBio }),
      });

      const data = await res.json();

      if (res.ok) {
        setName(data.name);
        setEmail(data.email);
        setBio(data.bio || '');

        dispatch(
          setCredentials({
            user: { ...reduxUser, name: data.name, email: data.email, bio: data.bio },
            token: token || authToken,
          })
        );

        setIsEditing(false);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (userName: string) => {
    if (!userName) return 'U';
    const parts = userName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const displayName = name || reduxUser?.name || 'User';
  const displayEmail = email || reduxUser?.email || '';

  const myPosts = posts.filter(
    (post: any) => post.author?.email === displayEmail || post.author?.name === displayName || post.authorId === reduxUser?.id
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cover} />

        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>{getInitials(displayName)}</div>
          </div>
          <button className={styles.editBtn} onClick={handleOpenEditModal}>
            Edit Profile
          </button>
        </div>

        <div className={styles.details}>
          <h2 className={styles.name}>{displayName}</h2>
          <p className={styles.email}>{displayEmail}</p>
          <p className={styles.bio}>
            {bio ? bio : 'No bio added yet. Click Edit Profile to add one!'}
          </p>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{myPosts.length}</span>
              <span className={styles.statLabel}>Total Posts</span>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Edit Profile</h3>
            <form onSubmit={handleSaveProfile}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  className={styles.input}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Bio</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Write something about yourself..."
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsEditing(false)} className={styles.cancelBtn} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h3 className={styles.sectionTitle}>Your Posts</h3>
      {myPosts.length > 0 ? (
        myPosts.map((post: any) => <PostCard key={post.id} post={post} showEdit={true} />)
      ) : (
        <p className={styles.emptyPosts}>
          You haven't created any posts yet. Head over to the home feed to share your first post!
        </p>
      )}
    </div>
  );
}