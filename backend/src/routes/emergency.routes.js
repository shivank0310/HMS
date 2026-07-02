const express = require('express');
const emergencyController = require('../controllers/emergency.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/access', emergencyController.access);
router.post('/close', emergencyController.close);
router.get('/history', emergencyController.history);
router.get('/current', emergencyController.current);

module.exports = router;
