const express = require('express');
const oauth2 = require('./../utils/oauth2.js');

const router = express.Router();

router.post('/token', oauth2.token);
router.get('/check', oauth2.check_authorization);

module.exports = router;
