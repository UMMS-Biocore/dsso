const validate = require('./../utils/validate');
const clients = require('./../controllers/clientController.js');
const accessTokens = require('./../controllers/accessTokenController.js');
const refreshTokens = require('./../controllers/refreshTokenController.js');

/**
 * This endpoint is for verifying a token.  This has the same signature to
 * Google's token verification system from:
 * https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
 *
 * You call it like so
 * https://localhost:3000/api/tokeninfo?access_token=someToken
 *
 * If the token is valid you get returned
 * {
 *   "audience": someClientId
 * }
 *
 * If the token is not valid you get a 400 Status and this returned
 * {
 *   "error": "invalid_token"
 * }
 * @param   {Object}  req - The request
 * @param   {Object}  res - The response
 * @returns {Promise} Returns the promise for testing only
 */
exports.info = async (req, res) => {
  try {
    await validate.tokenForHttp(req.query.access_token);
    const token = await accessTokens.find(req.query.access_token);
    const clientOrUserData = await validate.tokenExistsForHttp(token);
    const client = await clients.find(clientOrUserData.clientId);
    const validatedClient = validate.clientExistsForHttp(client);
    const expirationLeft = Math.floor((token.expirationDate.getTime() - Date.now()) / 1000);
    if (expirationLeft < 0) return res.status(400).json({ error: 'expired_token' });
    res.json({
      audience: validatedClient.clientId,
      scope: clientOrUserData.scope,
      user_id: clientOrUserData.userId,
      expires_in: expirationLeft
    });
  } catch (err) {
    res.status(err.status).json({ error: err.message });
  }
};

/**
 * This endpoint is for revoking a token.  This has the same signature to
 * Google's token revocation system from:
 * https://developers.google.com/identity/protocols/OAuth2WebServer
 *
 * You call it like so
 * https://localhost:3000/api/revoke?token=someToken
 *
 * If the token is valid you get returned a 200 and an empty object
 * {}
 *
 * If the token is not valid you get a 400 Status and this returned
 * {
 *   "error": "invalid_token"
 * }
 * This will first try to delete the token as an access token.  If one is not found it will try and
 * delete the token as a refresh token.  If both fail then an error is returned.
 * @param   {Object}  req - The request
 * @param   {Object}  res - The response
 * @returns {Promise} Returns the promise for testing
 */
exports.revoke = async (req, res) => {
  console.log('revoke');
  try {
    const tokenCheck = validate.tokenForHttp(req.query.token);
    console.log('tokenCheck', tokenCheck);
    const token = await accessTokens.delete(req.query.token);
    console.log('token', token);
    let tokenDeleted = token;
    if (token == null) {
      tokenDeleted = await refreshTokens.delete(req.query.token);
    }
    const validateTokenDel = validate.tokenExistsForHttp(tokenDeleted);
    console.log(validateTokenDel);
    res.json({});
  } catch (err) {
    res.status(err.status);
    res.json({ error: err.message });
  }
};
