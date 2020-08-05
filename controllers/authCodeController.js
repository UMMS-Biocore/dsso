// The authorization codes.
// Use these to get the access codes to get to the data in your endpoints as outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)
const jwt = require('jsonwebtoken');
const AuthCode = require('../models/authCodeModel');

/**
 * Returns a authorization code if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the authorization token to find.
 */
exports.find = async token => {
  const id = jwt.decode(token).jti;
  return await AuthCode.findOne({ id: id }, function(err, item) {
    console.log('authorization code find err:', err);
    console.log('authorization code find item:', item);
    if (err) {
      return err;
    }
    return item;
  });
};

/**
 * Saves a authorization code, client id, redirect uri, user id, and scope. Note: The actual full
 * authorization token is never saved.  Instead just the ID of the token is saved.  In case of a
 * database breach this prevents anyone from stealing the live tokens.
 * @param   {String}  code        - The authorization code (required)
 * @param   {String}  clientID    - The client ID (required)
 * @param   {String}  redirectURI - The redirect URI of where to send access tokens once exchanged
 * @param   {String}  userID      - The user ID (required)
 * @param   {String}  scope       - The scope (optional)
 */
exports.save = async (code, clientId, redirectUri, userId, scope) => {
  try {
    console.log('**** authorization code will be saved');
    const id = jwt.decode(code).jti;
    const newToken = new AuthCode({
      id: id,
      clientId: clientId,
      redirectUri: redirectUri,
      userId: userId,
      scope: scope
    });
    const saveToken = await newToken.save();
    console.log('**** authorization code saved');
    console.log('savedToken: ', saveToken);
    return saveToken;
  } catch (err) {
    console.log(err);
    return err;
  }
};

/**
 * Deletes an authorization code
 * @param   {String}  token - The authorization code to delete
 */
exports.delete = async token => {
  const id = jwt.decode(token).jti;
  console.log(id);
  return await AuthCode.findOneAndRemove({ id: id }, function(err, item) {
    console.log('authorization delete err:', err);
    console.log('authorization delete item:', item);
    if (err) {
      return err;
    }
    return item;
  });
};
