const express = require('express');
const tokenController = require('./../controllers/tokenController');

const router = express.Router();

// Mimicking google's token info endpoint from
// https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
router.get('/info', tokenController.info);

// Mimicking google's token revoke endpoint from
// https://developers.google.com/identity/protocols/OAuth2WebServer
router.get('/revoke', tokenController.revoke);

module.exports = router;
