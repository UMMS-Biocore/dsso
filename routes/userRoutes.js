const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

// router.post('/signup', authController.signup);
router.get('/logout', authController.logout);
router.get('/info', userController.userinfo); //passport.authenticate('bearer')

// Protect all routes after this middleware
// router.use(authController.protect);

module.exports = router;
