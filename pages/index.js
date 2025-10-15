import { useRouter } from 'next/router';
import { useEffect } from 'react';

import LoginForm from '../components/LoginForm';

export default function Home({ isAuthenticated, login }) {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return <LoginForm login={login} />;
}
