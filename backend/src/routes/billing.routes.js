const express = require('express');
const billingController = require('../controllers/billing.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/auth.validator');

const router = express.Router();

router.use(authenticate);

router.post('/create', validate(schemas.billing), billingController.create);
router.get('/', billingController.list);
router.get('/:id', billingController.getById);
router.put('/', billingController.update);
router.put('/:id', billingController.update);
router.post('/payment', billingController.payment);
router.get('/invoice/:id?', billingController.invoice);
router.post('/download', billingController.download);

module.exports = router;
