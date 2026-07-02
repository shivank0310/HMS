const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/auth.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(schemas.appointment), appointmentController.create);
router.get('/', appointmentController.list);
router.get('/:id', appointmentController.getById);
router.put('/:id', appointmentController.update);
router.delete('/:id', appointmentController.remove);
router.post('/check-in', appointmentController.checkIn);
router.post('/check-out', appointmentController.checkOut);

module.exports = router;
