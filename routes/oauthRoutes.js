const express = require('express');
const oauth2 = require('./../utils/oauth2.js');

const router = express.Router();

router.post('/token', oauth2.token);

module.exports = router;
