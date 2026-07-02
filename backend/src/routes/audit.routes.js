const express = require('express');
const auditController = require('../controllers/audit.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/logs', auditController.logs);
router.get('/history', auditController.history);
router.get('/patient/:patientId?', auditController.patient);
router.get('/download', auditController.download);
router.get('/export', auditController.exportData);

module.exports = router;
