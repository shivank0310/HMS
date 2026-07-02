const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const schemas = require('../validators/auth.validator');

const router = express.Router();

router.post('/login', authLimiter, validate(schemas.login), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/register-user', validate(schemas.register), authController.registerUser);
router.post('/change-password', authenticate, validate(schemas.changePassword), authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/profile', authenticate, authController.profile);

module.exports = router;
