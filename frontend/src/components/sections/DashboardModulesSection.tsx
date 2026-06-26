import SectionHeader from '@/components/ui/SectionHeader';
import DoctorDashboard from '@/components/modules/DoctorDashboard';
import PatientPortal from '@/components/modules/PatientPortal';
import BillingModule from '@/components/modules/BillingModule';
import EmergencyModule from '@/components/modules/EmergencyModule';
import PharmacyModule from '@/components/modules/PharmacyModule';
import AuditModule from '@/components/modules/AuditModule';
import './DashboardModulesSection.css';

export default function DashboardModulesSection() {
  return (
    <section id="modules">
      <div className="container">
        <SectionHeader
          label="AI-Powered Modules"
          title="How AI Works in Each Module"
          description="Every clinical and administrative department is enhanced with purpose-built AI. Here's what clinicians and staff see in action."
        />
        <div className="modules-grid">
          <DoctorDashboard />
          <PatientPortal />
          <BillingModule />
          <EmergencyModule />
          <PharmacyModule />
          <AuditModule />
        </div>
      </div>
    </section>
  );
}
