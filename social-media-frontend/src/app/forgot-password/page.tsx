'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import formStyles from '@/components/LoginForm/loginForm.module.css';
import styles from './forgotPassword.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Step 1: Send OTP to Gmail
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:3001/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'OTP sent to your email!');
        setStep(2);
      } else {
        setError(data.message || 'Failed to send OTP code');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Server connection failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password using OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:3001/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Server connection failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.mainContainer}>
      <div className={formStyles.card}>
        <h2 className={formStyles.title}>Reset Password</h2>
        <p className={formStyles.subtitle}>
          {step === 1 ? 'Enter your email to receive a 6-digit OTP code' : 'Enter OTP code sent to your Gmail'}
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {message && <div className={styles.successMessage}>{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className={formStyles.formGroup}>
              <label className={formStyles.label}>Email Address</label>
              <input
                type="email"
                required
                className={formStyles.input}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className={formStyles.button} disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className={formStyles.formGroup}>
              <label className={formStyles.label}>6-Digit OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                className={`${formStyles.input} ${styles.otpInput}`}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={formStyles.formGroup}>
              <label className={formStyles.label}>New Password</label>
              <input
                type="password"
                required
                className={formStyles.input}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className={formStyles.button} disabled={loading}>
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className={styles.backBtn}
            >
              ← Back to Email
            </button>
          </form>
        )}

        <p className={formStyles.footerText}>
          Remember your password?{' '}
          <Link href="/login" className={formStyles.link}>
            Back to Login
          </Link>
        </p>
      </div>
    </main>
  );
}
