const express = require('express');
const clientController = require('./../controllers/clientController');

const router = express.Router();

router.get('/info', clientController.info);

module.exports = router;
