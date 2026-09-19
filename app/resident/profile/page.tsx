import { getCurrentUserProfile } from '@/app/actions/profile';
import ResidentProfileClient from './ResidentProfileClient';

export default async function ResidentProfilePage() {
  const profile = await getCurrentUserProfile();

  return <ResidentProfileClient profile={profile} />;
}
