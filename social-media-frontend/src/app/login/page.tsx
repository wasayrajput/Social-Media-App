// src/app/login/page.tsx
import LoginForm from '@/components/LoginForm/loginForm';

export default function LoginPage() {
  return (
    <main
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 70px)',
        padding: '1rem',
      }}
    >
      <LoginForm />
    </main>
  );
}