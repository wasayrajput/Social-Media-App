// src/app/register/page.tsx
import RegisterForm from '@/components/RegisterForm/signupForm';

export default function RegisterPage() {
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
          <RegisterForm />
        </main>
  );
}