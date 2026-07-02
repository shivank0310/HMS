const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const { authorizeMsp } = require('../middleware/authorize');
const audit = require('../middleware/audit');

const router = express.Router();

router.use(authenticate, authorizeMsp('HospitalAdminMSP'), audit('admin.access', 'admin'));

router.post('/patients', adminController.createPatient);
router.put('/patients/:id', adminController.updatePatient);
router.delete('/patients/:id', adminController.deletePatient);
router.post('/doctors', adminController.registerDoctor);
router.post('/labstaff', adminController.registerLabStaff);
router.post('/pharmacists', adminController.registerPharmacist);
router.post('/insurance', adminController.registerInsurance);
router.get('/dashboard', adminController.dashboard);
router.get('/statistics', adminController.statistics);

module.exports = router;
