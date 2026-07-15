import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ItemRow from '@/components/ui/ItemRow';
import MetricCard from '@/components/ui/MetricCard';
import ProgressBar from '@/components/ui/ProgressBar';
import BlockchainStatus from '@/components/dashboards/BlockchainStatus';
import { chainSyncedValue, metricValue } from '@/components/dashboards/dashboardMetrics';
import {
  bookAppointment,
  getPatient,
  getPatientAppointments,
  getPatientHistory,
  getPatientMedicalHistory,
  getPatientPrescriptions,
  sharePatientRecord,
  type AppointmentRecord,
  type MedicalHistoryRecord,
  type PatientRecord,
  type RecordUpdatePayload,
  type ShareRecordPayload,
  type AppointmentCreatePayload,
  updatePatient,
  uploadPatientDocument,
  revokeSharedRecord,
} from '@/services/patient';
import type { DoctorRecord } from '@/services/doctor';
import type { DashboardComponentProps } from '@/types';
import './PatientDashboard.css';

const emptyProfileForm = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
};

const emptyBookingForm = {
  doctorId: '',
  scheduledAt: '',
  reason: '',
  notes: '',
};

const emptyShareForm = {
  sharedWith: '',
  recordType: 'medical_history',
  recordId: '',
  expiresAt: '',
};

function formatDateTime(value?: string | null) {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function recordCount(value: unknown[] | undefined) {
  return value?.length ?? 0;
}

function stringifyRecord(value: unknown) {
  if (value === null || value === undefined) return 'Unknown';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    return String(
      objectValue.title ??
        objectValue.name ??
        objectValue.fullName ??
        objectValue.reason ??
        objectValue.diagnosis ??
        objectValue.id ??
        'Record',
    );
  }
  return 'Record';
}

function firstDefined(...values: Array<string | null | undefined>) {
  return values.find((value) => value && value.trim()) ?? '';
}

export default function PatientDashboard({
  activeMenu,
  dashboardData,
  isLoading,
  error,
  accessToken,
  patientId,
  onSelectMenu,
}: DashboardComponentProps) {
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [history, setHistory] = useState<MedicalHistoryRecord | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryRecord | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<unknown[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState('');
  const [bookingForm, setBookingForm] = useState(emptyBookingForm);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentMessage, setDocumentMessage] = useState('');
  const [documentError, setDocumentError] = useState('');
  const [documentUploading, setDocumentUploading] = useState(false);
  const [shareForm, setShareForm] = useState(emptyShareForm);
  const [shareMessage, setShareMessage] = useState('');
  const [shareError, setShareError] = useState('');
  const [shareSubmitting, setShareSubmitting] = useState(false);
  const [lastShareId, setLastShareId] = useState('');
  const [revokeId, setRevokeId] = useState('');
  const [revokeMessage, setRevokeMessage] = useState('');
  const [revokeError, setRevokeError] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const dashboardPatient = (dashboardData?.records?.patients?.[0] as PatientRecord | undefined) ?? null;
  const dashboardDoctors = (dashboardData?.records?.doctors ?? []) as DoctorRecord[];
  const resolvedPatientId = dashboardPatient?.id || patientId || '';
  const activePatient = patient ?? dashboardPatient;
  const doctorDirectory = doctors.length ? doctors : dashboardDoctors;
  const availableDepartments = Array.from(new Set(doctorDirectory.map((doctor) => doctor.department).filter(Boolean))) as string[];
  const doctorsByDepartment = selectedDepartment ? doctorDirectory.filter((doctor) => doctor.department === selectedDepartment) : doctorDirectory;

  const isOverview = activeMenu === 'Health Overview';
  const showBooking = activeMenu === 'Book Appointment';
  const showAppointments = isOverview || activeMenu === 'Appointments' || showBooking;
  const showMedications = isOverview || activeMenu === 'Medications';
  const showRecords = isOverview || activeMenu === 'Medical Records';
  const showGoals = isOverview || activeMenu === 'Health Goals';

  useEffect(() => {
    if (!accessToken || !dashboardPatient || !resolvedPatientId) return;

    let cancelled = false;
    setPortalLoading(true);
    setPortalError('');

    Promise.all([
      getPatient(accessToken, resolvedPatientId, false),
      getPatientHistory(accessToken, resolvedPatientId),
      getPatientMedicalHistory(accessToken, resolvedPatientId),
      getPatientAppointments(accessToken, resolvedPatientId),
      getPatientPrescriptions(accessToken, resolvedPatientId),
    ])
      .then(([patientData, historyData, medicalHistoryData, appointmentData, prescriptionData]) => {
        if (cancelled) return;

        setPatient(patientData);
        setHistory(historyData);
        setMedicalHistory(medicalHistoryData);
        setAppointments(appointmentData);
        setPrescriptions(prescriptionData);
        setDoctors(dashboardDoctors);
        setSelectedDepartment((dashboardDoctors.find((doctor) => doctor.department)?.department as string) || '');
        setProfileForm({
          fullName: firstDefined(patientData.fullName),
          dateOfBirth: firstDefined(patientData.dateOfBirth),
          gender: firstDefined(patientData.gender),
          bloodGroup: firstDefined(patientData.bloodGroup),
          contactEmail: firstDefined(patientData.contactEmail),
          contactPhone: firstDefined(patientData.contactPhone),
          address: firstDefined(patientData.address),
        });
      })
      .catch((fetchError: Error) => {
        if (!cancelled) {
          setPortalError(fetchError.message || 'Patient data is unavailable');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPortalLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, dashboardDoctors, dashboardPatient, resolvedPatientId]);

  useEffect(() => {
    if (!dashboardDoctors.length) return;
    setDoctors(dashboardDoctors);
    if (!selectedDepartment) {
      setSelectedDepartment((dashboardDoctors.find((doctor) => doctor.department)?.department as string) || '');
    }
  }, [dashboardDoctors, selectedDepartment]);

  useEffect(() => {
    if (!activePatient) return;
    setProfileForm({
      fullName: firstDefined(activePatient.fullName),
      dateOfBirth: firstDefined(activePatient.dateOfBirth),
      gender: firstDefined(activePatient.gender),
      bloodGroup: firstDefined(activePatient.bloodGroup),
      contactEmail: firstDefined(activePatient.contactEmail),
      contactPhone: firstDefined(activePatient.contactPhone),
      address: firstDefined(activePatient.address),
    });
  }, [activePatient]);

  const openBookingPage = () => {
    onSelectMenu?.('Book Appointment');
  };

  const handleBookingChange = (field: keyof typeof emptyBookingForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBookingForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleProfileChange = (field: keyof typeof emptyProfileForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleShareChange = (field: keyof typeof emptyShareForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShareForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleDepartmentChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextDepartment = event.target.value;
    setSelectedDepartment(nextDepartment);
    const firstDoctor = nextDepartment ? doctors.find((doctor) => doctor.department === nextDepartment) : doctors[0];
    setBookingForm((current) => ({
      ...current,
      doctorId: firstDoctor?.id || '',
    }));
  };

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken || !resolvedPatientId) {
      setBookingError('Missing session details for booking.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingMessage('');

    const payload: AppointmentCreatePayload = {
      patientId: resolvedPatientId,
      scheduledAt: new Date(bookingForm.scheduledAt).toISOString(),
      doctorId: bookingForm.doctorId || undefined,
      reason: bookingForm.reason || undefined,
      notes: bookingForm.notes || undefined,
    };

    try {
      const created = await bookAppointment(accessToken, payload);
      setBookingMessage(`Appointment ${created.id} booked for ${formatDateTime(created.scheduledAt)}.`);
      setBookingForm(emptyBookingForm);
      const refreshedAppointments = await getPatientAppointments(accessToken, resolvedPatientId);
      setAppointments(refreshedAppointments);
    } catch (submitError) {
      setBookingError(submitError instanceof Error ? submitError.message : 'Unable to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken || !resolvedPatientId) {
      setProfileError('Missing session details for profile update.');
      return;
    }

    setProfileSaving(true);
    setProfileError('');
    setProfileMessage('');

    const payload: RecordUpdatePayload = {
      fullName: profileForm.fullName,
      dateOfBirth: profileForm.dateOfBirth || undefined,
      gender: profileForm.gender || undefined,
      bloodGroup: profileForm.bloodGroup || undefined,
      contactEmail: profileForm.contactEmail || undefined,
      contactPhone: profileForm.contactPhone || undefined,
      address: profileForm.address || undefined,
    };

    try {
      const updated = await updatePatient(accessToken, resolvedPatientId, payload);
      setPatient(updated);
      setProfileMessage('Profile synced to the patient ledger and blockchain metadata.');
    } catch (submitError) {
      setProfileError(submitError instanceof Error ? submitError.message : 'Unable to update patient profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken || !resolvedPatientId) {
      setDocumentError('Missing session details for document upload.');
      return;
    }

    if (!documentFile) {
      setDocumentError('Please choose a file first.');
      return;
    }

    setDocumentUploading(true);
    setDocumentError('');
    setDocumentMessage('');

    try {
      await uploadPatientDocument(accessToken, {
        patientId: resolvedPatientId,
        file: documentFile,
        metadata: {
          source: 'patient-portal',
          uploadedAt: new Date().toISOString(),
        },
      });
      setDocumentMessage('Document uploaded and queued for secure storage.');
      setDocumentFile(null);
    } catch (uploadError) {
      setDocumentError(uploadError instanceof Error ? uploadError.message : 'Unable to upload document');
    } finally {
      setDocumentUploading(false);
    }
  };

  const handleShareSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken || !resolvedPatientId) {
      setShareError('Missing session details for record sharing.');
      return;
    }

    setShareSubmitting(true);
    setShareError('');
    setShareMessage('');

    const payload: ShareRecordPayload = {
      patientId: resolvedPatientId,
      sharedWith: shareForm.sharedWith,
      recordType: shareForm.recordType,
      recordId: shareForm.recordId || undefined,
      expiresAt: shareForm.expiresAt || undefined,
    };

    try {
      const result = await sharePatientRecord(accessToken, payload);
      const shareId = typeof result === 'object' && result && 'id' in result ? String((result as { id: string }).id) : '';
      if (shareId) {
        setLastShareId(shareId);
        setRevokeId(shareId);
      }
      setShareMessage('Record shared successfully.');
      setShareForm(emptyShareForm);
    } catch (submitError) {
      setShareError(submitError instanceof Error ? submitError.message : 'Unable to share record');
    } finally {
      setShareSubmitting(false);
    }
  };

  const handleRevokeShare = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) {
      setRevokeError('Missing session details for share revocation.');
      return;
    }
    if (!revokeId.trim()) {
      setRevokeError('Please provide a share ID to revoke.');
      return;
    }

    setRevokeLoading(true);
    setRevokeError('');
    setRevokeMessage('');

    try {
      await revokeSharedRecord(accessToken, revokeId.trim());
      setRevokeMessage(`Share ${revokeId.trim()} revoked.`);
      setRevokeId('');
    } catch (revokeError) {
      setRevokeError(revokeError instanceof Error ? revokeError.message : 'Unable to revoke share');
    } finally {
      setRevokeLoading(false);
    }
  };

  return (
    <div className="dashboard-tab patient-dashboard">
      <div className="tab-heading">
        <span>{activeMenu}</span>
      </div>
      <BlockchainStatus data={dashboardData} isLoading={isLoading} error={error} />
      {portalError ? <Alert tone="danger">{portalError}</Alert> : null}
      {portalLoading ? <Alert tone="info">Loading your patient portal from the hospital network...</Alert> : null}

      {(isOverview || activeMenu === 'Health Goals') ? (
        <div className="grid-4">
          <MetricCard icon="👤" tone="cyan" label="Patient Profile" value={metricValue(dashboardData, 'patientName', activePatient?.fullName || 'Patient')} note="Synced from /api/patients/:id" />
          <MetricCard icon="📅" tone="green" label="Appointments" value={String(appointments.length || metricValue(dashboardData, 'appointments', 0))} note="Loaded from patient appointments API" />
          <MetricCard icon="🩺" tone="amber" label="Active Treatments" value={String(recordCount(medicalHistory?.treatments) || metricValue(dashboardData, 'activeTreatments', 0))} note="Medical history from blockchain-backed backend" />
          <MetricCard icon="⛓️" tone="purple" label="Chain Synced" value={chainSyncedValue(dashboardData)} note="Patient records and dashboard metadata" />
        </div>
      ) : null}

      {isOverview ? (
        <div className="grid-2 mt3">
          <div className="card">
            <div className="card-title">🗓️ Appointment Booking</div>
            <div className="card-sub">Jump straight into the booking page or start a new visit request.</div>
            <div className="mini-stats">
              <div>
                <div className="mini-stat-value mini-stat-cyan">{appointments.length}</div>
                <div className="mini-stat-label">Total appointments</div>
              </div>
              <div>
                <div className="mini-stat-value mini-stat-green">{recordCount(prescriptions)}</div>
                <div className="mini-stat-label">Prescriptions</div>
              </div>
            </div>
            <Button block onClick={openBookingPage}>
              Book an Appointment
            </Button>
          </div>

          <div className="card">
            <div className="card-title">⛓️ Blockchain Snapshot</div>
            <div className="card-sub">Patient ledger status and integrity checks</div>
            <ItemRow
              title="Identity verification"
              subtitle={patient?.chainVerification?.verified ? 'Verified against chain' : 'Verification pending'}
              right={<Badge tone={patient?.chainVerification?.verified ? 'success' : 'warning'}>{patient?.chainVerification?.verified ? 'Verified' : 'Pending'}</Badge>}
            />
            <ItemRow
              title="Medical history"
              subtitle={`${recordCount(history?.treatments)} treatments, ${recordCount(history?.diagnoses)} diagnoses`}
              right={<Badge tone="info">Ledger data</Badge>}
            />
            <ItemRow
              title="Document uploads"
              subtitle="Stored off-chain and referenced by the backend"
              right={<Badge tone="purple">Secure</Badge>}
            />
          </div>
        </div>
      ) : null}

      {showBooking ? (
        <div className="grid-2 mt3">
          <div className="card">
            <div className="card-title">🗓️ Book an Appointment</div>
            <div className="card-sub">Submit a new appointment request to the backend appointment route.</div>
            {bookingMessage ? <Alert tone="success">{bookingMessage}</Alert> : null}
            {bookingError ? <Alert tone="danger">{bookingError}</Alert> : null}
            <form className="portal-form" onSubmit={handleBookingSubmit}>
              <label>
                Department
                <select value={selectedDepartment} onChange={handleDepartmentChange}>
                  <option value="">All departments</option>
                  {availableDepartments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Preferred Doctor
                <select value={bookingForm.doctorId} onChange={handleBookingChange('doctorId')}>
                  <option value="">Select a doctor</option>
                  {doctorsByDepartment.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.id}
                      {doctor.department ? ` · ${doctor.department}` : ''}
                      {doctor.specialization ? ` · ${doctor.specialization}` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Appointment Date & Time
                <input
                  type="datetime-local"
                  value={bookingForm.scheduledAt}
                  onChange={handleBookingChange('scheduledAt')}
                  required
                />
              </label>
              <label className="portal-span-2">
                Reason for Visit
                <input
                  type="text"
                  value={bookingForm.reason}
                  onChange={handleBookingChange('reason')}
                  placeholder="Follow-up, consultation, test review..."
                />
              </label>
              <label className="portal-span-2">
                Notes
                <textarea
                  value={bookingForm.notes}
                  onChange={handleBookingChange('notes')}
                  placeholder="Any extra context for the clinician"
                  rows={4}
                />
              </label>
              <div className="portal-actions portal-span-2">
                <Button type="submit" disabled={bookingLoading}>
                  {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setBookingForm(emptyBookingForm)}>
                  Clear
                </Button>
              </div>
            </form>
            <div className="portal-divider" />
            <div className="card-sub">Registered doctors</div>
            {doctors.length ? (
              doctorsByDepartment.map((doctor) => (
                <ItemRow
                  key={doctor.id}
                  title={`${doctor.department || 'General'} · ${doctor.id}`}
                  subtitle={doctor.specialization || 'No specialization listed'}
                  right={<Badge tone="info">{doctor.department || 'Dept'}</Badge>}
                />
              ))
            ) : (
              <Alert tone="info">No doctor directory available yet. Ask an admin to register doctors first.</Alert>
            )}
          </div>

          <div className="card">
            <div className="card-title">📅 Upcoming Appointments</div>
            <div className="card-sub">Latest appointment feed from /api/patients/appointments</div>
            {appointments.length ? (
              appointments.slice(0, 5).map((appointment) => (
                <ItemRow
                  key={appointment.id}
                  title={`${appointment.reason || 'General consultation'} · ${appointment.status || 'scheduled'}`}
                  subtitle={`${formatDateTime(appointment.scheduledAt)}${appointment.doctorId ? ` · Doctor ${appointment.doctorId}` : ''}`}
                  right={<Badge tone={appointment.status === 'completed' ? 'success' : appointment.status === 'checked_in' ? 'info' : 'warning'}>{appointment.status || 'scheduled'}</Badge>}
                />
              ))
            ) : (
              <Alert tone="info">No appointments returned yet. Book the first one from the form on this page.</Alert>
            )}
          </div>
        </div>
      ) : null}

      {showAppointments && !showBooking ? (
        <div className="card mt3">
          <div className="card-title">📅 Appointment History</div>
          <div className="card-sub">Fetched from the patient appointment endpoint.</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Appointment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Doctor</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length ? (
                  appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.reason || appointment.notes || appointment.id}</td>
                      <td>{formatDateTime(appointment.scheduledAt)}</td>
                      <td>{appointment.status || 'scheduled'}</td>
                      <td>{appointment.doctorId || 'Any available'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>No appointment records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {showMedications ? (
        <div className="card mt3">
          <div className="card-title">💊 Current Medications</div>
          <div className="card-sub">Active prescriptions from the patient medical history endpoint.</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Prescription</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.length ? (
                  prescriptions.map((item, index) => {
                    const record = item as Record<string, unknown>;
                    return (
                      <tr key={record.id ? String(record.id) : `${index}`}>
                        <td>{stringifyRecord(item)}</td>
                        <td>{record.status ? String(record.status) : record.prescribedAt ? formatDateTime(String(record.prescribedAt)) : 'Prescription record'}</td>
                        <td>{record.status ? <Badge tone="success">{String(record.status)}</Badge> : <Badge tone="info">Recorded</Badge>}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3}>No prescriptions available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {showRecords ? (
        <div className="grid-2 mt3">
          <div className="card">
            <div className="card-title">📄 Patient Profile</div>
            <div className="card-sub">Loaded from `/api/patients/:id` and verified in the background when available.</div>
            {profileMessage ? <Alert tone="success">{profileMessage}</Alert> : null}
            {profileError ? <Alert tone="danger">{profileError}</Alert> : null}
            <form className="portal-form" onSubmit={handleProfileSubmit}>
              <label>
                Full Name
                <input type="text" value={profileForm.fullName} onChange={handleProfileChange('fullName')} required />
              </label>
              <label>
                Date of Birth
                <input type="date" value={profileForm.dateOfBirth} onChange={handleProfileChange('dateOfBirth')} />
              </label>
              <label>
                Gender
                <input type="text" value={profileForm.gender} onChange={handleProfileChange('gender')} />
              </label>
              <label>
                Blood Group
                <input type="text" value={profileForm.bloodGroup} onChange={handleProfileChange('bloodGroup')} />
              </label>
              <label>
                Contact Email
                <input type="email" value={profileForm.contactEmail} onChange={handleProfileChange('contactEmail')} />
              </label>
              <label>
                Contact Phone
                <input type="text" value={profileForm.contactPhone} onChange={handleProfileChange('contactPhone')} />
              </label>
              <label className="portal-span-2">
                Address
                <textarea value={profileForm.address} onChange={handleProfileChange('address')} rows={3} />
              </label>
              <div className="portal-actions portal-span-2">
                <Button type="submit" disabled={profileSaving}>
                  {profileSaving ? 'Saving...' : 'Sync Profile'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setProfileForm({
                      fullName: firstDefined(activePatient?.fullName),
                      dateOfBirth: firstDefined(activePatient?.dateOfBirth),
                      gender: firstDefined(activePatient?.gender),
                      bloodGroup: firstDefined(activePatient?.bloodGroup),
                      contactEmail: firstDefined(activePatient?.contactEmail),
                      contactPhone: firstDefined(activePatient?.contactPhone),
                      address: firstDefined(activePatient?.address),
                    })
                  }
                >
                  Reset
                </Button>
              </div>
            </form>
          </div>

          <div className="card">
            <div className="card-title">📁 Upload & Share Records</div>
            <div className="card-sub">Documents and sharing requests are persisted by the backend and logged on chain.</div>

            {documentMessage ? <Alert tone="success">{documentMessage}</Alert> : null}
            {documentError ? <Alert tone="danger">{documentError}</Alert> : null}
            <form className="portal-form portal-form-stack" onSubmit={handleUploadSubmit}>
              <label>
                Upload Document
                <input type="file" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} />
              </label>
              <Button type="submit" disabled={documentUploading}>
                {documentUploading ? 'Uploading...' : 'Upload to Secure Storage'}
              </Button>
            </form>

            <div className="portal-divider" />

            {shareMessage ? <Alert tone="success">{shareMessage}</Alert> : null}
            {shareError ? <Alert tone="danger">{shareError}</Alert> : null}
            <form className="portal-form" onSubmit={handleShareSubmit}>
              <label>
                Share With
                <input type="text" value={shareForm.sharedWith} onChange={handleShareChange('sharedWith')} placeholder="doctor, lab, insurer..." required />
              </label>
              <label>
                Record Type
                <select value={shareForm.recordType} onChange={handleShareChange('recordType')}>
                  <option value="medical_history">Medical History</option>
                  <option value="appointment">Appointment</option>
                  <option value="prescription">Prescription</option>
                  <option value="document">Document</option>
                </select>
              </label>
              <label>
                Record ID
                <input type="text" value={shareForm.recordId} onChange={handleShareChange('recordId')} placeholder="Optional record identifier" />
              </label>
              <label>
                Expiry
                <input type="datetime-local" value={shareForm.expiresAt} onChange={handleShareChange('expiresAt')} />
              </label>
              <div className="portal-actions portal-span-2">
                <Button type="submit" disabled={shareSubmitting}>
                  {shareSubmitting ? 'Sharing...' : 'Share Record'}
                </Button>
                <span className="portal-inline-note">
                  Latest share ID: {lastShareId || 'none yet'}
                </span>
              </div>
            </form>

            <form className="portal-form portal-form-stack mt2" onSubmit={handleRevokeShare}>
              <label>
                Revoke Share ID
                <input type="text" value={revokeId} onChange={(event) => setRevokeId(event.target.value)} placeholder="Paste a share ID to revoke" />
              </label>
              {revokeMessage ? <Alert tone="success">{revokeMessage}</Alert> : null}
              {revokeError ? <Alert tone="danger">{revokeError}</Alert> : null}
              <Button type="submit" variant="secondary" disabled={revokeLoading}>
                {revokeLoading ? 'Revoking...' : 'Revoke Share'}
              </Button>
            </form>
          </div>
        </div>
      ) : null}

      {showGoals ? (
        <div className="grid-2 mt3">
          <div className="card">
            <div className="card-title">🎯 Health Goals</div>
            <div className="card-sub">Your wellness progress</div>
            <div className="mt1">
              <ProgressBar label="Weight Loss Goal" value="68%" percent={68} gradient="linear-gradient(90deg,var(--green),var(--cyan))" />
              <ProgressBar label="Exercise Routine" value="45%" percent={45} gradient="linear-gradient(90deg,var(--cyan),var(--purple))" />
              <ProgressBar label="Sleep Schedule" value="82%" percent={82} gradient="linear-gradient(90deg,var(--amber),var(--green))" />
              <ProgressBar label="Medication Adherence" value="95%" percent={95} gradient="linear-gradient(90deg,var(--purple),var(--cyan))" />
            </div>
          </div>

          <div className="card">
            <div className="card-title">📊 Medical History Summary</div>
            <div className="card-sub">Pulled from `/api/patients/history` and `/api/patients/medical-history`.</div>
            <ItemRow title="Treatments" subtitle={`${recordCount(history?.treatments)} treatment entries`} right={<Badge tone="info">History</Badge>} />
            <ItemRow title="Diagnoses" subtitle={`${recordCount(history?.diagnoses)} diagnosis entries`} right={<Badge tone="warning">Clinical</Badge>} />
            <ItemRow title="Prescriptions" subtitle={`${recordCount(history?.prescriptions)} prescription entries`} right={<Badge tone="success">Medication</Badge>} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
