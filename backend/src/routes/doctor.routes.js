const express = require('express');
const doctorController = require('../controllers/doctor.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.get('/', authenticate, doctorController.list);
router.get('/profile', authenticate, doctorController.profile);
module.exports = router;
