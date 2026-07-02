const express = require('express');
const patientController = require('../controllers/patient.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);

router.get('/', patientController.list);
router.post('/upload-document', upload.single('document'), patientController.uploadDocument);
router.get('/history', patientController.history);
router.get('/medical-history', patientController.medicalHistory);
router.get('/appointments', patientController.appointments);
router.get('/prescriptions', patientController.prescriptions);
router.post('/share-record', patientController.shareRecord);
router.delete('/share-record/:id', patientController.revokeShare);
router.get('/:id', patientController.getById);
router.put('/:id', patientController.update);

module.exports = router;
