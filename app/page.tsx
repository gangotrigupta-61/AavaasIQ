import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import TrustedEcosystem from '@/components/landing/TrustedEcosystem';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HomeServicesSection from '@/components/landing/HomeServicesSection';
import AboutSection from '@/components/landing/AboutSection';
import ContactSection from '@/components/landing/ContactSection';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <TrustedEcosystem />
        <FeaturesSection />
        <HomeServicesSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
