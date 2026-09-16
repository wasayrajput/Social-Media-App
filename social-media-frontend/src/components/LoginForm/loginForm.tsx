'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCredentials } from '@/redux/slices/authSlice';
import styles from './loginForm.module.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/');
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redux store mein user data save karein
        dispatch(
          setCredentials({
            user: data.user || data,
            token: data.access_token || data.token || null,
          })
        );

        // Login hone ke baad direct Home/Feed page par redirect karein
        router.push('/');
      } else {
        setError(data.message || 'Invalid email or password!');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('Server connection failed. Make sure backend is running!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Welcome Back</h2>
      <p className={styles.subtitle}>Log in to ConnectPulse</p>

      {error && <p className={styles.errorText}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <input
            type="email"
            required
            className={styles.input}
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.passwordHeader}>
            <label className={styles.label}>Password</label>
            <Link href="/forgot-password" className={`${styles.link} ${styles.forgotLink}`}>
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            required
            className={styles.input}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className={styles.footerText}>
        Don't have an account?{' '}
        <Link href="/signup" className={styles.link}>
          Sign up here
        </Link>
      </p>
    </div>
  );
}