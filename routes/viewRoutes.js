const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const oauth2 = require('../utils/oauth2.js');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);
// for local login:
router.get('/signin', viewsController.getLocalLoginForm);
router.post('/signin', authController.removeReturnTo, authController.login);
// for SSO
router.get('/login', viewsController.getLoginForm);
router.post('/login', authController.login);
router.get('/account', authController.protect, viewsController.getAccount);
router.get('/verifyEmail', authController.verifyEmail, viewsController.verifyEmail);
router.get('/googleLogin', oauth2.check_authorization, viewsController.getOverview);

// Google authentication
router.get('/auth/google', authController.googleLogin);
router.get('/auth/google/callback', authController.googleLoginCallback);
// Google authentication for local login
router.get('/auth/googlesignin', authController.removeReturnTo, authController.googleLogin);

router.get('/dialog/authorize', oauth2.authorization);
// router.post('/dialog/authorize/decision', oauth2.decision);
router.get(
  '/profile',
  authController.isLoggedIn,
  authController.requireLogin,
  viewsController.getProfile
);

module.exports = router;
