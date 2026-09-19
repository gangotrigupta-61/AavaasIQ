import { getCurrentUserProfile } from '@/app/actions/profile';
import SecurityLayoutClient from './SecurityLayoutClient';

export default async function SecurityLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserProfile();

  return (
    <SecurityLayoutClient user={user}>
      {children}
    </SecurityLayoutClient>
  );
}
