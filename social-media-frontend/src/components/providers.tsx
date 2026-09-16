'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { initializeAuth } from '@/redux/slices/authSlice';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}