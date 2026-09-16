'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, Pencil, Trash2, Check, X } from 'lucide-react';
import styles from './postCard.module.css';
import { Post } from '@/types';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updatePostInStore, deletePostFromStore } from '@/redux/slices/postsSlice';

interface PostCardProps {
  post: Post;
  initialIsSaved?: boolean;
  showEdit?: boolean;
}

export default function PostCard({ post, initialIsSaved = false, showEdit = false }: PostCardProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const initialLikesCount = post.likes ? post.likes.length : 0;
  const initialIsLiked = post.likes ? post.likes.some((item) => item.userId === user?.id) : false;

  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const isSavedInPost = post.savedBy?.some((item) => item.userId === user?.id) || initialIsSaved;
  const [isSaved, setIsSaved] = useState(isSavedInPost);

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    if (post.likes) {
      setLikesCount(post.likes.length);
      setIsLiked(post.likes.some((item) => item.userId === user?.id));
    }
  }, [user?.id, post.likes]);

  useEffect(() => {
    if (user?.id && post.savedBy) {
      setIsSaved(post.savedBy.some((item) => item.userId === user.id));
    }
  }, [user?.id, post.savedBy]);

  const initial = post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U';

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const handleLike = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      alert('Please log in to like posts');
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(`http://localhost:3001/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikesCount(data.likesCount);
      } else {
        setIsLiked(prevLiked);
        setLikesCount(prevCount);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleSave = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      alert('Please log in to save posts');
      return;
    }

    const previousState = isSaved;
    setIsSaved(!previousState);

    try {
      const res = await fetch(`http://localhost:3001/posts/${post.id}/save`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
      } else {
        setIsSaved(previousState);
      }
    } catch (err) {
      console.error('Failed to save post:', err);
      setIsSaved(previousState);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`http://localhost:3001/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editedContent }),
      });

      if (res.ok) {
        const updatedPost = await res.json();
        dispatch(updatePostInStore({ id: post.id, content: updatedPost.content }));
        setIsEditing(false);
      } else {
        alert('Failed to edit post');
      }
    } catch (err) {
      console.error('Failed to edit post:', err);
      alert('Error updating post');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        dispatch(deletePostFromStore(post.id));
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Error deleting post');
    }
  };

  const isAuthor =
    user?.id &&
    (post.authorId === user.id || post.author?.id === user.id || post.author?.email === user.email);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}>{initial}</div>
        <div className={styles.authorInfo}>
          <h4 className={styles.authorName}>{post.author?.name || 'Unknown Author'}</h4>
          <span className={styles.time}>{formatTimestamp(post.createdAt)}</span>
        </div>

        {showEdit && isAuthor && !isEditing && (
          <div className={styles.authorControls}>
            <button
              onClick={() => setIsEditing(true)}
              title="Edit Post"
              className={styles.iconBtn}
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={handleDeletePost}
              title="Delete Post"
              className={styles.deleteIconBtn}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className={styles.inlineEditContainer}>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            disabled={isSavingEdit}
            className={styles.inlineTextarea}
          />
          <div className={styles.inlineEditActions}>
            <button
              onClick={() => {
                setEditedContent(post.content);
                setIsEditing(false);
              }}
              disabled={isSavingEdit}
              className={styles.inlineCancelBtn}
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              className={styles.inlineSaveBtn}
            >
              <Check size={14} /> {isSavingEdit ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className={styles.content}>{post.content}</p>
      )}

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post media"
          className={styles.postImage}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      )}

      <div className={styles.actions}>
        <button className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`} onClick={handleLike}>
          <Heart size={18} fill={isLiked ? '#e63946' : 'none'} color={isLiked ? '#e63946' : 'currentColor'} />
          <span>{likesCount > 0 ? `${likesCount} ` : ''}Like{likesCount !== 1 ? 's' : ''}</span>
        </button>

        <button className={styles.actionBtn}>
          <MessageSquare size={18} />
          <span>Comment</span>
        </button>

        <button className={styles.actionBtn}>
          <Share2 size={18} />
          <span>Share</span>
        </button>

        <button className={styles.actionBtn} onClick={handleSave}>
          <Bookmark size={18} fill={isSaved ? 'var(--brand-green)' : 'none'} color={isSaved ? 'var(--brand-green)' : 'currentColor'} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </article>
  );
}