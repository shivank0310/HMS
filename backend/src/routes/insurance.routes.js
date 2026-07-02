const express = require('express');
const insuranceController = require('../controllers/insurance.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/claim', insuranceController.submitClaim);
router.put('/approve/:id?', insuranceController.approve);
router.put('/reject/:id?', insuranceController.reject);
router.get('/history', insuranceController.history);
router.get('/policy/:patientId?', insuranceController.policy);
router.get('/payment', insuranceController.payment);

module.exports = router;
