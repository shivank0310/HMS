const express = require('express');
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/diagnosis', aiController.diagnosis);
router.post('/prescription', aiController.prescription);
router.post('/risk-analysis', aiController.riskAnalysis);
router.post('/drug-interaction', aiController.drugInteraction);
router.post('/read-xray', aiController.readXray);
router.post('/read-mri', aiController.readMri);
router.post('/chat', aiController.chat);
router.post('/symptom-checker', aiController.symptomChecker);
router.get('/history', aiController.history);

module.exports = router;
