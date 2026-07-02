const express = require('express');
const diagnosisController = require('../controllers/diagnosis.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);

router.post('/lab', diagnosisController.createLab);
router.post('/radiology', diagnosisController.createRadiology);
router.post('/upload-report', upload.single('report'), diagnosisController.uploadReport);
router.get('/history', diagnosisController.history);
router.put('/approve', diagnosisController.approve);
router.delete('/cancel/:id', diagnosisController.cancel);

module.exports = router;
