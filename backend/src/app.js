const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const appConfig = require('./config');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const patientRoutes = require('./routes/patient.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const treatmentRoutes = require('./routes/treatment.routes');
const diagnosisRoutes = require('./routes/diagnosis.routes');
const pharmacyRoutes = require('./routes/pharmacy.routes');
const billingRoutes = require('./routes/billing.routes');
const insuranceRoutes = require('./routes/insurance.routes');
const consentRoutes = require('./routes/consent.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const auditRoutes = require('./routes/audit.routes');
const aiRoutes = require('./routes/ai.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const appointmentController = require('./controllers/appointment.controller');
const { authenticate } = require('./middleware/auth');
const { authorize } = require('./middleware/authorize');

const app = express();

app.use(helmet());
app.use(cors({ origin: appConfig.corsOrigin, credentials: true }));
app.use(morgan(appConfig.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.get('/health', async (_req, res) => {
  const { mongoose } = require('./config/database');
  res.json({
    success: true,
    service: 'MediChain HMS API',
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    fabricNetwork: appConfig.fabricNetworkPath,
  });
});

app.use('/uploads', express.static(path.resolve(appConfig.uploadDir)));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/ai', aiRoutes);
app.use('/appointments', appointmentRoutes);
app.post('/api/appointments/:id/accept', authenticate, authorize('doctor', 'clinical_staff', 'hospital_admin'), appointmentController.accept);
app.post('/appointments/:id/accept', authenticate, authorize('doctor', 'clinical_staff', 'hospital_admin'), appointmentController.accept);
app.use('/treatments', treatmentRoutes);
app.use('/diagnosis', diagnosisRoutes);
app.use('/pharmacy', pharmacyRoutes);
app.use('/billing', billingRoutes);
app.use('/insurance', insuranceRoutes);
app.use('/consent', consentRoutes);
app.use('/emergency', emergencyRoutes);
app.use('/audit', auditRoutes);
app.use('/ai', aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
