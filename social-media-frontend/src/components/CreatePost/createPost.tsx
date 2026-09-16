'use client';

import { useState, ChangeEvent } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import styles from './createPost.module.css';
import { useAppDispatch } from '@/redux/hooks';
import { addPost } from '@/redux/slices/postsSlice';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const dispatch = useAppDispatch();

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setImagePreview(compressed);
      } catch (err) {
        console.error('Image compression failed:', err);
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imagePreview) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      alert('Authentication token missing. Please log in again.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          imageUrl: imagePreview,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post on server');
      }

      const createdPost = await response.json();
      dispatch(addPost(createdPost));

      setContent('');
      setImagePreview(null);
    } catch (error) {
      console.error('Post submit error:', error);
      alert('Failed to publish post. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <form onSubmit={handlePost}>
        <textarea
          className={styles.textarea}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />

        {imagePreview && (
          <div className={styles.previewContainer}>
            <img src={imagePreview} alt="Upload preview" className={styles.previewImage} />
            <button type="button" className={styles.removeImgBtn} onClick={removeImage} disabled={loading}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className={styles.toolbar}>
          <label className={styles.uploadBtn}>
            <ImageIcon size={20} />
            <span>Photo</span>
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={handleImageChange}
              disabled={loading}
            />
          </label>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}