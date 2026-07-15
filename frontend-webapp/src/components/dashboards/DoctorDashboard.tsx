import { useEffect, useMemo, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ItemRow from '@/components/ui/ItemRow';
import MetricCard from '@/components/ui/MetricCard';
import ProgressBar from '@/components/ui/ProgressBar';
import BlockchainStatus from '@/components/dashboards/BlockchainStatus';
import { chainSyncedValue, metricValue } from '@/components/dashboards/dashboardMetrics';
import { acceptAppointment, type TreatmentRecord } from '@/services/appointment';
import type { DashboardComponentProps } from '@/types';
import './DoctorDashboard.css';

type RecordMap = Record<string, unknown>;

function toRecordList(value: unknown): RecordMap[] {
  return Array.isArray(value) ? (value as RecordMap[]) : [];
}

function toTreatmentList(value: unknown): TreatmentRecord[] {
  return Array.isArray(value) ? (value as unknown as TreatmentRecord[]) : [];
}

function firstText(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function formatTime(value: unknown) {
  if (typeof value !== 'string' || !value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function resolvePatientName(patient: RecordMap | undefined, fallbackId: string) {
  if (!patient) return fallbackId || 'Unknown patient';
  return firstText(patient.fullName, patient.name, patient.displayName, patient.mrn, fallbackId) || 'Unknown patient';
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' {
  const normalized = status.toLowerCase();
  if (['completed', 'checked_out', 'done', 'fulfilled'].includes(normalized)) return 'success';
  if (['checked_in', 'in_progress', 'confirmed', 'accepted', 'planned'].includes(normalized)) return 'info';
  if (['cancelled', 'rejected', 'no_show'].includes(normalized)) return 'danger';
  return 'warning';
}

function treatmentSummary(treatment: TreatmentRecord) {
  const suggestion = treatment.metadata?.suggestion;
  return firstText(suggestion?.plan, treatment.notes, 'Suggested care plan');
}

function medicineSummary(record: RecordMap) {
  return firstText(record.drugName, record.name, record.medication, record.title, record.id, 'Medicine');
}

export default function DoctorDashboard({ activeMenu, dashboardData, isLoading, error, accessToken, onSelectMenu, patientId }: DashboardComponentProps) {
  const isDashboard = activeMenu === 'Dashboard' || activeMenu === 'Overview';
  const showMetrics = isDashboard || activeMenu === 'My Patients' || activeMenu === 'Performance';
  const showQueue = isDashboard || activeMenu === 'My Patients' || activeMenu === 'AI Insights' || activeMenu === 'Treatment';
  const showTreatmentBoard = isDashboard || activeMenu === 'Treatment' || activeMenu === 'Prescriptions';
  const showPerformance = isDashboard || activeMenu === 'AI Insights' || activeMenu === 'Performance';

  const [appointments, setAppointments] = useState<RecordMap[]>([]);
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [acceptingId, setAcceptingId] = useState('');
  const [acceptMessage, setAcceptMessage] = useState('');
  const [acceptError, setAcceptError] = useState('');

  useEffect(() => {
    setAppointments(toRecordList(dashboardData?.records?.appointments));
    setTreatments(toTreatmentList(dashboardData?.records?.treatments));
  }, [dashboardData]);

  const patients = useMemo(() => toRecordList(dashboardData?.records?.patients), [dashboardData]);
  const doctors = useMemo(() => toRecordList(dashboardData?.records?.doctors), [dashboardData]);
  const prescriptions = useMemo(() => toRecordList(dashboardData?.records?.prescriptions), [dashboardData]);

  const currentDoctor = useMemo(
    () => doctors.find((doctor) => String(doctor.userId || '') === String(patientId || '')) || doctors[0] || null,
    [doctors, patientId],
  );
  const currentDoctorId = String(currentDoctor?.id || '');

  const visibleAppointments = useMemo(
    () => appointments.filter((appointment) => {
      const doctorId = String(appointment.doctorId || '');
      return !currentDoctorId || !doctorId || doctorId === currentDoctorId;
    }),
    [appointments, currentDoctorId],
  );

  const visibleTreatments = useMemo(
    () => treatments.filter((treatment) => {
      const doctorId = String(treatment.doctorId || '');
      return !currentDoctorId || !doctorId || doctorId === currentDoctorId;
    }),
    [currentDoctorId, treatments],
  );

  const visiblePrescriptions = useMemo(
    () => prescriptions.filter((prescription) => {
      const doctorId = String((prescription as RecordMap).doctorId || '');
      return !currentDoctorId || !doctorId || doctorId === currentDoctorId;
    }),
    [currentDoctorId, prescriptions],
  );

  const patientIndex = useMemo(
    () => new Map(
      patients.map((patient) => [
        String(patient.id || patient.patientId || patient.userId || ''),
        patient,
      ]),
    ),
    [patients],
  );

  const appointmentRows = visibleAppointments
    .slice()
    .sort((a, b) => new Date(String(a.scheduledAt || 0)).getTime() - new Date(String(b.scheduledAt || 0)).getTime())
    .slice(0, 6)
    .map((appointment, index) => {
      const patientIdValue = String(appointment.patientId || '');
      const matchedPatient = patientIndex.get(patientIdValue);
      const status = String(appointment.status || 'scheduled');
      return {
        id: String(appointment.id || patientIdValue || index),
        patientName: resolvePatientName(matchedPatient, patientIdValue),
        reason: firstText(appointment.reason, appointment.notes, 'General consultation'),
        when: formatTime(appointment.scheduledAt),
        status,
        doctorId: firstText(appointment.doctorId, currentDoctorId, 'Unassigned'),
      };
    });

  const treatmentRows = visibleTreatments.slice(0, 6).map((treatment) => {
    const patientIdValue = String(treatment.patientId || '');
    const matchedPatient = patientIndex.get(patientIdValue);
    const suggestion = treatment.metadata?.suggestion;
    return {
      id: treatment.id,
      patientName: resolvePatientName(matchedPatient, patientIdValue),
      diagnosis: firstText(treatment.diagnosis, suggestion?.diagnosis, 'Suggested care plan'),
      plan: treatmentSummary(treatment),
      status: String(treatment.status || 'planned'),
      urgency: firstText(suggestion?.urgency, 'routine'),
    };
  });

  const prescriptionRows = visiblePrescriptions.slice(0, 6).map((prescription, index) => {
    const record = prescription as RecordMap;
    const metadata = record.metadata as Record<string, unknown> | undefined;
    const patientIdValue = String(record.patientId || '');
    const matchedPatient = patientIndex.get(patientIdValue);
    return {
      id: String(record.id || index),
      patientName: resolvePatientName(matchedPatient, patientIdValue),
      medicine: medicineSummary(record),
      details: firstText(record.instructions, metadata?.directions, record.status, 'Medication order'),
      status: firstText(record.status, 'dispensed'),
    };
  });

  const handleAccept = async (appointmentId: string) => {
    if (!accessToken) {
      setAcceptError('Missing doctor session.');
      return;
    }

    setAcceptingId(appointmentId);
    setAcceptError('');
    setAcceptMessage('');

    try {
      const result = await acceptAppointment(accessToken, appointmentId);
      setAppointments((current) =>
        current.map((appointment) =>
          String(appointment.id) === appointmentId ? { ...appointment, ...result.appointment } : appointment,
        ),
      );
      if (result.treatment) {
        setTreatments((current) => [result.treatment, ...current.filter((item) => item.id !== result.treatment.id)]);
      }
      setAcceptMessage('Appointment accepted and suggested treatment created.');
      onSelectMenu?.('Dashboard');
    } catch (submitError) {
      setAcceptError(submitError instanceof Error ? submitError.message : 'Unable to accept appointment');
    } finally {
      setAcceptingId('');
    }
  };

  const latestTreatment = treatmentRows[0] || null;
  const latestPrescription = prescriptionRows[0] || null;

  return (
    <div className="dashboard-tab doctor-dashboard">
      <div className="tab-heading">
        <span>{activeMenu}</span>
      </div>
      <BlockchainStatus data={dashboardData} isLoading={isLoading} error={error} />

      {showMetrics ? (
        <div className="grid-4">
          <MetricCard icon="👥" tone="cyan" label="Patients" value={metricValue(dashboardData, 'patients', patients.length)} note="From patient records API" />
          <MetricCard icon="📅" tone="green" label="Appointments" value={metricValue(dashboardData, 'appointments', appointments.length)} note="Live from appointment repository" />
          <MetricCard icon="✅" tone="amber" label="Active Treatments" value={metricValue(dashboardData, 'activeTreatments', treatments.length)} note="Synced through treatment chain" />
          <MetricCard icon="⛓️" tone="purple" label="Chain Synced" value={chainSyncedValue(dashboardData)} note="Patient/treatment/pharmacy ledger writes" />
        </div>
      ) : null}

      {acceptMessage ? <Alert tone="success">{acceptMessage}</Alert> : null}
      {acceptError ? <Alert tone="danger">{acceptError}</Alert> : null}

      {isDashboard ? (
        <div className="grid-2 mt3">
          <div className="card">
            <div className="card-title">🏥 Treatment Dashboard</div>
            <div className="card-sub">Default doctor landing screen with patient cases, prescriptions, and medicine context.</div>
            <ItemRow
              title={currentDoctor?.fullName ? String(currentDoctor.fullName) : 'Doctor profile'}
              subtitle={[
                firstText(currentDoctor?.department),
                firstText(currentDoctor?.specialization),
                firstText(currentDoctor?.licenseNumber),
              ].filter(Boolean).join(' · ') || 'No department or specialization found'}
              right={<Badge tone="info">Doctor</Badge>}
            />
            <ItemRow
              title="Patient cases"
              subtitle={`${appointmentRows.length} queued appointments · ${visibleTreatments.length} treatment records`}
              right={<Badge tone="warning">Live queue</Badge>}
            />
            <ItemRow
              title="Prescription feed"
              subtitle={`${prescriptionRows.length} active medication entries`}
              right={<Badge tone="success">Medication</Badge>}
            />
            <ItemRow
              title="Clinical summary"
              subtitle={latestTreatment ? latestTreatment.plan : 'Accept an appointment to generate a care plan'}
              right={<Badge tone={latestTreatment ? statusTone(latestTreatment.status) : 'info'}>{latestTreatment ? latestTreatment.status : 'pending'}</Badge>}
            />
            <div className="mt2">
              <Button variant="secondary" block onClick={() => onSelectMenu?.('Treatment')}>
                Open Treatment Board
              </Button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">🧾 Latest Patient Case</div>
            <div className="card-sub">What the doctor should see as soon as the dashboard opens.</div>
            {latestTreatment ? (
              <>
                <ItemRow
                  title={`${latestTreatment.patientName} · ${latestTreatment.diagnosis}`}
                  subtitle={latestTreatment.plan}
                  right={
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Badge tone={statusTone(latestTreatment.status)}>{latestTreatment.status}</Badge>
                      <Badge tone="info">{latestTreatment.urgency}</Badge>
                    </div>
                  }
                />
                <div className="mt1">
                  <ProgressBar
                    label="Treatment readiness"
                    value="100%"
                    percent={100}
                    gradient="linear-gradient(90deg,var(--cyan),var(--purple))"
                  />
                </div>
              </>
            ) : (
              <Alert tone="info">No accepted case yet. Accept an appointment to generate the treatment dashboard.</Alert>
            )}
            <div className="portal-divider" />
            {latestPrescription ? (
              <ItemRow
                title={`${latestPrescription.patientName} · ${latestPrescription.medicine}`}
                subtitle={latestPrescription.details}
                right={<Badge tone="purple">{latestPrescription.status}</Badge>}
              />
            ) : (
              <div className="card-sub">No prescriptions captured yet.</div>
            )}
          </div>
        </div>
      ) : null}

      {showQueue ? (
        <div className="card mt3">
          <div className="card-title">📋 Appointment Queue</div>
          <div className="card-sub">Pending patient bookings for the assigned doctor.</div>
          {appointmentRows.length ? (
            appointmentRows.map((appointment) => {
              const isAccepted = appointment.status === 'accepted';
              const isCompleted = appointment.status === 'completed';
              return (
                <ItemRow
                  key={appointment.id}
                  accent="var(--cyan)"
                  title={`${appointment.patientName} · ${appointment.reason}`}
                  subtitle={`${appointment.when}${appointment.doctorId ? ` · Doctor ${appointment.doctorId}` : ''}`}
                  right={
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Badge tone={statusTone(appointment.status)}>{appointment.status}</Badge>
                      {!isAccepted && !isCompleted ? (
                        <Button size="sm" variant="primary" onClick={() => handleAccept(appointment.id)} disabled={acceptingId === appointment.id}>
                          {acceptingId === appointment.id ? 'Accepting...' : 'Accept'}
                        </Button>
                      ) : null}
                    </div>
                  }
                />
              );
            })
          ) : (
            <div className="card-sub">No appointments have been booked yet.</div>
          )}
        </div>
      ) : null}

      {showTreatmentBoard ? (
        <div className="grid-2 mt3">
          <div className="card">
            <div className="card-title">🩺 Treatment Board</div>
            <div className="card-sub">Accepted appointments automatically create a suggested treatment plan.</div>
            {treatmentRows.length ? (
              treatmentRows.map((treatment) => (
                <ItemRow
                  key={treatment.id}
                  title={`${treatment.patientName} · ${treatment.diagnosis}`}
                  subtitle={treatment.plan}
                  right={
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Badge tone={statusTone(treatment.status)}>{treatment.status}</Badge>
                      <Badge tone="info">{treatment.urgency}</Badge>
                    </div>
                  }
                />
              ))
            ) : (
              <div className="card-sub">No treatments yet. Accept an appointment to generate a care plan.</div>
            )}
          </div>

          <div className="card">
            <div className="card-title">💊 Prescription & Medicine</div>
            <div className="card-sub">Medication details tied to the treatment workup.</div>
            {prescriptionRows.length ? (
              prescriptionRows.map((prescription) => (
                <ItemRow
                  key={prescription.id}
                  title={`${prescription.patientName} · ${prescription.medicine}`}
                  subtitle={prescription.details}
                  right={<Badge tone="purple">{prescription.status}</Badge>}
                />
              ))
            ) : (
              <Alert tone="info">No prescription records found yet.</Alert>
            )}
          </div>
        </div>
      ) : null}

      {showPerformance ? (
        <div className="grid-2 mt3">
          <div className="card">
            <div className="card-title">📊 Weekly Patient Volume</div>
            <div className="card-sub">Mon-Sat consultations</div>
            <div className="chart-box mt1">
              <div className="bar" style={{ height: '40%' }} />
              <div className="bar" style={{ height: '65%' }} />
              <div className="bar" style={{ height: '55%' }} />
              <div className="bar" style={{ height: '80%' }} />
              <div className="bar" style={{ height: '70%' }} />
              <div className="bar" style={{ height: '85%' }} />
            </div>
          </div>

          <div className="card">
            <div className="card-title">📈 AI Model Accuracy</div>
            <div className="card-sub">Diagnosis validation rates</div>
            <div className="mt1">
              <ProgressBar label="Diagnostic Accuracy" value="92%" percent={92} gradient="linear-gradient(90deg,var(--cyan),var(--purple))" />
              <ProgressBar label="Drug Interaction Detection" value="98%" percent={98} gradient="linear-gradient(90deg,var(--green),var(--cyan))" />
              <ProgressBar label="Treatment Success Rate" value="84%" percent={84} gradient="linear-gradient(90deg,var(--amber),var(--green))" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
