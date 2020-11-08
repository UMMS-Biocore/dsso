const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const oauth2 = require('../utils/oauth2.js');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/login', viewsController.getLoginForm);
router.post('/login', authController.login);
router.get('/account', authController.protect, viewsController.getAccount);
router.get('/verifyEmail', authController.verifyEmail, viewsController.verifyEmail);
router.get('/googleLogin', oauth2.check_authorization, viewsController.getOverview);

// Google authentication
router.get('/auth/google', authController.googleLogin);
router.get('/auth/google/callback', authController.googleLoginCallback);

router.get('/dialog/authorize', oauth2.authorization);
// router.post('/dialog/authorize/decision', oauth2.decision);

module.exports = router;
