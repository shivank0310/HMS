const express = require('express');
const treatmentController = require('../controllers/treatment.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/auth.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(schemas.treatment), treatmentController.create);
router.put('/:id', treatmentController.update);
router.get('/', treatmentController.list);
router.get('/:id', treatmentController.getById);
router.post('/:id/notes', treatmentController.addNotes);
router.post('/:id/vitals', treatmentController.addVitals);
router.post('/:id/discharge', treatmentController.discharge);
router.post('/:id/refer', treatmentController.refer);

module.exports = router;
