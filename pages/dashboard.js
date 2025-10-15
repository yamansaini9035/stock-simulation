import { useRouter } from 'next/router';
import { useEffect } from 'react';

import DashboardNew from '../components/DashboardNew';

export default function DashboardPage({ isAuthenticated, user, login, logout }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <DashboardNew user={user} logout={logout} />;
}
