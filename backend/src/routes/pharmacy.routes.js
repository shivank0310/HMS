const express = require('express');
const pharmacyController = require('../controllers/pharmacy.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/inventory', pharmacyController.inventoryList);
router.post('/inventory', pharmacyController.inventoryCreate);
router.put('/inventory/:id', pharmacyController.inventoryUpdate);
router.delete('/inventory/:id', pharmacyController.inventoryDelete);
router.get('/prescriptions', pharmacyController.prescriptions);
router.post('/dispense', pharmacyController.dispense);
router.post('/return', pharmacyController.returnDrug);
router.get('/history', pharmacyController.history);

module.exports = router;
