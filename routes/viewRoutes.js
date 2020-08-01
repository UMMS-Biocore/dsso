const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const oauth2 = require('../utils/oauth2.js');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/account', authController.protect, viewsController.getAccount);

router.get('/dialog/authorize', oauth2.authorization);
// router.post('/dialog/authorize/decision', oauth2.decision);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post('/submit-user-data', authController.protect, viewsController.updateUserData);

module.exports = router;
