import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/hero/Hero';
import ArchitectureStrip from '@/components/architecture/ArchitectureStrip';
import AIServicesSection from '@/components/sections/AIServicesSection';
import DashboardModulesSection from '@/components/sections/DashboardModulesSection';
import BlockchainSection from '@/components/sections/BlockchainSection';
import DataFlowSection from '@/components/sections/DataFlowSection';
import TechStackSection from '@/components/sections/TechStackSection';
import BenefitsSection from '@/components/sections/BenefitsSection';
import CTASection from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ArchitectureStrip />
        <AIServicesSection />
        <DashboardModulesSection />
        <BlockchainSection />
        <DataFlowSection />
        <TechStackSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
