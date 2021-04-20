const express = require('express');
const miscController = require('../controllers/miscController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/changelog').get(miscController.getChangeLog);

router.use(authController.isLoggedIn);
router.use(authController.requireLogin);

router
  .route('/getDnextUsers')
  .post(authController.restrictTo('admin'), miscController.getDnextUsers);

router
  .route('/importDnextUsers')
  .post(authController.restrictTo('admin'), miscController.importDnextUsers);

module.exports = router;
