// The refresh tokens outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshTokenModel');

/**
 * Returns a refresh token if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the refresh token to find.
 */
exports.find = async token => {
  const id = jwt.decode(token).jti;
  return await RefreshToken.findOne({ id: id }, function(err, item) {
    console.log('RefreshToken find err:', err);
    if (err) {
      return err;
    }
    return item;
  });
};

/**
 * Saves a refresh token, user id, client id, and scope. Note: The actual full refresh token is
 * never saved.  Instead just the ID of the token is saved.  In case of a database breach this
 * prevents anyone from stealing the live tokens.
 * @param   {Object}  token    - The refresh token (required)
 * @param   {String}  userID   - The user ID (required)
 * @param   {String}  clientID - The client ID (required)
 * @param   {String}  scope    - The scope (optional)
 */
exports.save = async (token, userId, clientId, scope) => {
  try {
    const id = jwt.decode(token).jti;
    const newToken = new RefreshToken({
      id: id,
      userId: userId,
      clientId: clientId,
      scope: scope
    });
    const saveToken = await newToken.save();
    console.log('**** RefreshToken saved');
    return saveToken;
  } catch (err) {
    return err;
  }
};

/**
 * Deletes a refresh token
 * @param   {String}  token - The token to decode to get the id of the refresh token to delete.
 */
exports.delete = async token => {
  const id = jwt.decode(token).jti;
  return await RefreshToken.findOneAndRemove({ id: id }, function(err, item) {
    console.log('RefreshToken delete err:', err);
    if (err) {
      return err;
    }
    return item;
  });
};
