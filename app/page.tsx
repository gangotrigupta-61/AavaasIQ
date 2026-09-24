import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import TrustedEcosystem from '@/components/landing/TrustedEcosystem';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HomeServicesSection from '@/components/landing/HomeServicesSection';
import AboutSection from '@/components/landing/AboutSection';
import ContactSection from '@/components/landing/ContactSection';
import { getCurrentUserProfile } from '@/app/actions/profile';

const roleDashboardMap: Record<string, string> = {
  resident: '/resident/dashboard',
  admin: '/admin/dashboard',
  security: '/security/dashboard',
  provider: '/provider/dashboard',
};

export default async function HomePage() {
  const profile = await getCurrentUserProfile();
  const isResident = profile?.role === 'resident';
  const dashboardHref = profile
    ? roleDashboardMap[profile.role] || '/resident/dashboard'
    : null;

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <HeroSection dashboardHref={dashboardHref} />
        <TrustedEcosystem />
        <FeaturesSection />
        <HomeServicesSection isResident={isResident} />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
