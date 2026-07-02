const express = require('express');
const consentController = require('../controllers/consent.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/grant', consentController.grant);
router.post('/revoke', consentController.revoke);
router.get('/', consentController.list);
router.get('/history', consentController.history);
router.post('/emergency', consentController.emergency);

module.exports = router;
