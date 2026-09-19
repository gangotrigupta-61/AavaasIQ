import { getCurrentUserProfile } from '@/app/actions/profile';
import ResidentLayoutClient from './ResidentLayoutClient';

export default async function ResidentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserProfile();

  return (
    <ResidentLayoutClient user={user}>
      {children}
    </ResidentLayoutClient>
  );
}
