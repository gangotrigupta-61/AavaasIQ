import { getCurrentUserProfile } from '@/app/actions/profile';
import ProviderLayoutClient from './ProviderLayoutClient';

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserProfile();

  return (
    <ProviderLayoutClient user={user}>
      {children}
    </ProviderLayoutClient>
  );
}
