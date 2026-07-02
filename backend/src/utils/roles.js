const ROLES = {
  HOSPITAL_ADMIN: 'hospital_admin',
  DOCTOR: 'doctor',
  CLINICAL_STAFF: 'clinical_staff',
  LAB_STAFF: 'lab_staff',
  PHARMACIST: 'pharmacist',
  INSURANCE: 'insurance',
  PATIENT: 'patient',
};

const ROLE_TO_MSP = {
  [ROLES.HOSPITAL_ADMIN]: 'HospitalAdminMSP',
  [ROLES.DOCTOR]: 'ClinicalStaffMSP',
  [ROLES.CLINICAL_STAFF]: 'ClinicalStaffMSP',
  [ROLES.LAB_STAFF]: 'DiagnosticStaffMSP',
  [ROLES.PHARMACIST]: 'PharmacyServicesMSP',
  [ROLES.INSURANCE]: 'InsuranceProviderMSP',
  [ROLES.PATIENT]: 'PatientAccessMSP',
};

const MSP_TO_ROLE = Object.entries(ROLE_TO_MSP).reduce((acc, [role, msp]) => {
  if (!acc[msp]) acc[msp] = role;
  return acc;
}, {});

module.exports = { ROLES, ROLE_TO_MSP, MSP_TO_ROLE };
