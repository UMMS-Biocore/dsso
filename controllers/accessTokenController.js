const jwt = require('jsonwebtoken');
const AccessToken = require('../models/accessTokenModel');

/**
 * Returns an access token if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the access token to find.
 */
exports.find = async token => {
  const id = jwt.decode(token).jti;
  return await AccessToken.findOne({ id: id }, function(err, item) {
    console.log('accesstoken find:', err, item);
    if (err) {
      return err;
    }
    return item;
  });
};

/**
 * Saves a access token, expiration date, user id, client id, and scope. Note: The actual full
 * access token is never saved.  Instead just the ID of the token is saved.  In case of a database
 * breach this prevents anyone from stealing the live tokens.
 * @param   {Object}  token          - The access token (required)
 * @param   {Date}    expirationDate - The expiration of the access token (required)
 * @param   {String}  userID         - The user ID (required)
 * @param   {String}  clientID       - The client ID (required)
 * @param   {String}  scope          - The scope (optional)
 */
exports.save = async (token, expirationDate, userId, clientId, scope) => {
  try {
    const id = jwt.decode(token).jti;
    const newToken = new AccessToken({
      id: id,
      expirationDate: expirationDate,
      userId: userId,
      clientId: clientId,
      scope: scope
    });
    const saveToken = await newToken.save();
    console.log('**** AccessToken saved');
    return saveToken;
  } catch (err) {
    return err;
  }
};

/**
 * Deletes/Revokes an access token by getting the ID and removing it from the storage.
 * @param   {String}  token - The token to decode to get the id of the access token to delete.
 */
exports.delete = async token => {
  const id = jwt.decode(token).jti;
  return await AccessToken.findOneAndRemove({ id: id }, function(err, item) {
    console.log('AccessToken removed', item, err);
    if (err) {
      return err;
    }
    return item;
  });
};

/**
 * Removes expired access tokens. It does this by looping through them all and then removing the
 * expired ones it finds.
 */
// Removes expired access tokens.
exports.removeExpired = async function(done) {
  try {
    await AccessToken.find({ expirationDate: { $lt: Date.now() } }, async function(err, item) {
      if (item) {
        await AccessToken.find({ expirationDate: { $lt: Date.now() } }).deleteMany(function(err2) {
          return done(err2);
        });
      }
    });
  } catch (err) {
    done(err);
  }
  return done(null);
};
